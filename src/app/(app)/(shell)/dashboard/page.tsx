import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { KPICard, PageHeader } from "@/components/shared";
import { getDaysUntilBac } from "@/components/features/diagnostic/diagnostic-results-helpers";
import { getStudentDashboardData } from "@/lib/auth/get-student-dashboard";
import { cn } from "@/lib/utils";

function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="font-display text-xl font-semibold text-emerald-900 sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PreDiagnosticDashboard({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-100/60 px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
          Étape essentielle
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-emerald-900 sm:text-3xl">
          Passe ton diagnostic pour débloquer ton plan personnalisé
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          En 15 minutes, Najahy évalue ton niveau par matière et te propose un
          parcours sur mesure jusqu&apos;au BAC.
        </p>
        <Link
          href="/app/diagnostic"
          className={cn(
            "mt-8 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors",
            "bg-emerald-800 text-cream hover:bg-emerald-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2",
          )}
        >
          Commencer mon diagnostic
        </Link>
      </div>

      <div className="rounded-2xl border border-sand bg-paper px-6 py-6 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-gold-600">
          En attendant
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-emerald-900">
          Bonjour {firstName},
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Explore la bibliothèque de cours pendant que ton plan se prépare.
        </p>
        <Link
          href="/app/bibliotheque"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-sand bg-cream px-4 text-sm font-medium text-emerald-900 transition-colors hover:border-emerald-800/30 hover:bg-paper"
        >
          <BookOpen className="size-4" aria-hidden />
          Accéder à la bibliothèque
        </Link>
      </div>
    </div>
  );
}

function PostDiagnosticDashboard({
  predictedScore,
  targetScore,
  gap,
  daysUntilBac,
  firstStep,
}: {
  predictedScore: number | null;
  targetScore: number | null;
  gap: number | null;
  daysUntilBac: number;
  firstStep: {
    chapterTitle: string;
    reason: string;
  } | null;
}) {
  const gapLabel =
    gap !== null && gap > 0
      ? `+${gap.toFixed(1)} pts à combler`
      : gap !== null && gap <= 0
        ? "Objectif atteint"
        : targetScore !== null
          ? `Objectif ${targetScore}/20`
          : undefined;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          label="Score prédictif"
          value={
            predictedScore !== null ? (
              <span className="text-gold-400">
                {predictedScore.toFixed(1)}
              </span>
            ) : (
              "—"
            )
          }
          delta={gapLabel ? `${gapLabel} · /20 au BAC` : "/20 au BAC"}
          icon={<Target />}
          variant="emerald"
        />
        <KPICard
          label="Compte à rebours"
          value={daysUntilBac}
          delta="jours avant le BAC"
          icon={<CalendarDays />}
        />
        <KPICard
          label="Compétences"
          value="Bientôt"
          delta="Suivi détaillé — Verticale 3"
          deltaTone="neutral"
          icon={<BarChart3 />}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <DashboardSection
        title="Reprends où tu en étais"
        description="Tes derniers chapitres et exercices apparaîtront ici."
      >
        <div className="rounded-xl border border-dashed border-sand bg-paper/80 px-5 py-8 text-center">
          <ClipboardList
            className="mx-auto size-8 text-muted/60"
            aria-hidden
          />
          <p className="mt-3 text-sm font-medium text-emerald-900">
            Reprise de session — bientôt disponible
          </p>
          <p className="mt-1 text-sm text-muted">
            Dès que les chapitres seront en ligne, tu retrouveras ici ton
            dernier point d&apos;arrêt.
          </p>
        </div>
      </DashboardSection>

      {firstStep ? (
        <DashboardSection title="Ton premier pas recommandé">
          <div className="rounded-2xl bg-emerald-900 px-6 py-7 text-cream sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Recommandé par ton diagnostic
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold sm:text-2xl">
              Commence par {firstStep.chapterTitle}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100 sm:text-base">
              {firstStep.reason}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app/bibliotheque"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-gold-500 px-5 text-sm font-semibold text-emerald-900 transition-colors hover:bg-gold-400"
              >
                Commencer ce chapitre
              </Link>
              <Link
                href="/app/plan"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-600 px-5 text-sm font-medium text-cream transition-colors hover:bg-emerald-800"
              >
                Voir mon plan
              </Link>
            </div>
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}

/** Dashboard élève — URL /dashboard */
export default async function StudentDashboardPage() {
  const data = await getStudentDashboardData();
  const daysUntilBac = getDaysUntilBac();

  const predictedScore =
    data.diagnosticResults?.predictedScore ??
    data.currentPredictedScore ??
    null;

  const targetScore =
    data.diagnosticResults?.targetScore ?? data.targetScore ?? null;

  const gap = data.diagnosticResults?.gap ?? null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        tag={data.diagnosticCompleted ? "Tableau de bord" : "Bienvenue"}
        title={`Bonjour ${data.firstName},`}
        description={
          data.diagnosticCompleted
            ? "Voici où tu en es dans ta préparation au BAC."
            : "Ton espace Najahy est prêt — commence par le diagnostic pour personnaliser ton parcours."
        }
        actions={
          data.diagnosticCompleted ? (
            <Link
              href="/app/diagnostic"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sand bg-paper px-3 text-sm font-medium text-emerald-900 transition-colors hover:bg-cream"
            >
              <Sparkles className="size-4" aria-hidden />
              Refaire le diagnostic
            </Link>
          ) : null
        }
      />

      <div className="mt-8">
        {data.diagnosticCompleted ? (
          <PostDiagnosticDashboard
            predictedScore={predictedScore}
            targetScore={targetScore}
            gap={gap}
            daysUntilBac={daysUntilBac}
            firstStep={data.diagnosticResults?.firstStep ?? null}
          />
        ) : (
          <PreDiagnosticDashboard firstName={data.firstName} />
        )}
      </div>
    </div>
  );
}
