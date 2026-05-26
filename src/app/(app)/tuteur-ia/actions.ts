"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getTutorResponse } from "@/lib/claude/tutor";
import type { TutorContext, TutorMessage } from "@/lib/claude/types";
import { checkQuota, incrementUsage } from "@/lib/claude/quota";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type LanguagePref = Database["public"]["Enums"]["language_pref"];
const CHAPTER_CONTENT_EXCERPT_LENGTH = 4_000;
const CONVERSATION_TITLE_MAX_LENGTH = 60;

const conversationIdSchema = z.string().uuid();
const userMessageSchema = z.string().trim().min(1).max(8_000);
const chapterSlugSchema = z.string().trim().min(1).max(200);
const languagePrefSchema = z.enum(["fr", "ar", "darija"]);

async function requireStudent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?next=/app/tuteur-ia");

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, first_name, language_preference")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "student") {
    redirect("/connexion");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("filiere")
    .eq("user_id", user.id)
    .single();

  if (studentError || !student) {
    throw new Error("Profil élève introuvable.");
  }

  return {
    supabase,
    studentId: user.id,
    firstName: profile.first_name,
    language: (profile.language_preference ?? "fr") as LanguagePref,
    filiere: student.filiere,
  };
}

function buildConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, " ").trim();
  if (cleaned.length <= CONVERSATION_TITLE_MAX_LENGTH) return cleaned;
  return `${cleaned.slice(0, CONVERSATION_TITLE_MAX_LENGTH - 1)}…`;
}

async function resolveChapterIdBySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  chapterSlug: string,
): Promise<string | null> {
  const parsed = chapterSlugSchema.safeParse(chapterSlug);
  if (!parsed.success) return null;

  const { data, error } = await supabase
    .from("chapters")
    .select("id")
    .eq("slug", parsed.data)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function getOwnedConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  conversationId: string,
) {
  const id = conversationIdSchema.parse(conversationId);

  const { data, error } = await supabase
    .from("ai_conversations")
    .select(
      "id, user_id, context_chapter_id, language, message_count, title, total_tokens_used",
    )
    .eq("id", id)
    .eq("user_id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Conversation introuvable.");

  return data;
}

async function loadChapterContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  chapterId: string,
): Promise<{ title: string; excerpt: string } | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("title, content")
    .eq("id", chapterId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const excerpt = (data.content ?? "").slice(0, CHAPTER_CONTENT_EXCERPT_LENGTH);

  return { title: data.title, excerpt };
}

async function buildTutorContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    language: LanguagePref;
    firstName: string;
    filiere: string;
    contextChapterId: string | null;
  },
): Promise<TutorContext> {
  const context: TutorContext = {
    language: params.language,
    studentFirstName: params.firstName,
    studentFiliere: params.filiere,
  };

  if (params.contextChapterId) {
    const chapter = await loadChapterContext(
      supabase,
      params.contextChapterId,
    );
    if (chapter) {
      context.chapterTitle = chapter.title;
      context.chapterContent = chapter.excerpt;
    }
  }

  return context;
}

function mapRowsToTutorMessages(
  rows: { role: string; content: string }[],
): TutorMessage[] {
  return rows
    .filter(
      (row): row is TutorMessage =>
        (row.role === "user" || row.role === "assistant") &&
        typeof row.content === "string",
    )
    .map((row) => ({
      role: row.role as TutorMessage["role"],
      content: row.content,
    }));
}

export type TutorConversationSummary = {
  id: string;
  title: string | null;
  updated_at: string | null;
  message_count: number | null;
};

export type TutorConversationMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string | null;
};

export type SendMessageResult =
  | { error: "quota_exceeded"; remaining: 0 }
  | {
      success: true;
      response: string;
      remaining: number | "unlimited";
    };

export type TutorConversationDetail = {
  id: string;
  title: string | null;
  language: LanguagePref;
  chapterTitle: string | null;
};

export type TutorPageContext = {
  firstName: string;
  defaultLanguage: LanguagePref;
  quota: Awaited<ReturnType<typeof checkQuota>>;
  conversations: TutorConversationSummary[];
};

/** Données initiales de la page tuteur IA. */
export async function getTutorPageContext(): Promise<TutorPageContext> {
  const { supabase, studentId, firstName, language } = await requireStudent();

  const [quota, conversationsResult] = await Promise.all([
    checkQuota(studentId),
    supabase
      .from("ai_conversations")
      .select("id, title, updated_at, message_count")
      .eq("user_id", studentId)
      .order("updated_at", { ascending: false, nullsFirst: false }),
  ]);

  if (conversationsResult.error) {
    throw new Error(conversationsResult.error.message);
  }

  return {
    firstName,
    defaultLanguage: language,
    quota,
    conversations: conversationsResult.data ?? [],
  };
}

