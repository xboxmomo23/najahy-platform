import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { EmptyState, KPICard, PageHeader } from "@/components/shared";
import { getDaysUntilBac } from "@/components/features/diagnostic/diagnostic-results-helpers";
import {
  getStudentDashboardData,
  type DashboardChapterResume,
  type DashboardRecommendedChapter,
} from "@/lib/auth/get-student-dashboard";
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

function InProgressChapterCard({ chapter }: { chapter: DashboardChapterResume }) {
  return (
    <article className="rounded-2xl border border-sand bg-cream p-5 transition-colors hover:border-emerald-300 hover:bg-paper">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {chapter.subjectName}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-emerald-900">
        {chapter.title}
      </h3>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Progression</span>
          <span>{chapter.progressPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{ width: `${chapter.progressPercentage}%` }}
          />
        </div>
      </div>
      <Link
        href={`/app/chapitre/${chapter.slug}`}
        className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 text-sm font-medium text-cream transition-colors hover:bg-emerald-900 sm:w-auto sm:px-5"
      >
        Continuer
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function RecommendedChapterCard({
  chapter,
}: {
  chapter: DashboardRecommendedChapter;
}) {
  return (
    <Link
      href={`/app/chapitre/${chapter.chapterSlug}`}
      className="block rounded-2xl border border-emerald-200 bg-emerald-100/50 p-5 transition-colors hover:border-emerald-400 hover:bg-emerald-100"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
        {chapter.subjectName}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-emerald-900">
        {chapter.chapterTitle}
      </h3>
      <p className="mt-2 text-sm text-muted">
        Gain potentiel :{" "}
        <span className="font-semibold text-gold-600">
          +{chapter.potentialGain.toFixed(1)} pts
        </span>{" "}
        sur ta note prédictive
      </p>
    </Link>
  );
}

function PreDiagnosticDashboard({
  firstName,
  inProgressChapters,
  recommendedChapters,
}: {
  firstName: string;
  inProgressChapters: DashboardChapterResume[];
  recommendedChapters: DashboardRecommendedChapter[];
}) {
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
          )}
        >
          Commencer mon diagnostic
        </Link>
      </div>

      {inProgressChapters.length > 0 ? (
        <DashboardSection title="Reprends où tu en étais">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressChapters.map((chapter) => (
              <InProgressChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}

function PostDiagnosticDashboard({
  predictedScore,
  targetScore,
  gap,
  daysUntilBac,
  inProgressChapters,
  competencyValidated,
  competencyTotal,
  recommendedChapters,
  firstStep,
}: {
  predictedScore: number | null;
  targetScore: number | null;
  gap: number | null;
  daysUntilBac: number;
  inProgressChapters: DashboardChapterResume[];
  competencyValidated: number;
  competencyTotal: number;
  recommendedChapters: DashboardRecommendedChapter[];
  firstStep: {
    chapterSlug: string;
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

  const hasAnyProgress =
    inProgressChapters.length > 0 ||
    competencyValidated > 0 ||
    recommendedChapters.length > 0;

  const firstRecommended =
    recommendedChapters[0] ??
    (firstStep
      ? {
          chapterSlug: firstStep.chapterSlug,
          chapterTitle: firstStep.chapterTitle,
          subjectSlug: "",
          subjectName: "Priorité diagnostic",
          potentialGain: 0,
        }
      : null);

  const competencyDelta =
    competencyTotal > 0
      ? `${competencyValidated} validée${competencyValidated > 1 ? "s" : ""} sur ${competencyTotal}`
      : "Aucune compétence configurée";

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
          value={
            competencyTotal > 0 ? (
              <>
                {competencyValidated}
                <span className="text-lg font-normal text-emerald-200/80">
                  /{competencyTotal}
                </span>
              </>
            ) : (
              "—"
            )
          }
          delta={competencyDelta}
          deltaTone={
            competencyTotal > 0 && competencyValidated / competencyTotal >= 0.5
              ? "positive"
              : "neutral"
          }
          icon={<BarChart3 />}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <DashboardSection
        title="Reprends où tu en étais"
        description="Tes chapitres en cours, là où tu t'es arrêté."
      >
        {inProgressChapters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressChapters.map((chapter) => (
              <InProgressChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList />}
            title="Aucun chapitre en cours"
            description={
              hasAnyProgress
                ? "Choisis un chapitre recommandé ci-dessous ou explore la bibliothèque pour commencer."
                : "Explore la bibliothèque et lance ton premier chapitre — ta progression apparaîtra ici."
            }
          />
        )}
        {inProgressChapters.length === 0 ? (
          <div className="flex flex-wrap gap-3">
            {firstRecommended ? (
              <Link
                href={`/app/chapitre/${firstRecommended.chapterSlug}`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-medium text-cream hover:bg-emerald-900"
              >
                {firstRecommended.chapterTitle}
              </Link>
            ) : null}
            <Link
              href="/app/bibliotheque"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-sand bg-cream px-4 text-sm font-medium text-emerald-900 hover:bg-paper"
            >
              <BookOpen className="mr-2 size-4" aria-hidden />
              Bibliothèque
            </Link>
          </div>
        ) : null}
      </DashboardSection>

      <DashboardSection
        title="Recommandé pour toi"
        description="Priorités de ton diagnostic — chapitres pas encore validés."
      >
        {recommendedChapters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedChapters.map((chapter) => (
              <RecommendedChapterCard
                key={`${chapter.subjectSlug}-${chapter.chapterSlug}`}
                chapter={chapter}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles />}
            title="Toutes tes priorités sont validées"
            description="Bravo ! Enchaîne avec la bibliothèque ou refais le diagnostic si tu as progressé."
          />
        )}
        {recommendedChapters.length === 0 ? (
          <Link
            href="/app/bibliotheque"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-sand bg-cream px-4 text-sm font-medium text-emerald-900 hover:bg-paper"
          >
            Explorer tous les chapitres
          </Link>
        ) : null}
      </DashboardSection>

      {firstStep &&
      !recommendedChapters.some((c) => c.chapterSlug === firstStep.chapterSlug) ? (
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
            <Link
              href={`/app/chapitre/${firstStep.chapterSlug}`}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-gold-500 px-5 text-sm font-semibold text-emerald-900 transition-colors hover:bg-gold-400"
            >
              Commencer ce chapitre
            </Link>
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

  const firstStep = data.diagnosticResults?.firstStep ?? null;

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
            inProgressChapters={data.inProgressChapters}
            competencyValidated={data.competencyValidated}
            competencyTotal={data.competencyTotal}
            recommendedChapters={data.recommendedChapters}
            firstStep={firstStep}
          />
        ) : (
          <PreDiagnosticDashboard
            firstName={data.firstName}
            inProgressChapters={data.inProgressChapters}
            recommendedChapters={data.recommendedChapters}
          />
        )}
      </div>
    </div>
  );
}
