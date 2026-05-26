"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  submitDiagnostic,
  type DiagnosticQuestionsBySubject,
} from "@/app/(app)/diagnostic/actions";
import { Logo } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import { cn } from "@/lib/utils";

import { MathRender } from "@/components/shared/MathRender";
import { DiagnosticResults } from "./DiagnosticResults";
import {
  EMOJI_SCALE,
  FOCUS_AREAS,
  flattenQuestions,
  getProgressPercent,
  getTimeEstimate,
  HOURS_OPTIONS,
  TARGET_SCORES,
} from "./diagnostic-utils";

type Phase = 1 | 2 | 3 | 4 | 5;

type WizardState = {
  confidenceScores: Record<string, number>;
  answers: Record<string, string>;
  targetScore: number | null;
  hoursPerWeek: number | null;
  focusAreas: string[];
};

const INITIAL_STATE: WizardState = {
  confidenceScores: {},
  answers: {},
  targetScore: null,
  hoursPerWeek: null,
  focusAreas: [],
};

function DifficultyBars({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-0.5" aria-label={`Difficulté ${level}/3`}>
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-1 rounded-sm",
            bar <= level ? "h-3 bg-emerald-700" : "h-2 bg-sand",
          )}
        />
      ))}
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  title,
  subtitle,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2",
        selected
          ? "border-emerald-800 bg-emerald-50 shadow-sm"
          : "border-sand bg-cream hover:border-emerald-700/40",
        className,
      )}
    >
      <p className="font-display text-lg font-semibold text-emerald-900">{title}</p>
      {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
    </button>
  );
}

export interface DiagnosticWizardProps {
  questionsBySubject: DiagnosticQuestionsBySubject[];
  firstName: string;
}

