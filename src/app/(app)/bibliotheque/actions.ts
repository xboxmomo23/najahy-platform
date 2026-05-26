"use server";

import { redirect } from "next/navigation";

import type { Database } from "@/types/database.types";

import { createClient } from "@/lib/supabase/server";
import { parseDiagnosticResults } from "@/lib/diagnostic/parse-diagnostic-results";
import type {
  DiagnosticPriority,
  DiagnosticResult,
} from "@/lib/diagnostic/scoring";
import {
  getToneForMastery,
  type SubjectScore,
} from "@/lib/diagnostic/scoring";

type ChapterStatus = Database["public"]["Enums"]["chapter_status"];
type UserRole = Database["public"]["Enums"]["user_role"];

const DEFAULT_CHAPTER_STATUS: ChapterStatus = "not_started";

const TONE_STATUS_LABELS: Record<
  SubjectScore["tone"],
  "Force" | "Solide" | "À consolider" | "Priorité"
> = {
  force: "Force",
  solid: "Solide",
  consolidate: "À consolider",
  priority: "Priorité",
};

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

  return { supabase, studentId: user.id, studentRole: profile.role as UserRole };
}

export type LibraryChapter = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subjectName: string;
  subjectSlug: string;
  subjectColor: string | null;
  coefficient: number;
  difficulty: number | null;
  bacFrequency: number | null;
  estimatedDuration: number | null;
  isFree: boolean;
  status: ChapterStatus;
  progressPercentage: number;
  quizBestScore: number;
  exerciseCount: number;
};

export type LibraryGlobalStats = {
  nbValides: number;
  nbEnCours: number;
  nbNonCommences: number;
  nbAReprendre: number;
};

export type LibraryDataResult = {
  chapters: LibraryChapter[];
  stats: LibraryGlobalStats;
};

