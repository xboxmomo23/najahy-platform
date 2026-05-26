"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import type { ChapterExercisePublic } from "@/app/(app)/chapitre/[slug]/actions";
import {
  completeQuiz,
  submitQuizAnswer,
  type CompleteQuizSummary,
  type QuizResultItem,
} from "@/app/(app)/chapitre/[slug]/quiz-actions";
import { MathRender } from "@/components/shared/MathRender";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PASSING_SCORE = 16;

type QuizPhase = "question" | "submitting" | "results";

type QuestionFeedback = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

function hasLatex(text: string): boolean {
  return (
    text.includes("$") ||
    text.includes("\\(") ||
    text.includes("\\[") ||
    text.includes("\\begin{")
  );
}

function RichText({
  content,
  block = false,
  className,
}: {
  content: string;
  block?: boolean;
  className?: string;
}) {
  if (!content.trim()) return null;

  if (hasLatex(content)) {
    const latex = content
      .replace(/^\$\$/, "")
      .replace(/\$\$$/, "")
      .replace(/^\$/, "")
      .replace(/\$$/, "")
      .trim();
    return (
      <MathRender
        latex={latex}
        block={block || content.includes("$$")}
        className={className}
      />
    );
  }

  return (
    <p className={cn("leading-relaxed text-ink", className)}>{content}</p>
  );
}

function findOptionLabel(
  options: ChapterExercisePublic["options"],
  answerId: string,
): string {
  const opt = options.find((o) => o.id === answerId);
  return opt ? `${opt.letter}. ${opt.label}` : answerId;
}

export interface QuizModeProps {
  exercises: ChapterExercisePublic[];
  chapterId: string;
  chapterSlug: string;
  chapterTitle: string;
  onClose: () => void;
  /** Slug du chapitre suivant (optionnel) */
  nextChapterSlug?: string | null;
}

