import type { DiagnosticPriority } from "@/lib/diagnostic/scoring";

import type {
  CompetencySubjectNode,
  LibraryChapter,
} from "@/app/(app)/bibliotheque/actions";
import type { Database } from "@/types/database.types";

export type ViewMode = "grid" | "list" | "tree";

export type SortMode =
  | "recommended"
  | "program"
  | "bac"
  | "duration";

export type ChapterStatus = Database["public"]["Enums"]["chapter_status"];

export type StatusFilter = ChapterStatus;

export type DifficultyFilter = "easy" | "medium" | "hard";

export type DurationFilter = "short" | "medium" | "long";

export type LibraryFilters = {
  search: string;
  subjectSlug: string | null;
  statuses: StatusFilter[];
  difficulties: DifficultyFilter[];
  durations: DurationFilter[];
  bacFrequencyPriority: boolean;
};

export const DEFAULT_FILTERS: LibraryFilters = {
  search: "",
  subjectSlug: null,
  statuses: [],
  difficulties: [],
  durations: [],
  bacFrequencyPriority: false,
};

export const STATUS_LABELS: Record<ChapterStatus, string> = {
  completed: "Validé",
  in_progress: "En cours",
  not_started: "Non commencé",
  to_review: "À reprendre",
};

export const STATUS_STRIPE: Record<ChapterStatus, string> = {
  completed: "bg-emerald-600",
  in_progress: "bg-gold-500",
  not_started: "bg-sand",
  to_review: "bg-coral",
};

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "recommended", label: "Recommandé pour toi" },
  { value: "program", label: "Ordre du programme" },
  { value: "bac", label: "Priorité BAC" },
  { value: "duration", label: "Durée" },
];

function matchesSearch(chapter: LibraryChapter, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    chapter.title.toLowerCase().includes(q) ||
    (chapter.description?.toLowerCase().includes(q) ?? false) ||
    chapter.subjectName.toLowerCase().includes(q)
  );
}

function matchesDifficulty(
  chapter: LibraryChapter,
  filters: DifficultyFilter[],
): boolean {
  if (filters.length === 0) return true;
  const d = chapter.difficulty ?? 2;
  return filters.some((f) => {
    if (f === "easy") return d <= 1;
    if (f === "medium") return d === 2;
    return d >= 3;
  });
}

function matchesDuration(
  chapter: LibraryChapter,
  filters: DurationFilter[],
): boolean {
  if (filters.length === 0) return true;
  const minutes = chapter.estimatedDuration ?? 30;
  return filters.some((f) => {
    if (f === "short") return minutes < 20;
    if (f === "medium") return minutes >= 20 && minutes <= 45;
    return minutes > 45;
  });
}

export function buildChapterNumberMap(
  chapters: LibraryChapter[],
): Map<string, number> {
  const map = new Map<string, number>();
  const bySubject = new Map<string, LibraryChapter[]>();

  for (const ch of chapters) {
    const list = bySubject.get(ch.subjectSlug) ?? [];
    list.push(ch);
    bySubject.set(ch.subjectSlug, list);
  }

  for (const list of bySubject.values()) {
    list.forEach((ch, index) => {
      map.set(ch.id, index + 1);
    });
  }

  return map;
}

export function buildRecommendationRank(
  recommendations: DiagnosticPriority[] | null,
): Map<string, number> {
  const map = new Map<string, number>();
  recommendations?.forEach((rec, index) => {
    map.set(rec.chapterSlug, index);
  });
  return map;
}

export function filterChapters(
  chapters: LibraryChapter[],
  filters: LibraryFilters,
): LibraryChapter[] {
  return chapters.filter((chapter) => {
    if (filters.subjectSlug && chapter.subjectSlug !== filters.subjectSlug) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(chapter.status)
    ) {
      return false;
    }
    if (!matchesSearch(chapter, filters.search)) return false;
    if (!matchesDifficulty(chapter, filters.difficulties)) return false;
    if (!matchesDuration(chapter, filters.durations)) return false;
    return true;
  });
}

export function sortChapters(
  chapters: LibraryChapter[],
  sortMode: SortMode,
  programOrder: Map<string, number>,
  recommendationRank: Map<string, number>,
  bacFrequencyPriority: boolean,
): LibraryChapter[] {
  const sorted = [...chapters];

  sorted.sort((a, b) => {
    if (bacFrequencyPriority) {
      const bacA = (a.bacFrequency ?? 0) > 0 ? 1 : 0;
      const bacB = (b.bacFrequency ?? 0) > 0 ? 1 : 0;
      if (bacB !== bacA) return bacB - bacA;
      const freqDiff = (b.bacFrequency ?? 0) - (a.bacFrequency ?? 0);
      if (freqDiff !== 0) return freqDiff;
    }

    switch (sortMode) {
      case "recommended": {
        const rankA = recommendationRank.get(a.slug) ?? 999;
        const rankB = recommendationRank.get(b.slug) ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return (programOrder.get(a.id) ?? 0) - (programOrder.get(b.id) ?? 0);
      }
      case "bac": {
        const freq = (b.bacFrequency ?? 0) - (a.bacFrequency ?? 0);
        if (freq !== 0) return freq;
        return (programOrder.get(a.id) ?? 0) - (programOrder.get(b.id) ?? 0);
      }
      case "duration": {
        const dur =
          (a.estimatedDuration ?? 999) - (b.estimatedDuration ?? 999);
        if (dur !== 0) return dur;
        return (programOrder.get(a.id) ?? 0) - (programOrder.get(b.id) ?? 0);
      }
      case "program":
      default:
        return (programOrder.get(a.id) ?? 0) - (programOrder.get(b.id) ?? 0);
    }
  });

  return sorted;
}

export function getUniqueSubjects(
  chapters: LibraryChapter[],
): { slug: string; name: string; color: string | null }[] {
  const seen = new Map<string, { slug: string; name: string; color: string | null }>();
  for (const ch of chapters) {
    if (!seen.has(ch.subjectSlug)) {
      seen.set(ch.subjectSlug, {
        slug: ch.subjectSlug,
        name: ch.subjectName,
        color: ch.subjectColor,
      });
    }
  }
  return Array.from(seen.values());
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

export function getDifficultyLabel(difficulty: number | null): string {
  const d = difficulty ?? 2;
  if (d <= 1) return "Facile";
  if (d === 2) return "Moyen";
  return "Difficile";
}

export function isChapterLocked(
  chapter: LibraryChapter,
  subscriptionPlan: "free" | "standard" | "premium",
): boolean {
  return !chapter.isFree && subscriptionPlan === "free";
}

export type ProcessedLibrary = {
  filtered: LibraryChapter[];
  competencyTree: CompetencySubjectNode[];
};

export function processLibraryData(
  chapters: LibraryChapter[],
  competencyTree: CompetencySubjectNode[],
  filters: LibraryFilters,
  sortMode: SortMode,
  recommendations: DiagnosticPriority[] | null,
): ProcessedLibrary {
  const programOrder = new Map(chapters.map((ch, i) => [ch.id, i]));
  const recommendationRank = buildRecommendationRank(recommendations);

  const filtered = sortChapters(
    filterChapters(chapters, filters),
    sortMode,
    programOrder,
    recommendationRank,
    filters.bacFrequencyPriority,
  );

  return { filtered, competencyTree };
}
