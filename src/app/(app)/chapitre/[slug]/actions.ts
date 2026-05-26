"use server";

import { notFound, redirect } from "next/navigation";

import { parseQcmOptions } from "@/components/features/diagnostic/diagnostic-utils";
import type { QcmOption } from "@/components/features/diagnostic/diagnostic-utils";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ChapterStatus = Database["public"]["Enums"]["chapter_status"];
type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

async function requireStudent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/dashboard");
  }

  return { supabase, studentId: user.id };
}

async function getStudentSubscriptionPlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
): Promise<SubscriptionPlan> {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const active = subscriptions?.find(
    (s) => s.status === "active" || s.status === "pending",
  );

  return active?.plan ?? "free";
}

export type ChapterExercisePublic = {
  id: string;
  question: string;
  options: QcmOption[];
  difficulty: number | null;
  type: string;
  displayOrder: number | null;
  estimatedTimeSeconds: number | null;
  competencyTags: string[] | null;
};

export type ChapterProgressDetail = {
  status: ChapterStatus;
  progressPercentage: number;
  quizBestScore: number;
  lastActivityAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number;
};

export type ChapterDetailPayload = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  ficheContent: string | null;
  videoUrl: string | null;
  isFree: boolean;
  difficulty: number | null;
  bacFrequency: number | null;
  estimatedDuration: number | null;
  unitPriceDzd: number | null;
  subjectName: string;
  subjectSlug: string;
  subjectColor: string | null;
  coefficient: number;
};

export type ChapterDetailResult = {
  locked: boolean;
  subscriptionPlan: SubscriptionPlan;
  chapter: ChapterDetailPayload;
  chapterNumber: number;
  /** Extrait du cours pour l’aperçu flouté du paywall */
  contentPreview: string | null;
  exercises: ChapterExercisePublic[];
  progress: ChapterProgressDetail | null;
};

type ChapterRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  fiche_content: string | null;
  video_url: string | null;
  is_free: boolean | null;
  difficulty: number | null;
  bac_frequency: number | null;
  estimated_duration_minutes: number | null;
  unit_price_dzd: number | null;
  subject_id: string;
  subjects: {
    name: string;
    slug: string;
    color: string | null;
    coefficient: number;
  } | null;
};

function mapChapterPayload(row: ChapterRow): ChapterDetailPayload {
  const subject = row.subjects;
  if (!subject) {
    throw new Error("Matière du chapitre introuvable.");
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    ficheContent: row.fiche_content,
    videoUrl: row.video_url,
    isFree: row.is_free ?? false,
    difficulty: row.difficulty,
    bacFrequency: row.bac_frequency,
    estimatedDuration: row.estimated_duration_minutes,
    unitPriceDzd: row.unit_price_dzd,
    subjectName: subject.name,
    subjectSlug: subject.slug,
    subjectColor: subject.color,
    coefficient: subject.coefficient,
  };
}

function stripSensitiveContent(
  chapter: ChapterDetailPayload,
): ChapterDetailPayload {
  return {
    ...chapter,
    content: null,
    ficheContent: null,
    videoUrl: null,
  };
}

