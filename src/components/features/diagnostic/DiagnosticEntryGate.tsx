"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, BarChart3, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { DiagnosticQuestionsBySubject } from "@/app/(app)/diagnostic/actions";
import { Logo } from "@/components/shared";
import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import { cn } from "@/lib/utils";

import { DiagnosticResults } from "./DiagnosticResults";
import { DiagnosticWizard } from "./DiagnosticWizard";

type View = "choice" | "review" | "retake-warning" | "wizard";

export interface DiagnosticEntryGateProps {
  firstName: string;
  existingResult: DiagnosticResult | null;
  questionsBySubject: DiagnosticQuestionsBySubject[];
  completedAt?: string | null;
}

function formatCompletedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DiagnosticEntryGate({
  firstName,
  existingResult,
  questionsBySubject,
  completedAt,
}: DiagnosticEntryGateProps) {
  const [view, setView] = useState<View>("choice");
  const completedLabel = formatCompletedDate(completedAt);

  if (view === "wizard") {
    return (
      <DiagnosticWizard
        questionsBySubject={questionsBySubject}
        firstName={firstName}
      />
    );
  }

  if (view === "review" && existingResult) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={() => setView("choice")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-emerald-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour au choix
        </button>
        <DiagnosticResults result={existingResult} firstName={firstName} />
        <p className="mt-8 text-center text-sm text-muted">
          <Link
            href="/dashboard"
            className="font-medium text-emerald-800 underline-offset-2 hover:underline"
          >
            Retour au tableau de bord
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10 sm:py-14">
      <div className="mb-10 flex justify-center">
        <Logo size="md" href="/dashboard" />
      </div>

      <AnimatePresence mode="wait">
        {view === "retake-warning" ? (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-1 flex-col"
          >
            <div className="rounded-2xl border border-gold-400/40 bg-gold-100 px-5 py-5">
              <div className="flex gap-3">
                <AlertTriangle
                  className="size-5 shrink-0 text-gold-700"
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-emerald-900">
                    Cela remplacera ton diagnostic actuel
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Ton score prédictif, tes priorités par matière et ton plan
                    seront recalculés à partir de tes nouvelles réponses. L&apos;ancien
                    résultat ne sera plus accessible.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView("wizard")}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors",
                  "bg-emerald-800 text-cream hover:bg-emerald-900",
                )}
              >
                Je comprends, recommencer le diagnostic
              </button>
              <button
                type="button"
                onClick={() => setView("choice")}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-colors",
                  "border-sand bg-cream text-emerald-900 hover:bg-paper",
                )}
              >
                Annuler
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-1 flex-col text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Diagnostic déjà réalisé
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-emerald-900">
              Que veux-tu faire, {firstName} ?
            </h1>
            {completedLabel ? (
              <p className="mt-2 text-sm text-muted">
                Dernier diagnostic : {completedLabel}
              </p>
            ) : null}

            <div className="mt-10 flex flex-col gap-4 text-left">
              <button
                type="button"
                onClick={() => setView("review")}
                disabled={!existingResult}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-colors",
                  existingResult
                    ? "border-sand bg-paper hover:border-emerald-300 hover:bg-cream"
                    : "cursor-not-allowed border-sand/80 bg-paper/60 opacity-60",
                )}
              >
                <span className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <BarChart3 className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold text-emerald-900">
                      Revoir mes résultats
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {existingResult
                        ? "Score prédictif, matières et plan tel qu’enregistrés lors de ta dernière session."
                        : "Résultats indisponibles — consulte ton tableau de bord ou refais le diagnostic."}
                    </span>
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setView("retake-warning")}
                className="rounded-2xl border border-sand bg-paper p-5 text-left transition-colors hover:border-emerald-300 hover:bg-cream"
              >
                <span className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                    <RotateCcw className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold text-emerald-900">
                      Refaire le diagnostic
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      Utile si tu as progressé — environ 15 minutes, comme la
                      première fois.
                    </span>
                  </span>
                </span>
              </button>
            </div>

            <Link
              href="/dashboard"
              className="mt-auto pt-10 text-sm font-medium text-muted transition-colors hover:text-emerald-800"
            >
              Retour au tableau de bord
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
