import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import type { TutorContext, TutorMessage } from "./types";

/** Normalise une question pour comparaison / clé de cache. */
export function normalizeQuestion(question: string): string {
  return question
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChapterSlug(chapterTitle?: string): string {
  if (!chapterTitle?.trim()) return "";
  return normalizeQuestion(chapterTitle);
}

/**
 * Clé stable : hash SHA-256 de (langue + chapitre + question normalisée).
 */
export function generateCacheKey(
  question: string,
  context: TutorContext,
): string {
  const payload = [
    context.language,
    normalizeChapterSlug(context.chapterTitle),
    normalizeQuestion(question),
  ].join("|");

  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Le cache ne s'applique qu'aux questions « génériques » (premier tour),
 * pas aux échanges de suivi où l'historique compte.
 */
export function isGenericTutorQuestion(messages: TutorMessage[]): boolean {
  const hasAssistantReply = messages.some((m) => m.role === "assistant");
  if (hasAssistantReply) return false;

  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length !== 1) return false;

  const normalized = normalizeQuestion(userMessages[0]?.content ?? "");
  return normalized.length >= 12;
}

/**
 * Lit une réponse en cache (client authentifié) et incrémente `hit_count` (service role).
 */
export async function getCachedResponse(key: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_response_cache")
    .select("response")
    .eq("cache_key", key)
    .maybeSingle();

  if (error) {
    console.error("[ai_response_cache] getCachedResponse:", error.message);
    return null;
  }

  if (!data?.response) return null;

  try {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("ai_response_cache")
      .select("hit_count")
      .eq("cache_key", key)
      .maybeSingle();

    if (row) {
      await admin
        .from("ai_response_cache")
        .update({ hit_count: (row.hit_count ?? 0) + 1 })
        .eq("cache_key", key);
    }
  } catch (err) {
    console.error("[ai_response_cache] increment hit_count:", err);
  }

  return data.response;
}

export interface SetCachedResponseMeta {
  question: string;
  context: TutorContext;
}

/**
 * Stocke une réponse en cache (service role uniquement, contourne le RLS).
 * `meta` alimente `question_normalized` et `language` pour l'analyse.
 */
export async function setCachedResponse(
  key: string,
  response: string,
  meta: SetCachedResponseMeta,
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("ai_response_cache").upsert(
    {
      cache_key: key,
      question_normalized: normalizeQuestion(meta.question),
      response,
      language: meta.context.language,
    },
    { onConflict: "cache_key", ignoreDuplicates: true },
  );

  if (error) {
    console.error("[ai_response_cache] setCachedResponse:", error.message);
    throw new Error("Impossible d'enregistrer la réponse en cache.");
  }
}

/** Helper : génère la clé et persiste en une fois. */
export async function cacheTutorResponse(
  question: string,
  context: TutorContext,
  response: string,
): Promise<void> {
  const key = generateCacheKey(question, context);
  await setCachedResponse(key, response, { question, context });
}