export function QuizMode({
  exercises,
  chapterId,
  chapterSlug,
  chapterTitle,
  onClose,
  nextChapterSlug,
}: QuizModeProps) {
  const total = exercises.length;

  const [phase, setPhase] = useState<QuizPhase>("question");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
  const [answerRecords, setAnswerRecords] = useState<QuizResultItem[]>([]);
  const [summary, setSummary] = useState<CompleteQuizSummary | null>(null);
  const [direction, setDirection] = useState(1);

  const [isValidating, startValidate] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  const current = exercises[questionIndex];
  const progressPercent =
    phase === "results"
      ? 100
      : Math.round(((questionIndex + (feedback ? 1 : 0)) / total) * 100);

  const resetQuiz = useCallback(() => {
    setPhase("question");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setFeedback(null);
    setAnswerRecords([]);
    setSummary(null);
    setDirection(1);
  }, []);

  const handleValidate = () => {
    if (!current || !selectedAnswer || feedback) return;

    startValidate(async () => {
      const response = await submitQuizAnswer(current.id, selectedAnswer);

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      setFeedback({
        isCorrect: response.isCorrect,
        correctAnswer: response.correctAnswer,
        explanation: response.explanation,
      });
    });
  };

  const handleNext = () => {
    if (!feedback || !current) return;

    const newRecords: QuizResultItem[] = [
      ...answerRecords,
      { exerciseId: current.id, isCorrect: feedback.isCorrect },
    ];

    const isLast = questionIndex >= total - 1;

    if (isLast) {
      setAnswerRecords(newRecords);
      setPhase("submitting");
      startSubmit(async () => {
        const response = await completeQuiz(chapterId, newRecords);

        if (!response.success) {
          toast.error(response.error);
          setPhase("question");
          return;
        }

        setSummary(response.summary);
        setPhase("results");
      });
      return;
    }

    setAnswerRecords(newRecords);
    setDirection(1);
    setQuestionIndex((i) => i + 1);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const passed = (summary?.score ?? 0) >= PASSING_SCORE;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* Top bar */}
      <header className="shrink-0 border-b border-sand bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-gold-600">
              Quiz — {chapterTitle}
            </p>
            {phase === "question" ? (
              <p className="text-sm font-medium text-emerald-900">
                Question {questionIndex + 1} sur {total}
              </p>
            ) : phase === "submitting" ? (
              <p className="text-sm font-medium text-emerald-900">
                Enregistrement…
              </p>
            ) : (
              <p className="text-sm font-medium text-emerald-900">Résultats</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-emerald-900"
            aria-label="Fermer le quiz"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-sand">
            <motion.div
              className="h-full rounded-full bg-emerald-800"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {phase === "submitting" ? (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col items-center justify-center py-20 text-center"
            >
              <Loader2
                className="size-12 animate-spin text-emerald-800"
                aria-hidden
              />
              <p className="mt-6 font-display text-2xl font-semibold text-emerald-900">
                On enregistre tes résultats…
              </p>
              <p className="mt-2 text-sm text-muted">
                Mise à jour de ta progression et de tes compétences.
              </p>
            </motion.div>
          ) : null}

          {phase === "results" && summary ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col"
            >
              <div
                className={cn(
                  "rounded-2xl border px-6 py-10 text-center sm:px-10",
                  passed
                    ? "border-emerald-200 bg-emerald-100"
                    : "border-gold-400/40 bg-gold-100/60",
                )}
              >
                {passed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                      delay: 0.1,
                    }}
                  >
                    <CheckCircle2
                      className="mx-auto size-16 text-emerald-700"
                      aria-hidden
                    />
                  </motion.div>
                ) : (
                  <Sparkles
                    className="mx-auto size-12 text-gold-600"
                    aria-hidden
                  />
                )}

                <h2 className="mt-5 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
                  {passed ? "Chapitre validé ! ✓" : "Continue à t'entraîner"}
                </h2>

                <p className="mt-3 font-display text-5xl font-semibold text-gold-600">
                  {summary.score.toFixed(1)}
                  <span className="text-2xl text-muted">/20</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  {summary.correctCount}{" "}
                  {summary.correctCount > 1
                    ? "bonnes réponses"
                    : "bonne réponse"}{" "}
                  sur {summary.totalQuestions}
                </p>

                {!passed ? (
                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-emerald-900">
                    Tu y es presque — revois l&apos;onglet{" "}
                    <strong>Cours</strong> puis retente le quiz pour viser les{" "}
                    {PASSING_SCORE}/20.
                  </p>
                ) : (
                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-emerald-800">
                    Excellent travail sur ce chapitre. Tu peux enchaîner sur la
                    suite de ton parcours.
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetQuiz}
                  className="border-sand bg-cream text-emerald-900"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Refaire le quiz
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-emerald-800 text-cream hover:bg-emerald-900"
                >
                  Retour au chapitre
                </Button>
                {nextChapterSlug ? (
                  <Link
                    href={`/app/chapitre/${nextChapterSlug}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-sand bg-paper px-4 text-sm font-medium text-emerald-900 transition-colors hover:bg-cream"
                  >
                    Chapitre suivant
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : (
                  <Link
                    href="/app/bibliotheque"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-sand bg-paper px-4 text-sm font-medium text-emerald-900 transition-colors hover:bg-cream"
                  >
                    Bibliothèque
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : null}

          {phase === "question" && current ? (
            <motion.div
              key={`q-${questionIndex}`}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="rounded-2xl border border-sand bg-paper p-6 sm:p-8">
                <RichText
                  content={current.question}
                  block
                  className="text-lg sm:text-xl"
                />

                <div className="mt-6 grid gap-3">
                  {current.options.map((opt) => {
                    const selected = selectedAnswer === opt.id;
                    const disabled = Boolean(feedback);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedAnswer(opt.id)}
                        className={cn(
                          "flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                          disabled && "cursor-default",
                          selected
                            ? "border-emerald-800 bg-emerald-50"
                            : "border-sand bg-cream hover:border-emerald-700/30",
                          feedback &&
                            selected &&
                            feedback.isCorrect &&
                            "border-emerald-700 bg-emerald-100",
                          feedback &&
                            selected &&
                            !feedback.isCorrect &&
                            "border-coral bg-coral-100/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                            selected
                              ? "bg-emerald-800 text-cream"
                              : "bg-sand text-emerald-800",
                          )}
                        >
                          {opt.letter}
                        </span>
                        <span className="min-w-0 flex-1 pt-0.5">
                          <RichText content={opt.label} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {feedback ? (
                  <motion.div
                    key={feedback.isCorrect ? "ok" : "ko"}
                    initial={{ opacity: 0, y: 16, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                    }}
                    className={cn(
                      "mt-6 rounded-2xl border-2 px-5 py-5 sm:px-6",
                      feedback.isCorrect
                        ? "border-emerald-300 bg-emerald-100"
                        : "border-coral/50 bg-coral-100/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle2
                          className="size-7 shrink-0 text-emerald-700"
                          aria-hidden
                        />
                      ) : (
                        <XCircle
                          className="size-7 shrink-0 text-coral"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-display text-xl font-semibold",
                            feedback.isCorrect
                              ? "text-emerald-900"
                              : "text-coral",
                          )}
                        >
                          {feedback.isCorrect
                            ? "Bravo !"
                            : "Pas tout à fait"}
                        </p>
                        {!feedback.isCorrect ? (
                          <p className="mt-2 text-sm text-emerald-900">
                            La bonne réponse :{" "}
                            <strong>
                              {findOptionLabel(
                                current.options,
                                feedback.correctAnswer,
                              )}
                            </strong>
                          </p>
                        ) : null}
                        {feedback.explanation ? (
                          <div className="mt-3 text-sm leading-relaxed text-ink/90">
                            <RichText content={feedback.explanation} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end">
                {!feedback ? (
                  <Button
                    type="button"
                    disabled={!selectedAnswer || isValidating}
                    onClick={handleValidate}
                    className="h-11 bg-emerald-800 text-cream hover:bg-emerald-900"
                  >
                    {isValidating ? (
                      <>
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden
                        />
                        Vérification…
                      </>
                    ) : (
                      "Valider"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="h-11 bg-emerald-800 text-cream hover:bg-emerald-900"
                  >
                    {questionIndex < total - 1
                      ? "Question suivante"
                      : "Voir les résultats"}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