/** Détail d'un chapitre + exercices (sans réponses) + progression. */
export async function getChapterDetail(
  slug: string,
): Promise<ChapterDetailResult> {
  const { supabase, studentId } = await requireStudent();

  const { data: row, error: chapterError } = await supabase
    .from("chapters")
    .select(
      `
      id,
      slug,
      title,
      description,
      content,
      fiche_content,
      video_url,
      is_free,
      difficulty,
      bac_frequency,
      estimated_duration_minutes,
      unit_price_dzd,
      subjects (
        name,
        slug,
        color,
        coefficient
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (chapterError) throw new Error(chapterError.message);
  if (!row) notFound();

  const chapterRow = row as ChapterRow;
  const subscriptionPlan = await getStudentSubscriptionPlan(supabase, studentId);
  const isFree = chapterRow.is_free ?? false;
  const locked = !isFree && subscriptionPlan === "free";

  let chapter = mapChapterPayload(chapterRow);

  const { data: progressRow, error: progressError } = await supabase
    .from("student_progress")
    .select(
      "status,progress_percentage,quiz_best_score,last_activity_at,completed_at,time_spent_seconds",
    )
    .eq("student_id", studentId)
    .eq("chapter_id", chapterRow.id)
    .maybeSingle();

  if (progressError) throw new Error(progressError.message);

  const progress: ChapterProgressDetail | null = progressRow
    ? {
        status: progressRow.status ?? "not_started",
        progressPercentage: progressRow.progress_percentage ?? 0,
        quizBestScore: progressRow.quiz_best_score ?? 0,
        lastActivityAt: progressRow.last_activity_at,
        completedAt: progressRow.completed_at,
        timeSpentSeconds: progressRow.time_spent_seconds ?? 0,
      }
    : null;

  const { data: subjectChapters, error: orderError } = await supabase
    .from("chapters")
    .select("id")
    .eq("subject_id", chapterRow.subject_id)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (orderError) throw new Error(orderError.message);

  const indexInSubject =
    subjectChapters?.findIndex((c) => c.id === chapterRow.id) ?? -1;
  const chapterNumber = indexInSubject >= 0 ? indexInSubject + 1 : 1;

  const contentPreview =
    locked && chapterRow.content
      ? chapterRow.content.slice(0, 800)
      : null;

  if (locked) {
    return {
      locked: true,
      subscriptionPlan,
      chapter: stripSensitiveContent(chapter),
      chapterNumber,
      contentPreview,
      exercises: [],
      progress,
    };
  }

  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercises")
    .select(
      "id,question,options,difficulty,type,display_order,estimated_time_seconds,competency_tags",
    )
    .eq("chapter_id", chapterRow.id)
    .order("display_order", { ascending: true });

  if (exercisesError) throw new Error(exercisesError.message);

  const exercises: ChapterExercisePublic[] = (exerciseRows ?? []).map((ex) => ({
    id: ex.id,
    question: ex.question,
    options: parseQcmOptions(ex.options ?? []),
    difficulty: ex.difficulty,
    type: ex.type,
    displayOrder: ex.display_order,
    estimatedTimeSeconds: ex.estimated_time_seconds,
    competencyTags: ex.competency_tags,
  }));

  return {
    locked: false,
    subscriptionPlan,
    chapter,
    chapterNumber,
    contentPreview: null,
    exercises,
    progress,
  };
}

export type MarkChapterStartedResult =
  | { success: true }
  | { success: false; error: string };

/** Marque le chapitre comme commencé (progression élève). */
export async function markChapterStarted(
  chapterId: string,
): Promise<MarkChapterStartedResult> {
  if (!chapterId.trim()) {
    return { success: false, error: "Identifiant de chapitre invalide." };
  }

  const { supabase, studentId } = await requireStudent();

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id,is_free,is_published")
    .eq("id", chapterId)
    .eq("is_published", true)
    .maybeSingle();

  if (chapterError) {
    return { success: false, error: chapterError.message };
  }

  if (!chapter) {
    return { success: false, error: "Chapitre introuvable." };
  }

  const subscriptionPlan = await getStudentSubscriptionPlan(supabase, studentId);
  const locked = !(chapter.is_free ?? false) && subscriptionPlan === "free";

  if (locked) {
    return {
      success: false,
      error: "Ce chapitre nécessite un abonnement pour être consulté.",
    };
  }

  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("student_progress")
    .select("id,status")
    .eq("student_id", studentId)
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!existing) {
    const { error: insertError } = await supabase.from("student_progress").insert({
      student_id: studentId,
      chapter_id: chapterId,
      status: "in_progress",
      last_activity_at: now,
      progress_percentage: 0,
      quiz_best_score: 0,
      time_spent_seconds: 0,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  }

  if (existing.status === "not_started") {
    const { error: updateError } = await supabase
      .from("student_progress")
      .update({
        status: "in_progress",
        last_activity_at: now,
      })
      .eq("id", existing.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  }

  const { error: touchError } = await supabase
    .from("student_progress")
    .update({ last_activity_at: now })
    .eq("id", existing.id);

  if (touchError) {
    return { success: false, error: touchError.message };
  }

  return { success: true };
}