/** Métadonnées d'une conversation (titre, langue, chapitre lié). */
export async function getConversationDetail(
  conversationId: string,
): Promise<TutorConversationDetail> {
  const { supabase, studentId } = await requireStudent();
  const conversation = await getOwnedConversation(
    supabase,
    studentId,
    conversationId,
  );

  let chapterTitle: string | null = null;
  if (conversation.context_chapter_id) {
    const { data, error } = await supabase
      .from("chapters")
      .select("title")
      .eq("id", conversation.context_chapter_id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    chapterTitle = data?.title ?? null;
  }

  return {
    id: conversation.id,
    title: conversation.title,
    language: (conversation.language ?? "fr") as LanguagePref,
    chapterTitle,
  };
}

/** Met à jour la langue de réponse du tuteur pour une conversation. */
export async function updateConversationLanguage(
  conversationId: string,
  language: LanguagePref,
): Promise<void> {
  const parsedLanguage = languagePrefSchema.parse(language);
  const { supabase, studentId } = await requireStudent();
  await getOwnedConversation(supabase, studentId, conversationId);

  const { error } = await supabase
    .from("ai_conversations")
    .update({ language: parsedLanguage })
    .eq("id", conversationIdSchema.parse(conversationId))
    .eq("user_id", studentId);

  if (error) throw new Error(error.message);
}

/** Crée une conversation tuteur IA (optionnellement liée à un chapitre). */
export async function createConversation(
  chapterSlug?: string,
): Promise<string> {
  const { supabase, studentId, language } = await requireStudent();

  let contextChapterId: string | null = null;
  if (chapterSlug?.trim()) {
    contextChapterId = await resolveChapterIdBySlug(supabase, chapterSlug);
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: studentId,
      title: null,
      context_chapter_id: contextChapterId,
      language,
      message_count: 0,
      total_tokens_used: 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Envoie un message élève et retourne la réponse du tuteur. */
export async function sendMessage(
  conversationId: string,
  userMessage: string,
): Promise<SendMessageResult> {
  const parsedMessage = userMessageSchema.safeParse(userMessage);
  if (!parsedMessage.success) {
    throw new Error("Message invalide.");
  }

  const { supabase, studentId, firstName, filiere } = await requireStudent();

  const quotaBefore = await checkQuota(studentId);
  if (!quotaBefore.allowed) {
    return { error: "quota_exceeded", remaining: 0 };
  }

  const conversation = await getOwnedConversation(
    supabase,
    studentId,
    conversationId,
  );

  const language = (conversation.language ?? "fr") as LanguagePref;

  const { data: historyRows, error: historyError } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (historyError) throw new Error(historyError.message);

  const isFirstMessage = (historyRows?.length ?? 0) === 0;
  const priorMessages = mapRowsToTutorMessages(historyRows ?? []);

  const { error: insertUserError } = await supabase.from("ai_messages").insert({
    conversation_id: conversation.id,
    role: "user",
    content: parsedMessage.data,
    tokens_used: 0,
  });

  if (insertUserError) throw new Error(insertUserError.message);

  const tutorContext = await buildTutorContext(supabase, {
    language,
    firstName,
    filiere,
    contextChapterId: conversation.context_chapter_id,
  });

  const messagesForTutor: TutorMessage[] = [
    ...priorMessages,
    { role: "user", content: parsedMessage.data },
  ];

  const tutorReply = await getTutorResponse(messagesForTutor, tutorContext);

  const { error: insertAssistantError } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversation.id,
      role: "assistant",
      content: tutorReply.content,
      tokens_used: tutorReply.tokensUsed,
    });

  if (insertAssistantError) throw new Error(insertAssistantError.message);

  await incrementUsage(studentId, tutorReply.tokensUsed);

  const newMessageCount = (conversation.message_count ?? 0) + 2;
  const newTotalTokens =
    (conversation.total_tokens_used ?? 0) + tutorReply.tokensUsed;

  const conversationUpdate: Database["public"]["Tables"]["ai_conversations"]["Update"] =
    {
      message_count: newMessageCount,
      updated_at: new Date().toISOString(),
      total_tokens_used: newTotalTokens,
    };

  if (isFirstMessage) {
    conversationUpdate.title = buildConversationTitle(parsedMessage.data);
  }

  const { error: updateConvError } = await supabase
    .from("ai_conversations")
    .update(conversationUpdate)
    .eq("id", conversation.id)
    .eq("user_id", studentId);

  if (updateConvError) throw new Error(updateConvError.message);

  const quotaAfter = await checkQuota(studentId);

  return {
    success: true,
    response: tutorReply.content,
    remaining: quotaAfter.remaining,
  };
}

/** Liste les conversations de l'élève connecté. */
export async function getConversations(): Promise<TutorConversationSummary[]> {
  const { supabase, studentId } = await requireStudent();

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, title, updated_at, message_count")
    .eq("user_id", studentId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Messages d'une conversation (propriété vérifiée + RLS). */
export async function getConversationMessages(
  conversationId: string,
): Promise<TutorConversationMessage[]> {
  const { supabase, studentId } = await requireStudent();
  const conversation = await getOwnedConversation(
    supabase,
    studentId,
    conversationId,
  );

  const { data, error } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Supprime une conversation (messages en cascade). */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { supabase, studentId } = await requireStudent();
  await getOwnedConversation(supabase, studentId, conversationId);

  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationIdSchema.parse(conversationId))
    .eq("user_id", studentId);

  if (error) throw new Error(error.message);
}
