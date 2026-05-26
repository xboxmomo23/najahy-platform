"use server";

import { redirect } from "next/navigation";

import {
  computeDiagnosticResult,
  type DiagnosticResult,
} from "@/lib/diagnostic/scoring";
import { createClient } from "@/lib/supabase/server";
import {
  submitDiagnosticSchema,
  type SubmitDiagnosticPayload,
} from "@/lib/validations/diagnostic";
import type { Json } from "@/types/database.types";

/** Option QCM exposée au client (sans réponse correcte). */
export type DiagnosticQuestionPublic = {
  id: string;
  question: string;
  questionLatex: string | null;
  options: Json;
  difficulty: number;
  subjectSlug: string;
  subjectName: string;
  relatedChapterSlug: string;
};

export type DiagnosticQuestionsBySubject = {
  subjectSlug: string;
  subjectName: string;
  coefficient: number;
  questions: DiagnosticQuestionPublic[];
};

type QuestionRow = {
  id: string;
  question: string;
  question_latex: string | null;
  options: Json;
  difficulty: number;
  display_order: number | null;
  related_chapter_slug: string | null;
  subjects: {
    slug: string;
    name: string;
    coefficient: number;
    filiere: string;
    display_order: number | null;
  };
};

export type SubmitDiagnosticActionResult =
  | { success: true; result: DiagnosticResult }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

async function requireStudent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/app/diagnostic");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
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

  return { supabase, userId: user.id, filiere: student.filiere };
}

function zodFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) map[key] = messages[0];
  }
  return map;
}

/**
 * Charge les questions du diagnostic groupées par matière (sans `correct_answer`).
 */
export async function getDiagnosticQuestions(): Promise<
  DiagnosticQuestionsBySubject[]
> {
  const { supabase, filiere } = await requireStudent();

  const { data: rows, error } = await supabase
    .from("diagnostic_questions")
    .select(
      `
      id,
      question,
      question_latex,
      options,
      difficulty,
      display_order,
      related_chapter_slug,
      subjects!inner (
        slug,
        name,
        coefficient,
        filiere,
        display_order
      )
    `,
    )
    .eq("subjects.filiere", filiere)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(
      `Impossible de charger les questions du diagnostic : ${error.message}`,
    );
  }

  const questions = (rows ?? []) as QuestionRow[];

  const bySubject = new Map<string, DiagnosticQuestionsBySubject>();

  for (const row of questions) {
    const subject = row.subjects;
    const slug = subject.slug;

    if (!bySubject.has(slug)) {
      bySubject.set(slug, {
        subjectSlug: slug,
        subjectName: subject.name,
        coefficient: subject.coefficient,
        questions: [],
      });
    }

    bySubject.get(slug)!.questions.push({
      id: row.id,
      question: row.question,
      questionLatex: row.question_latex,
      options: row.options,
      difficulty: row.difficulty,
      subjectSlug: slug,
      subjectName: subject.name,
      relatedChapterSlug: row.related_chapter_slug ?? slug,
    });
  }

  return [...bySubject.values()].sort((a, b) => {
    const orderA =
      questions.find((q) => q.subjects.slug === a.subjectSlug)?.subjects
        .display_order ?? 0;
    const orderB =
      questions.find((q) => q.subjects.slug === b.subjectSlug)?.subjects
        .display_order ?? 0;
    return orderA - orderB;
  });
}

/**
 * Corrige les réponses, calcule le diagnostic et persiste le résultat.
 */
