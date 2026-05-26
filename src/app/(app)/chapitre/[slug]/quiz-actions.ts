"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ChapterStatus = Database["public"]["Enums"]["chapter_status"];
type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

const PASSING_SCORE = 16;

const submitQuizAnswerSchema = z.object({
  exerciseId: z.string().uuid(),
  selectedAnswer: z.string().min(1),
});

const quizResultItemSchema = z.object({
  exerciseId: z.string().uuid(),
  isCorrect: z.boolean(),
});

const completeQuizSchema = z.object({
  chapterId: z.string().uuid(),
  results: z.array(quizResultItemSchema).min(1),
});

async function requireStudent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

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

async function assertChapterAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  chapterId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("id,is_free,is_published")
    .eq("id", chapterId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!chapter) return { ok: false, error: "Chapitre introuvable." };

  const plan = await getStudentSubscriptionPlan(supabase, studentId);
  const locked = !(chapter.is_free ?? false) && plan === "free";

  if (locked) {
    return {
      ok: false,
      error: "Ce chapitre nécessite un abonnement pour accéder au quiz.",
    };
  }

  return { ok: true };
}

function roundScore(correctCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 20 * 10) / 10;
}

async function resolveCompetencyIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tags: string[],
): Promise<string[]> {
  if (tags.length === 0) return [];

  const uniqueTags = [...new Set(tags.filter(Boolean))];

  const { data: bySlug, error: slugError } = await supabase
    .from("competencies")
    .select("id, slug")
    .in("slug", uniqueTags);

  if (slugError) throw new Error(slugError.message);

  const { data: byId, error: idError } = await supabase
    .from("competencies")
    .select("id")
    .in("id", uniqueTags);

  if (idError) throw new Error(idError.message);

  const ids = new Set<string>();
  for (const row of bySlug ?? []) ids.add(row.id);
  for (const row of byId ?? []) ids.add(row.id);

  return [...ids];
}

export type MasteryUpdateSummary = {
  competencyId: string;
  masteryPercentage: number;
  attemptsCount: number;
  successesCount: number;
};

