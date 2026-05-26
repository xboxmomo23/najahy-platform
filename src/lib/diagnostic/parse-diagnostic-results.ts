import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import type { Json } from "@/types/database.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFirstStep(
  value: unknown,
): DiagnosticResult["firstStep"] | null {
  if (!isRecord(value)) return null;
  const { chapterSlug, chapterTitle, reason } = value;
  if (
    typeof chapterSlug !== "string" ||
    typeof chapterTitle !== "string" ||
    typeof reason !== "string"
  ) {
    return null;
  }
  return { chapterSlug, chapterTitle, reason };
}

/** Parse le JSONB `students.diagnostic_results` en structure typée. */
export function parseDiagnosticResults(
  json: Json | null | undefined,
): DiagnosticResult | null {
  if (!isRecord(json)) return null;

  const predictedScore = json.predictedScore;
  const targetScore = json.targetScore;
  const gap = json.gap;
  const firstStep = parseFirstStep(json.firstStep);

  if (
    typeof predictedScore !== "number" ||
    typeof targetScore !== "number" ||
    typeof gap !== "number" ||
    !firstStep ||
    !Array.isArray(json.subjectScores) ||
    !Array.isArray(json.topPriorities)
  ) {
    return null;
  }

  return json as unknown as DiagnosticResult;
}
