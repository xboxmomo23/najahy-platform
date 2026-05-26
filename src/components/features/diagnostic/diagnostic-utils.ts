import type { DiagnosticQuestionsBySubject } from "@/app/(app)/diagnostic/actions";
import type { Json } from "@/types/database.types";

export type QcmOption = {
  id: string;
  letter: string;
  label: string;
};

export type FlatQuestion = {
  id: string;
  question: string;
  questionLatex: string | null;
  options: QcmOption[];
  difficulty: number;
  subjectSlug: string;
  subjectName: string;
  relatedChapterSlug: string;
  globalIndex: number;
};

const EMOJI_SCALE = [
  { score: 1, emoji: "😟", label: "Très inquiet" },
  { score: 2, emoji: "😐", label: "Peu sûr" },
  { score: 3, emoji: "🙂", label: "Moyen" },
  { score: 4, emoji: "😊", label: "Confiant" },
  { score: 5, emoji: "🤩", label: "Très confiant" },
] as const;

export { EMOJI_SCALE };

export const TARGET_SCORES = [
  { value: 10, label: "10/20", subtitle: "BAC" },
  { value: 14, label: "14/20", subtitle: "Mention Bien" },
  { value: 16, label: "16/20", subtitle: "Très Bien" },
  { value: 18, label: "18+/20", subtitle: "Médecine / ENS" },
] as const;

export const HOURS_OPTIONS = [
  { value: 5, label: "≤5h" },
  { value: 8, label: "5-10h" },
  { value: 12, label: "10-15h" },
  { value: 20, label: "15h+" },
] as const;

export const FOCUS_AREAS = [
  "Combler mes lacunes",
  "M'entraîner sur des annales",
  "Méthode et rédaction",
  "Gestion du stress",
] as const;

export function parseQcmOptions(options: Json): QcmOption[] {
  if (!Array.isArray(options)) return [];

  return options.map((opt, index) => {
    const letter = String.fromCharCode(65 + index);

    if (typeof opt === "string") {
      return { id: letter, letter, label: opt };
    }

    if (typeof opt === "object" && opt !== null) {
      const row = opt as Record<string, unknown>;
      const id = String(row.id ?? row.value ?? letter);
      return {
        id,
        letter,
        label: String(row.label ?? row.text ?? ""),
      };
    }

    return { id: letter, letter, label: "" };
  });
}

export function flattenQuestions(
  bySubject: DiagnosticQuestionsBySubject[],
): FlatQuestion[] {
  let globalIndex = 0;
  const flat: FlatQuestion[] = [];

  for (const subject of bySubject) {
    for (const q of subject.questions) {
      globalIndex += 1;
      flat.push({
        id: q.id,
        question: q.question,
        questionLatex: q.questionLatex,
        options: parseQcmOptions(q.options),
        difficulty: q.difficulty,
        subjectSlug: q.subjectSlug,
        subjectName: q.subjectName,
        relatedChapterSlug: q.relatedChapterSlug,
        globalIndex,
      });
    }
  }

  return flat;
}

export function getProgressPercent(
  phase: number,
  questionIndex: number,
  totalQuestions: number,
): number {
  switch (phase) {
    case 1:
      return 5;
    case 2:
      return 20;
    case 3:
      if (totalQuestions <= 0) return 20;
      return 20 + Math.round((questionIndex / totalQuestions) * 40);
    case 4:
      return 80;
    case 5:
      return 100;
    default:
      return 0;
  }
}

export function getTimeEstimate(phase: number): string {
  switch (phase) {
    case 1:
      return "~15 min";
    case 2:
      return "~12 min";
    case 3:
      return "~10 min";
    case 4:
      return "~3 min";
    default:
      return "";
  }
}

export const TONE_STYLES = {
  force: {
    label: "Force",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  solid: {
    label: "Solide",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  consolidate: {
    label: "À consolider",
    className: "bg-gold-100 text-gold-600 border-gold-400/40",
  },
  priority: {
    label: "Priorité",
    className: "bg-coral-100 text-coral border-coral/30",
  },
} as const;
