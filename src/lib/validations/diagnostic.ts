import { z } from "zod";

export const diagnosticConfidenceScoreSchema = z.object({
  subjectSlug: z.string().min(1, "Matière requise"),
  /** Auto-évaluation phase 2 : échelle 1 (😟) à 5 (🤩) */
  score: z.number().min(1).max(5),
});

export const diagnosticAnswerSchema = z.object({
  questionId: z.string().min(1, "Question requise"),
  selectedAnswer: z.string().min(1, "Réponse requise"),
});

export const submitDiagnosticSchema = z.object({
  confidenceScores: z.array(diagnosticConfidenceScoreSchema).min(1),
  answers: z.array(diagnosticAnswerSchema).min(1),
  targetScore: z.number().min(10).max(20),
  hoursPerWeek: z.number().min(1).max(40),
  focusAreas: z.array(z.string()).default([]),
});

export type SubmitDiagnosticPayload = z.infer<typeof submitDiagnosticSchema>;
