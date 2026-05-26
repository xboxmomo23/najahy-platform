"use client";

import { motion } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";

import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import { cn } from "@/lib/utils";

import {
  formatWeakChapter,
  getDaysUntilBac,
  getDisplayWeekCount,
  getPotentialGainForSubject,
  getSubjectIcon,
} from "./diagnostic-results-helpers";
import { StudyPlanGrid } from "./StudyPlanGrid";
import { TONE_STYLES } from "./diagnostic-utils";

export interface DiagnosticResultsProps {
  result: DiagnosticResult;
  firstName: string;
}

function FadeUpSection({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function AnimatedProgressBar({
  value,
  delay = 0,
  barClassName,
}: {
  value: number;
  delay?: number;
  barClassName?: string;
}) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-sand/80">
      <motion.div
        className={cn("h-full rounded-full", barClassName ?? "bg-emerald-700")}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function SuccessCheckIcon() {
  return (
    <div className="relative mx-auto">
      <svg
        width={88}
        height={88}
        viewBox="0 0 96 96"
        fill="none"
        className="mx-auto"
        aria-hidden
      >
        <circle
          cx={48}
          cy={48}
          r={44}
          className="fill-emerald-100 stroke-emerald-600"
          strokeWidth={3}
        />
        <path
          d="M30 48.5L42.5 61L66 35"
          className="stroke-emerald-700"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute -top-1 -right-2 text-2xl"
        aria-hidden
      >
        ✨
      </span>
    </div>
  );
}

export function DiagnosticResults({ result, firstName }: DiagnosticResultsProps) {
  const daysUntilBac = getDaysUntilBac();
  const weekCount = getDisplayWeekCount(daysUntilBac);
  const gap = result.gap;
  const gapPositive = gap > 0;

  const gapHeadline = gapPositive
    ? `+${gap.toFixed(1)} points — C'est atteignable.`
    : gap < 0
      ? `Tu es déjà ${Math.abs(gap).toFixed(1)} pt au-dessus de ton objectif !`
      : "Tu es pile sur ton objectif.";

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-16 pt-4">
      {/* 1. Header célébration */}
      <FadeUpSection delay={0} className="text-center">
        <SuccessCheckIcon />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Ton diagnostic est prêt
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-emerald-900 sm:text-5xl">
          Voici où tu en es, {firstName}.
        </h1>
      </FadeUpSection>

      {/* 2. Score prédictif */}
      <FadeUpSection delay={0.12}>
        <div className="overflow-hidden rounded-2xl bg-emerald-900 px-6 py-10 text-center text-cream shadow-lg sm:px-10 sm:py-12">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-200/90">
            Score prédictif
          </p>
          <p className="mt-4 font-display text-7xl font-semibold tracking-tight text-gold-400 sm:text-8xl">
            {result.predictedScore.toFixed(1)}
          </p>
          <p className="mt-2 text-lg text-emerald-100">
            / 20 au BAC, si tu passais l&apos;examen demain
          </p>
          <p className="mt-6 text-sm text-emerald-200/80">
            Ton objectif :{" "}
            <span className="font-semibold text-gold-400">
              {result.targetScore}/20
            </span>
          </p>
          <p className="mt-4 font-display text-2xl font-semibold text-cream sm:text-3xl">
            {gapHeadline}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-800/60 px-4 py-2 text-sm">
            <CalendarDays className="size-4 text-gold-400" aria-hidden />
            <span>
              BAC dans{" "}
              <strong className="text-gold-400">{daysUntilBac} jours</strong>
            </span>
          </div>
        </div>
      </FadeUpSection>

      {/* 3. Détail par matière */}
      <FadeUpSection delay={0.24} className="space-y-5">
        <h2 className="font-display text-2xl font-semibold text-emerald-900">
          Détail par matière
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {result.subjectScores.map((subject, index) => {
            const tone = TONE_STYLES[subject.tone];
            const isPriority = subject.tone === "priority";
            const potentialGain = getPotentialGainForSubject(
              subject.subjectSlug,
              result.topPriorities,
            );

            return (
              <article
                key={subject.subjectSlug}
                className={cn(
                  "rounded-2xl border bg-cream p-5 transition-shadow",
                  isPriority
                    ? "border-coral shadow-sm shadow-coral/10"
                    : "border-sand",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-xl"
                    aria-hidden
                  >
                    {getSubjectIcon(subject.subjectSlug)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-emerald-900">
                        {subject.subjectName}
                      </h3>
                      <span className="text-xs text-muted">
                        coef. {subject.coefficient}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        tone.className,
                      )}
                    >
                      {tone.label}
                    </span>
                  </div>
                </div>

                <p className="mt-4 font-display text-4xl font-semibold text-emerald-800">
                  {subject.masteryPercentage}
                  <span className="text-2xl text-muted">%</span>
                </p>

                <AnimatedProgressBar
                  value={subject.masteryPercentage}
                  delay={0.35 + index * 0.08}
                  barClassName={
                    isPriority ? "bg-coral" : "bg-emerald-700"
                  }
                />

                <p className="mt-2 text-xs text-muted">
                  {subject.correctCount}/{subject.totalCount} bonnes réponses
                </p>

                {subject.weakChapters.length > 0 ? (
                  <ul className="mt-4 space-y-1 border-t border-sand pt-3">
                    <li className="text-xs font-medium uppercase tracking-wide text-muted">
                      À retravailler
                    </li>
                    {subject.weakChapters.slice(0, 4).map((slug) => (
                      <li
                        key={slug}
                        className="text-sm text-emerald-900 before:mr-1.5 before:text-coral before:content-['•']"
                      >
                        {formatWeakChapter(slug)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 border-t border-sand pt-3 text-sm text-emerald-700">
                    Aucun chapitre critique identifié — continue comme ça.
                  </p>
                )}

                {isPriority && potentialGain !== null ? (
                  <p className="mt-4 rounded-lg bg-coral-100/80 px-3 py-2 text-sm font-medium text-coral">
                    Gain potentiel : +{potentialGain.toFixed(1)} points sur
                    cette matière
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </FadeUpSection>

      {/* 4. Plan personnalisé */}
      <FadeUpSection delay={0.36} className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-emerald-900">
            {weekCount} semaines pour passer de{" "}
            {result.predictedScore.toFixed(1)} à {result.targetScore}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Aperçu de ton rythme jusqu&apos;au BAC — les matières prioritaires
            prennent plus de place en début de parcours.
          </p>
        </div>

        <StudyPlanGrid subjects={result.subjectScores} weekCount={weekCount} />

        <p className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="size-4 shrink-0 text-gold-600" aria-hidden />
          L&apos;IA réajuste ton plan automatiquement chaque semaine.
        </p>
      </FadeUpSection>

      {/* 5. Premier pas */}
      <FadeUpSection delay={0.48}>
        <div className="rounded-2xl bg-emerald-900 px-6 py-8 text-cream sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Premier pas recommandé
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
            Commence par {result.firstStep.chapterTitle}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-emerald-100">
            {result.firstStep.reason}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/app/bibliotheque"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold-500 px-6 text-sm font-semibold text-emerald-900 transition-colors hover:bg-gold-400"
            >
              Commencer ce chapitre
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-600 bg-transparent px-6 text-sm font-medium text-cream transition-colors hover:bg-emerald-800"
            >
              Voir tout mon plan
            </Link>
          </div>
        </div>
      </FadeUpSection>

      {/* 6. Bonus Premium */}
      <FadeUpSection delay={0.6}>
        <div className="rounded-xl border border-gold-400/30 bg-gold-100 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-medium text-emerald-900">
              Tu as 7 jours d&apos;accès Premium gratuit
            </p>
            <p className="mt-1 text-sm text-muted">
              Profite du tuteur IA illimité et des cours visio pendant ta
              préparation.
            </p>
          </div>
          <Link
            href="/tarifs"
            className="mt-4 inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-cream px-5 text-sm font-medium text-emerald-900 transition-colors hover:bg-paper sm:mt-0"
          >
            Voir les offres
          </Link>
        </div>
      </FadeUpSection>
    </div>
  );
}