/** 1) Données complètes de la bibliothèque (chapitres + progression + stats). */
export async function getLibraryData(): Promise<LibraryDataResult> {
  const { supabase, studentId } = await requireStudent();

  // 1) Chapitres publiés (et info matière)
  const { data: chapterRows, error: chaptersError } = await supabase
    .from("chapters")
    .select(
      "id,slug,title,description,difficulty,bac_frequency,estimated_duration_minutes,is_free,subject_id",
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (chaptersError) throw new Error(chaptersError.message);

  const chapters = chapterRows ?? [];
  if (chapters.length === 0) {
    return {
      chapters: [],
      stats: {
        nbValides: 0,
        nbEnCours: 0,
        nbNonCommences: 0,
        nbAReprendre: 0,
      },
    };
  }

  const subjectIds = Array.from(
    new Set(chapters.map((c) => c.subject_id).filter(Boolean)),
  );
  const chapterIds = chapters.map((c) => c.id);

  // 2) Matières
  const { data: subjectRows, error: subjectsError } = await supabase
    .from("subjects")
    .select("id,name,slug,color,coefficient")
    .in("id", subjectIds);

  if (subjectsError) throw new Error(subjectsError.message);

  const subjectById = new Map(
    (subjectRows ?? []).map((s) => [s.id, s]),
  );

  // 3) Progression élève (LEFT JOIN via default)
  const { data: progressRows, error: progressError } = await supabase
    .from("student_progress")
    .select("chapter_id,status,progress_percentage,quiz_best_score")
    .eq("student_id", studentId)
    .in("chapter_id", chapterIds);

  if (progressError) throw new Error(progressError.message);

  const progressByChapterId = new Map(
    (progressRows ?? []).map((p) => [p.chapter_id, p]),
  );

  // 4) Nombre d'exercices + annales (on agrège sur toutes les lignes de `exercises`)
  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercises")
    .select("chapter_id,type")
    .in("chapter_id", chapterIds);

  if (exercisesError) throw new Error(exercisesError.message);

  const exerciseCountByChapterId = new Map<string, number>();
  for (const ex of exerciseRows ?? []) {
    const count = exerciseCountByChapterId.get(ex.chapter_id) ?? 0;
    exerciseCountByChapterId.set(ex.chapter_id, count + 1);
  }

  // 5) Composer la sortie + stats globales
  const stats: LibraryGlobalStats = {
    nbValides: 0,
    nbEnCours: 0,
    nbNonCommences: 0,
    nbAReprendre: 0,
  };

  const chaptersOut: LibraryChapter[] = chapters
    .map((ch) => {
      const subject = subjectById.get(ch.subject_id);
      if (!subject) return null;

      const progress = progressByChapterId.get(ch.id);
      const status = (progress?.status ?? DEFAULT_CHAPTER_STATUS) as
        | ChapterStatus
        | null;

      const progressPercentage = progress?.progress_percentage ?? 0;
      const quizBestScore = progress?.quiz_best_score ?? 0;

      const exerciseCount =
        exerciseCountByChapterId.get(ch.id) ?? 0;

      return {
        id: ch.id,
        slug: ch.slug,
        title: ch.title,
        description: ch.description,
        subjectName: subject.name,
        subjectSlug: subject.slug,
        subjectColor: subject.color,
        coefficient: subject.coefficient,
        difficulty: ch.difficulty,
        bacFrequency: ch.bac_frequency,
        estimatedDuration: ch.estimated_duration_minutes,
        isFree: ch.is_free ?? false,
        status: status ?? DEFAULT_CHAPTER_STATUS,
        progressPercentage,
        quizBestScore,
        exerciseCount,
      } satisfies LibraryChapter;
    })
    .filter((c): c is LibraryChapter => Boolean(c));

  for (const ch of chaptersOut) {
    if (ch.status === "completed") stats.nbValides += 1;
    else if (ch.status === "in_progress") stats.nbEnCours += 1;
    else if (ch.status === "to_review") stats.nbAReprendre += 1;
    else stats.nbNonCommences += 1; // not_started
  }

  return { chapters: chaptersOut, stats };
}

export type CompetencyStatusLabel =
  | "Force"
  | "Solide"
  | "À consolider"
  | "Priorité";

export type CompetencyNode = {
  name: string;
  description: string | null;
  masteryPercentage: number;
  status: CompetencyStatusLabel;
};

export type CompetencySubjectNode = {
  subjectName: string;
  coefficient: number;
  globalScore: number;
  tone: SubjectScore["tone"];
  competencies: CompetencyNode[];
};

/** 2) Arbre des compétences (mastery élève via LEFT JOIN). */
export async function getCompetencyTree(): Promise<
  CompetencySubjectNode[]
> {
  const { supabase, studentId } = await requireStudent();

  // 1) Matières
  const { data: subjectRows, error: subjectsError } = await supabase
    .from("subjects")
    .select("id,name,coefficient")
    .order("display_order", { ascending: true });

  // Certains environnements peuvent ne pas avoir display_order sur subjects ; fallback.
  if (subjectsError) {
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("subjects")
      .select("id,name,coefficient");
    if (fallbackError) throw new Error(fallbackError.message);
    return [];
  }

  const subjects = subjectRows ?? [];
  if (subjects.length === 0) return [];

  // 2) Compétences
  const { data: competencyRows, error: competenciesError } = await supabase
    .from("competencies")
    .select("id,name,description,subject_id")
    .in(
      "subject_id",
      subjects.map((s) => s.id),
    );

  if (competenciesError) throw new Error(competenciesError.message);

  const competencies = competencyRows ?? [];

  const competencyById = new Map(competencies.map((c) => [c.id, c]));
  const competenciesBySubjectId = new Map<
    string,
    typeof competencies
  >();
  for (const c of competencies) {
    const list = competenciesBySubjectId.get(c.subject_id) ?? [];
    list.push(c);
    competenciesBySubjectId.set(c.subject_id, list);
  }

  // 3) Mastery élève (LEFT JOIN via default 0)
  const competencyIds = competencies.map((c) => c.id);

  const { data: masteryRows, error: masteryError } = await supabase
    .from("student_competency_mastery")
    .select("competency_id,mastery_percentage")
    .eq("student_id", studentId)
    .in("competency_id", competencyIds);

  if (masteryError) throw new Error(masteryError.message);

  const masteryByCompetencyId = new Map(
    (masteryRows ?? []).map((m) => [m.competency_id, m]),
  );

  const subjectsOut: CompetencySubjectNode[] = subjects.map((s) => {
      const comps = (competenciesBySubjectId.get(s.id) ?? []).slice();
      comps.sort((a, b) => a.name.localeCompare(b.name));

      if (comps.length === 0) {
        return {
          subjectName: s.name,
          coefficient: s.coefficient,
          globalScore: 0,
          tone: getToneForMastery(0),
          competencies: [],
        } satisfies CompetencySubjectNode;
      }

      let sum = 0;
      const competenciesOut: CompetencyNode[] = comps.map((c) => {
        const mastery = masteryByCompetencyId.get(c.id)?.mastery_percentage;
        const masteryPercentage = mastery ?? 0;
        sum += masteryPercentage;

        const tone = getToneForMastery(masteryPercentage);
        const status = TONE_STATUS_LABELS[tone];

        return {
          name: c.name,
          description: c.description,
          masteryPercentage,
          status,
        } satisfies CompetencyNode;
      });

      const globalScore = Math.round(sum / comps.length);
      const tone = getToneForMastery(globalScore);

      return {
        subjectName: s.name,
        coefficient: s.coefficient,
        globalScore,
        tone,
        competencies: competenciesOut,
      } satisfies CompetencySubjectNode;
    })
    .filter(Boolean);

  return subjectsOut;
}

/** Plan d'abonnement actif de l'élève (pour chapitres verrouillés). */
export async function getStudentSubscriptionPlan(): Promise<
  Database["public"]["Enums"]["subscription_plan"]
> {
  const { supabase, studentId } = await requireStudent();

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

/** 3) Top recommandations issues du diagnostic (3 chapitres). */
export async function getDiagnosticRecommendations(): Promise<
  DiagnosticPriority[] | null
> {
  const { supabase, studentId } = await requireStudent();

  const { data: student, error: studentsError } = await supabase
    .from("students")
    .select("diagnostic_results, diagnostic_completed")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentsError) throw new Error(studentsError.message);

  if (!student || student.diagnostic_completed !== true) return null;

  const parsed: DiagnosticResult | null = parseDiagnosticResults(
    student.diagnostic_results,
  );

  return parsed?.topPriorities ?? null;
}

