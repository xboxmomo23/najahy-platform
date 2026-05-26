import type { SubjectScore } from "@/lib/diagnostic/scoring";
import { slugToChapterTitle } from "@/lib/diagnostic/scoring";

/** Date officielle du BAC (provisoire — à centraliser plus tard). */
export const BAC_EXAM_DATE = new Date(2027, 5, 8); // 8 juin 2027

const SUBJECT_ICONS: Record<string, string> = {
  mathematiques: "∑",
  maths: "∑",
  physique: "⚡",
  sciences: "🧪",
  "sciences-naturelles": "🧪",
  sciences_naturelles: "🧪",
  francais: "📖",
  français: "📖",
};

export function getDaysUntilBac(from: Date = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const exam = new Date(
    BAC_EXAM_DATE.getFullYear(),
    BAC_EXAM_DATE.getMonth(),
    BAC_EXAM_DATE.getDate(),
  );
  const diffMs = exam.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getDisplayWeekCount(daysUntilBac: number): number {
  const weeks = Math.ceil(daysUntilBac / 7);
  return Math.min(8, Math.max(1, weeks));
}

export function getSubjectIcon(slug: string): string {
  const key = slug.toLowerCase().replace(/\s+/g, "-");
  return SUBJECT_ICONS[key] ?? "📚";
}

export function formatWeakChapter(slug: string): string {
  return slugToChapterTitle(slug);
}

export type PlanCellIntensity = "high" | "medium" | "low" | "rest";

const TONE_PRIORITY: Record<SubjectScore["tone"], number> = {
  priority: 0,
  consolidate: 1,
  solid: 2,
  force: 3,
};

/** Intensité visuelle par semaine selon le tone (priorité en début de plan). */
export function getPlanCellIntensity(
  tone: SubjectScore["tone"],
  weekIndex: number,
  totalWeeks: number,
): PlanCellIntensity {
  const rank = TONE_PRIORITY[tone];
  const progress = weekIndex / Math.max(totalWeeks - 1, 1);

  if (tone === "force") {
    return progress > 0.65 ? "low" : "rest";
  }

  if (tone === "priority") {
    if (progress < 0.55) return "high";
    if (progress < 0.8) return "medium";
    return "low";
  }

  if (tone === "consolidate") {
    if (progress < 0.35) return "medium";
    if (progress < 0.7) return "high";
    return "medium";
  }

  // solid
  if (progress < 0.5) return "low";
  return "rest";
}

export const INTENSITY_CELL_CLASS: Record<PlanCellIntensity, string> = {
  high: "bg-coral text-cream",
  medium: "bg-gold-400/80 text-emerald-900",
  low: "bg-emerald-200 text-emerald-900",
  rest: "bg-sand/80 text-muted",
};

export function getPotentialGainForSubject(
  subjectSlug: string,
  topPriorities: { subjectSlug: string; potentialGain: number }[],
): number | null {
  const match = topPriorities.find((p) => p.subjectSlug === subjectSlug);
  return match?.potentialGain ?? null;
}
