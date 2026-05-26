import { redirect } from "next/navigation";

import { parseDiagnosticResults } from "@/lib/diagnostic/parse-diagnostic-results";
import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import { DASHBOARD_BY_ROLE } from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";

export type DashboardChapterResume = {
  id: string;
  slug: string;
  title: string;
  subjectName: string;
  progressPercentage: number;
  lastActivityAt: string | null;
};

export type DashboardRecommendedChapter = {
  chapterSlug: string;
  chapterTitle: string;
  subjectSlug: string;
  subjectName: string;
  potentialGain: number;
};

export type StudentDashboardData = {
  firstName: string;
  diagnosticCompleted: boolean;
  diagnosticResults: DiagnosticResult | null;
  currentPredictedScore: number | null;
  targetScore: number | null;
  inProgressChapters: DashboardChapterResume[];
  competencyValidated: number;
  competencyTotal: number;
  recommendedChapters: DashboardRecommendedChapter[];
};

type ProgressChapterRow = {
  progress_percentage: number | null;
  last_activity_at: string | null;
  chapters: {
    id: string;
    slug: string;
    title: string;
    is_published: boolean | null;
    subjects: { name: string } | null;
  } | null;
};

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/connexion");
  }

  if (profile.role !== "student") {
    redirect(DASHBOARD_BY_ROLE[profile.role]);
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "filiere, diagnostic_completed, diagnostic_results, current_predicted_score, target_score",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const diagnosticCompleted = student?.diagnostic_completed === true;
  const diagnosticResults = diagnosticCompleted
    ? parseDiagnosticResults(student?.diagnostic_results)
    : null;

  const { data: progressRows, error: progressError } = await supabase
    .from("student_progress")
    .select(
      `
      progress_percentage,
      last_activity_at,
      chapters (
        id,
        slug,
        title,
        is_published,
        subjects ( name )
      )
    `,
    )
    .eq("student_id", user.id)
    .eq("status", "in_progress")
    .order("last_activity_at", { ascending: false, nullsFirst: false })
    .limit(3);

  if (progressError) throw new Error(progressError.message);

  const inProgressChapters: DashboardChapterResume[] = (progressRows ?? [])
    .map((row) => {
      const typed = row as ProgressChapterRow;
      const chapter = typed.chapters;
      if (!chapter?.is_published || !chapter.subjects) return null;

      return {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        subjectName: chapter.subjects.name,
        progressPercentage: typed.progress_percentage ?? 0,
        lastActivityAt: typed.last_activity_at,
      };
    })
    .filter((c): c is DashboardChapterResume => Boolean(c));

  let competencyTotal = 0;
  let competencyValidated = 0;

  if (student?.filiere) {
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id")
      .eq("filiere", student.filiere);

    if (subjectsError) throw new Error(subjectsError.message);

    const subjectIds = (subjects ?? []).map((s) => s.id);

    if (subjectIds.length > 0) {
      const { count: totalCount, error: countError } = await supabase
        .from("competencies")
        .select("id", { count: "exact", head: true })
        .in("subject_id", subjectIds);

      if (countError) throw new Error(countError.message);
      competencyTotal = totalCount ?? 0;

      const { count: validatedCount, error: validatedError } = await supabase
        .from("student_competency_mastery")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user.id)
        .gte("mastery_percentage", 80);

      if (validatedError) throw new Error(validatedError.message);
      competencyValidated = validatedCount ?? 0;
    }
  }

  const recommendedChapters: DashboardRecommendedChapter[] = [];

  if (diagnosticResults?.topPriorities.length) {
    const slugs = diagnosticResults.topPriorities.map((p) => p.chapterSlug);

    const { data: chapterRows, error: chaptersError } = await supabase
      .from("chapters")
      .select("id, slug, title, subject_id")
      .in("slug", slugs)
      .eq("is_published", true);

    if (chaptersError) throw new Error(chaptersError.message);

    const chapterIds = (chapterRows ?? []).map((c) => c.id);

    const { data: completedProgress, error: completedError } =
      chapterIds.length > 0
        ? await supabase
            .from("student_progress")
            .select("chapter_id")
            .eq("student_id", user.id)
            .eq("status", "completed")
            .in("chapter_id", chapterIds)
        : { data: [], error: null };

    if (completedError) throw new Error(completedError.message);

    const completedIds = new Set(
      (completedProgress ?? []).map((p) => p.chapter_id),
    );

    const subjectIds = [
      ...new Set((chapterRows ?? []).map((c) => c.subject_id)),
    ];

    const { data: subjectRows, error: subjectNamesError } =
      subjectIds.length > 0
        ? await supabase
            .from("subjects")
            .select("id, name, slug")
            .in("id", subjectIds)
        : { data: [], error: null };

    if (subjectNamesError) throw new Error(subjectNamesError.message);

    const subjectById = new Map((subjectRows ?? []).map((s) => [s.id, s]));
    const chapterBySlug = new Map((chapterRows ?? []).map((c) => [c.slug, c]));

    for (const priority of diagnosticResults.topPriorities) {
      const chapter = chapterBySlug.get(priority.chapterSlug);
      if (!chapter || completedIds.has(chapter.id)) continue;

      const subject = subjectById.get(chapter.subject_id);

      recommendedChapters.push({
        chapterSlug: priority.chapterSlug,
        chapterTitle: priority.chapterTitle,
        subjectSlug: priority.subjectSlug,
        subjectName: subject?.name ?? priority.subjectSlug,
        potentialGain: priority.potentialGain,
      });
    }
  }

  return {
    firstName: profile.first_name,
    diagnosticCompleted,
    diagnosticResults,
    currentPredictedScore: student?.current_predicted_score ?? null,
    targetScore: student?.target_score ?? null,
    inProgressChapters,
    competencyValidated,
    competencyTotal,
    recommendedChapters,
  };
}