export function DiagnosticWizard({
  questionsBySubject,
  firstName,
}: DiagnosticWizardProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(1);
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPending, startTransition] = useTransition();

  const flatQuestions = useMemo(
    () => flattenQuestions(questionsBySubject),
    [questionsBySubject],
  );

  const totalQuestions = flatQuestions.length;
  const currentQuestion = flatQuestions[questionIndex];
  const currentAnswer = currentQuestion
    ? form.answers[currentQuestion.id]
    : undefined;

  const progress = getProgressPercent(phase, questionIndex + 1, totalQuestions);

  const confidenceComplete = questionsBySubject.every(
    (s) => form.confidenceScores[s.subjectSlug] !== undefined,
  );

  const goPhase = (next: Phase) => {
    setDirection(next > phase ? 1 : -1);
    setPhase(next);
  };

  const setConfidence = (subjectSlug: string, score: number) => {
    setForm((prev) => ({
      ...prev,
      confidenceScores: { ...prev.confidenceScores, [subjectSlug]: score },
    }));
  };

  const setAnswer = (questionId: string, selectedAnswer: string) => {
    setForm((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: selectedAnswer },
    }));
  };

  const toggleFocus = (area: string) => {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = () => {
    if (form.targetScore === null || form.hoursPerWeek === null) {
      toast.error("Choisis ton objectif et ton rythme hebdomadaire.");
      return;
    }

    const confidenceScores = questionsBySubject.map((s) => ({
      subjectSlug: s.subjectSlug,
      score: form.confidenceScores[s.subjectSlug] ?? 3,
    }));

    const answers = flatQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: form.answers[q.id] ?? "",
    }));

    if (answers.some((a) => !a.selectedAnswer)) {
      toast.error("Réponds à toutes les questions avant de continuer.");
      goPhase(3);
      return;
    }

    startTransition(async () => {
      const response = await submitDiagnostic({
        confidenceScores,
        answers,
        targetScore: form.targetScore!,
        hoursPerWeek: form.hoursPerWeek!,
        focusAreas: form.focusAreas,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      setResult(response.result);
      goPhase(5);
    });
  };

  const handleQuit = () => {
    setQuitOpen(false);
    router.push("/dashboard");
  };

  const nextQuestion = () => {
    if (!currentQuestion || !currentAnswer) return;
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      goPhase(4);
    }
  };

  const prevQuestion = () => {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" showText={false} />
            <span className="font-display text-lg font-semibold text-emerald-900">
              Diagnostic
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="size-4 shrink-0" aria-hidden />
            <span>{getTimeEstimate(phase)}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuitOpen(true)}
            className="text-sm font-medium text-muted transition-colors hover:text-coral"
          >
            Quitter
          </button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-emerald-800 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              isPending
                ? "loading"
                : phase === 3
                  ? `q-${questionIndex}`
                  : `phase-${phase}`
            }
            initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Loader2
                  className="size-12 animate-spin text-emerald-800"
                  aria-hidden
                />
                <p className="mt-6 font-display text-2xl text-emerald-900">
                  On analyse tes réponses…
                </p>
                <p className="mt-2 text-muted">
                  Calcul de ta note prédictive et de ton plan personnalisé.
                </p>
              </div>
            ) : null}

            {/* Phase 1 — Accueil */}
            {!isPending && phase === 1 ? (
              <div className="space-y-10 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                    Bienvenue
                  </p>
                  <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-emerald-900 sm:text-5xl">
                    Pas un test.
                    <br />
                    Une exploration.
                  </h1>
                  <p className="mx-auto mt-4 max-w-md text-muted leading-relaxed">
                    On cartographie tes forces et tes lacunes pour bâtir un plan
                    BAC vraiment à ta mesure.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "15 minutes", sub: "Chrono moyen" },
                    { title: "20 questions", sub: "5 par matière" },
                    { title: "Plan instantané", sub: "Résultats immédiats" },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="rounded-xl border border-sand bg-paper px-4 py-6"
                    >
                      <p className="font-display text-xl font-semibold text-emerald-900">
                        {card.title}
                      </p>
                      <p className="mt-1 text-sm text-muted">{card.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-emerald-900 px-6 py-8 text-left text-cream sm:px-10">
                  <p className="font-display text-lg leading-relaxed sm:text-xl">
                    À la fin, tu repars avec une note prédictive, tes priorités
                    par matière et une première étape concrète — pas une simple
                    note sur 20.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => goPhase(2)}
                  className="h-12 min-w-[200px] bg-emerald-800 text-base text-cream hover:bg-emerald-900"
                >
                  C&apos;est parti
                </Button>
              </div>
            ) : null}

            {/* Phase 2 — Auto-évaluation */}
            {!isPending && phase === 2 ? (
              <div className="space-y-8">
                <header>
                  <h1 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
                    Comment te sens-tu ?
                  </h1>
                  <p className="mt-3 text-muted leading-relaxed">
                    Avant les questions, indique ton niveau de confiance par
                    matière. Il n&apos;y a pas de bonne ou mauvaise réponse.
                  </p>
                </header>

                <div className="space-y-8">
                  {questionsBySubject.map((subject) => (
                    <section
                      key={subject.subjectSlug}
                      className="rounded-xl border border-sand bg-cream p-5"
                    >
                      <h2 className="font-medium text-emerald-900">
                        {subject.subjectName}
                      </h2>
                      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
                        {EMOJI_SCALE.map((item) => {
                          const selected =
                            form.confidenceScores[subject.subjectSlug] ===
                            item.score;
                          return (
                            <button
                              key={item.score}
                              type="button"
                              onClick={() =>
                                setConfidence(subject.subjectSlug, item.score)
                              }
                              className={cn(
                                "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl border-2 px-3 py-2 transition-all",
                                selected
                                  ? "border-emerald-800 bg-emerald-50"
                                  : "border-transparent bg-paper hover:border-sand",
                              )}
                              aria-pressed={selected}
                              aria-label={`${item.label} — ${subject.subjectName}`}
                            >
                              <span className="text-2xl">{item.emoji}</span>
                              <span className="text-[10px] text-muted">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                <Button
                  type="button"
                  disabled={!confidenceComplete}
                  onClick={() => {
                    setQuestionIndex(0);
                    goPhase(3);
                  }}
                  className="h-11 w-full bg-emerald-800 text-cream hover:bg-emerald-900 sm:w-auto sm:min-w-[200px]"
                >
                  Continuer
                </Button>
              </div>
            ) : null}

            {/* Phase 3 — Questions */}
            {!isPending && phase === 3 && currentQuestion ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted">
                    Question {currentQuestion.globalIndex} sur {totalQuestions}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      {currentQuestion.subjectName}
                    </span>
                    <DifficultyBars level={currentQuestion.difficulty} />
                  </div>
                </div>

                <div className="rounded-2xl border border-sand bg-paper p-6 sm:p-8">
                  <p className="text-lg leading-relaxed text-ink">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.questionLatex ? (
                    <MathRender
                      latex={currentQuestion.questionLatex}
                      block
                      className="rounded-lg bg-paper px-4 py-3"
                    />
                  ) : null}

                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options.map((opt) => {
                      const selected = currentAnswer === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAnswer(currentQuestion.id, opt.id)}
                          className={cn(
                            "flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                            selected
                              ? "border-emerald-800 bg-emerald-50"
                              : "border-sand bg-cream hover:border-emerald-700/30",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                              selected
                                ? "bg-emerald-800 text-cream"
                                : "bg-sand text-emerald-800",
                            )}
                          >
                            {opt.letter}
                          </span>
                          <span className="pt-1 text-ink">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={questionIndex === 0}
                    className="border-sand"
                  >
                    Question précédente
                  </Button>
                  <Button
                    type="button"
                    onClick={nextQuestion}
                    disabled={!currentAnswer}
                    className="bg-emerald-800 text-cream hover:bg-emerald-900"
                  >
                    {questionIndex < totalQuestions - 1
                      ? "Question suivante"
                      : "Continuer"}
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Phase 4 — Objectifs */}
            {phase === 4 ? (
              <div className="space-y-10">
                <header>
                  <h1 className="font-display text-3xl font-semibold text-emerald-900">
                    Tes objectifs
                  </h1>
                  <p className="mt-3 text-muted">
                    Dernière étape avant tes résultats personnalisés.
                  </p>
                </header>

                <section className="space-y-3">
                  <h2 className="font-medium text-emerald-900">
                    Quelle moyenne vises-tu ?
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TARGET_SCORES.map((opt) => (
                      <SelectableCard
                        key={opt.value}
                        selected={form.targetScore === opt.value}
                        onClick={() =>
                          setForm((p) => ({ ...p, targetScore: opt.value }))
                        }
                        title={opt.label}
                        subtitle={opt.subtitle}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="font-medium text-emerald-900">
                    Combien d&apos;heures par semaine ?
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {HOURS_OPTIONS.map((opt) => (
                      <SelectableCard
                        key={opt.value}
                        selected={form.hoursPerWeek === opt.value}
                        onClick={() =>
                          setForm((p) => ({ ...p, hoursPerWeek: opt.value }))
                        }
                        title={opt.label}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="font-medium text-emerald-900">
                    Sur quoi te concentrer ?
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FOCUS_AREAS.map((area) => (
                      <SelectableCard
                        key={area}
                        selected={form.focusAreas.includes(area)}
                        onClick={() => toggleFocus(area)}
                        title={area}
                        className="p-3"
                      />
                    ))}
                  </div>
                </section>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isPending ||
                    form.targetScore === null ||
                    form.hoursPerWeek === null
                  }
                  className="h-11 w-full bg-emerald-800 text-cream hover:bg-emerald-900"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Analyse en cours…
                    </>
                  ) : (
                    "Voir mes résultats"
                  )}
                </Button>
              </div>
            ) : null}

            {/* Phase 5 — Résultats */}
            {!isPending && phase === 5 && result ? (
              <DiagnosticResults result={result} firstName={firstName} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <Dialog open={quitOpen} onOpenChange={setQuitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter le diagnostic ?</DialogTitle>
            <DialogDescription>
              Ton avancement ne sera pas sauvegardé. Tu pourras recommencer plus
              tard depuis ton dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuitOpen(false)}
            >
              Continuer
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleQuit}
            >
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