async function incrementCompetencyMastery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  competencyId: string,
): Promise<MasteryUpdateSummary> {
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("student_competency_mastery")
    .select("id,attempts_count,successes_count")
    .eq("student_id", studentId)
    .eq("competency_id", competencyId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const attemptsCount = (existing?.attempts_count ?? 0) + 1;
  const successesCount = (existing?.successes_count ?? 0) + 1;
  const masteryPercentage = Math.round((successesCount / attemptsCount) * 100);

  if (existing) {
    const { error: updateError } = await supabase
      .from("student_competency_mastery")
      .update({
        attempts_count: attemptsCount,
        successes_count: successesCount,
        mastery_percentage: masteryPercentage,
        last_updated_at: now,
      })
      .eq("id", existing.id);

    if (updateError) throw new Error(updateError.message);
  } else {
    const { error: insertError } = await supabase
      .from("student_competency_mastery")
      .insert({
        student_id: studentId,
        competency_id: competencyId,
        attempts_count: attemptsCount,
        successes_count: successesCount,
        mastery_percentage: masteryPercentage,
        ai_assistance_count: 0,
        last_updated_at: now,
      });

    if (insertError) throw new Error(insertError.message);
  }

  return {
    competencyId,
    masteryPercentage,
    attemptsCount,
    successesCount,
  };
}

export type SubmitQuizAnswerResult =
  | {
      success: true;
      isCorrect: boolean;
      correctAnswer: string;
      explanation: string;
    }
  | { success: false; error: string };

/** Valide une réponse sans mettre à jour la progression. */
export async function submitQuizAnswer(
  exerciseId: string,
  selectedAnswer: string,
): Promise<SubmitQuizAnswerResult> {
  const parsed = submitQuizAnswerSchema.safeParse({ exerciseId, selectedAnswer });
  if (!parsed.success) {
    return { success: false, error: "Données de réponse invalides." };
  }

  const { supabase, studentId } = await requireStudent();

  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select("id,correct_answer,explanation,chapter_id")
    .eq("id", parsed.data.exerciseId)
    .maybeSingle();

  if (exerciseError) {
    return { success: false, error: exerciseError.message };
  }

  if (!exercise) {
    return { success: false, error: "Exercice introuvable." };
  }

  const access = await assertChapterAccess(
    supabase,
    studentId,
    exercise.chapter_id,
  );
  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const normalizedSelected = parsed.data.selectedAnswer.trim();
  const normalizedCorrect = exercise.correct_answer.trim();
  const isCorrect = normalizedSelected === normalizedCorrect;

  return {
    success: true,
    isCorrect,
    correctAnswer: exercise.correct_answer,
    explanation: exercise.explanation ?? "",
  };
}

export type QuizResultItem = z.infer<typeof quizResultItemSchema>;

export type CompleteQuizSummary = {
  score: number;
  totalQuestions: number;
  correctCount: number;
  newStatus: ChapterStatus;
  masteryUpdates: MasteryUpdateSummary[];
};

export type CompleteQuizResult =
  | { success: true; summary: CompleteQuizSummary }
  | { success: false; error: string };

/** Finalise le quiz : progression chapitre + maîtrise des compétences. */
export async function completeQuiz(
  chapterId: string,
  results: QuizResultItem[],
): Promise<CompleteQuizResult> {
  const parsed = completeQuizSchema.safeParse({ chapterId, results });
  if (!parsed.success) {
    return { success: false, error: "Résultats du quiz invalides." };
  }

  const { supabase, studentId } = await requireStudent();
  const { chapterId: validChapterId, results: validResults } = parsed.data;

  const access = await assertChapterAccess(supabase, studentId, validChapterId);
  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const exerciseIds = validResults.map((r) => r.exerciseId);

  const { data: chapterExercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("id,competency_tags")
    .eq("chapter_id", validChapterId)
    .in("id", exerciseIds);

  if (exercisesError) {
    return { success: false, error: exercisesError.message };
  }

  if ((chapterExercises?.length ?? 0) !== exerciseIds.length) {
    return {
      success: false,
      error: "Un ou plusieurs exercices n'appartiennent pas à ce chapitre.",
    };
  }

  const totalQuestions = validResults.length;
  const correctCount = validResults.filter((r) => r.isCorrect).length;
  const score = roundScore(correctCount, totalQuestions);
  const newStatus: ChapterStatus =
    score >= PASSING_SCORE ? "completed" : "in_progress";

  const progressPercent = Math.round((correctCount / totalQuestions) * 100);
  const now = new Date().toISOString();

  const { data: existingProgress, error: progressFetchError } = await supabase
    .from("student_progress")
    .select("id,quiz_best_score,progress_percentage,status")
    .eq("student_id", studentId)
    .eq("chapter_id", validChapterId)
    .maybeSingle();

  if (progressFetchError) {
    return { success: false, error: progressFetchError.message };
  }

  const bestScore = Math.max(existingProgress?.quiz_best_score ?? 0, score);
  const nextProgressPercent = Math.max(
    existingProgress?.progress_percentage ?? 0,
    progressPercent,
  );

  const progressPayload = {
    quiz_best_score: bestScore,
    progress_percentage: nextProgressPercent,
    last_activity_at: now,
    status: newStatus,
    ...(newStatus === "completed" ? { completed_at: now } : {}),
  };

  if (existingProgress) {
    const { error: updateError } = await supabase
      .from("student_progress")
      .update(progressPayload)
      .eq("id", existingProgress.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  } else {
    const { error: insertError } = await supabase.from("student_progress").insert({
      student_id: studentId,
      chapter_id: validChapterId,
      ...progressPayload,
      time_spent_seconds: 0,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  const exerciseById = new Map(
    (chapterExercises ?? []).map((ex) => [ex.id, ex]),
  );

  const masteryByCompetency = new Map<string, MasteryUpdateSummary>();

  for (const result of validResults) {
    if (!result.isCorrect) continue;

    const exercise = exerciseById.get(result.exerciseId);
    const tags = exercise?.competency_tags ?? [];
    const competencyIds = await resolveCompetencyIds(supabase, tags);

    for (const competencyId of competencyIds) {
      const summary = await incrementCompetencyMastery(
        supabase,
        studentId,
        competencyId,
      );
      masteryByCompetency.set(competencyId, summary);
    }
  }

  const masteryUpdates = [...masteryByCompetency.values()];

  return {
    success: true,
    summary: {
      score,
      totalQuestions,
      correctCount,
      newStatus,
      masteryUpdates,
    },
  };
}