export async function submitDiagnostic(
  payload: SubmitDiagnosticPayload,
): Promise<SubmitDiagnosticActionResult> {
  const parsed = submitDiagnosticSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.flatten().fieldErrors);
    const firstError =
      Object.values(fieldErrors)[0] ?? "Données invalides. Vérifie le formulaire.";
    return { success: false, error: firstError, fieldErrors };
  }

  const data = parsed.data;
  const { supabase, userId, filiere } = await requireStudent();

  const questionIds = data.answers.map((a) => a.questionId);

  const { data: questionRows, error: questionsError } = await supabase
    .from("diagnostic_questions")
    .select(
      `
      id,
      correct_answer,
      difficulty,
      related_chapter_slug,
      subjects!inner ( slug, name, coefficient, filiere )
    `,
    )
    .in("id", questionIds)
    .eq("subjects.filiere", filiere);

  if (questionsError) {
    return {
      success: false,
      error: "Impossible de valider les réponses.",
    };
  }

  if (!questionRows?.length || questionRows.length !== questionIds.length) {
    return {
      success: false,
      error: "Certaines réponses ne correspondent pas aux questions du diagnostic.",
    };
  }

  const questionMap = new Map(
    questionRows.map((q) => {
      const subject = q.subjects as {
        slug: string;
        name: string;
        coefficient: number;
      };
      return [
        q.id,
        {
          correctAnswer: q.correct_answer,
          difficulty: q.difficulty,
          chapterSlug: q.related_chapter_slug ?? subject.slug,
          subjectSlug: subject.slug,
          subjectName: subject.name,
          coefficient: subject.coefficient,
        },
      ];
    }),
  );

  const gradedAnswers = data.answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      throw new Error(`Question inconnue : ${answer.questionId}`);
    }

    return {
      questionId: answer.questionId,
      subjectSlug: question.subjectSlug,
      difficulty: question.difficulty,
      isCorrect: answer.selectedAnswer === question.correctAnswer,
      chapterSlug: question.chapterSlug,
      selectedAnswer: answer.selectedAnswer,
    };
  });

  const { data: subjectRows, error: subjectsError } = await supabase
    .from("subjects")
    .select("slug, name, coefficient")
    .eq("filiere", filiere)
    .order("display_order", { ascending: true });

  if (subjectsError || !subjectRows?.length) {
    return {
      success: false,
      error: "Impossible de charger les matières.",
    };
  }

  const subjects = subjectRows.map((s) => ({
    slug: s.slug,
    name: s.name,
    coefficient: s.coefficient,
  }));

  const result = computeDiagnosticResult(
    gradedAnswers.map(
      ({ questionId, subjectSlug, difficulty, isCorrect, chapterSlug }) => ({
        questionId,
        subjectSlug,
        difficulty,
        isCorrect,
        chapterSlug,
      }),
    ),
    subjects,
    data.targetScore,
  );

  const now = new Date().toISOString();

  const answersPayload = gradedAnswers.map((a) => ({
    questionId: a.questionId,
    selectedAnswer: a.selectedAnswer,
    isCorrect: a.isCorrect,
  }));

  const generatedPlan = {
    firstStep: result.firstStep,
    topPriorities: result.topPriorities,
    subjectScores: result.subjectScores,
    confidenceScores: data.confidenceScores,
    focusAreas: data.focusAreas,
  };

  const { error: attemptError } = await supabase
    .from("diagnostic_attempts")
    .insert({
      student_id: userId,
      answers: answersPayload as Json,
      confidence_scores: data.confidenceScores as Json,
      subject_scores: result.subjectScores as unknown as Json,
      predicted_score: result.predictedScore,
      target_score: data.targetScore,
      hours_per_week: data.hoursPerWeek,
      focus_areas: data.focusAreas,
      generated_plan: generatedPlan as unknown as Json,
      completed_at: now,
      started_at: now,
    });

  if (attemptError) {
    return {
      success: false,
      error: attemptError.message ?? "Impossible d'enregistrer le diagnostic.",
    };
  }

  const { error: studentUpdateError } = await supabase
    .from("students")
    .update({
      diagnostic_completed: true,
      diagnostic_completed_at: now,
      diagnostic_results: result as unknown as Json,
      target_score: data.targetScore,
      hours_per_week: data.hoursPerWeek,
      current_predicted_score: result.predictedScore,
    })
    .eq("user_id", userId);

  if (studentUpdateError) {
    return {
      success: false,
      error:
        studentUpdateError.message ??
        "Diagnostic enregistré mais mise à jour du profil impossible.",
    };
  }

  return { success: true, result };
}
