"use client";

import {
  ChevronDown,
  ChevronRight,
  Filter,
  GitBranch,
  LayoutGrid,
  List,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  CompetencySubjectNode,
  LibraryChapter,
  LibraryGlobalStats,
} from "@/app/(app)/bibliotheque/actions";
import { Badge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import type { DiagnosticPriority } from "@/lib/diagnostic/scoring";
import { TONE_STYLES } from "@/components/features/diagnostic/diagnostic-utils";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

import {
  DEFAULT_FILTERS,
  formatDuration,
  getDifficultyLabel,
  isChapterLocked,
  processLibraryData,
  SORT_OPTIONS,
  STATUS_LABELS,
  STATUS_STRIPE,
  type DifficultyFilter,
  type DurationFilter,
  type LibraryFilters,
  type SortMode,
  type StatusFilter,
  type ViewMode,
  buildChapterNumberMap,
  getUniqueSubjects,
} from "./library-utils";

type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

export interface LibraryViewProps {
  chapters: LibraryChapter[];
  stats: LibraryGlobalStats;
  competencyTree: CompetencySubjectNode[];
  recommendations: DiagnosticPriority[] | null;
  subscriptionPlan: SubscriptionPlan;
}

function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-emerald-900 transition-colors hover:bg-paper"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-sand text-emerald-800 focus:ring-emerald-800"
      />
      {label}
    </label>
  );
}

function LibraryFiltersPanel({
  filters,
  onChange,
  className,
}: {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  className?: string;
}) {
  const toggleStatus = (status: StatusFilter) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses });
  };

  const toggleDifficulty = (diff: DifficultyFilter) => {
    const difficulties = filters.difficulties.includes(diff)
      ? filters.difficulties.filter((d) => d !== diff)
      : [...filters.difficulties, diff];
    onChange({ ...filters, difficulties });
  };

  const toggleDuration = (dur: DurationFilter) => {
    const durations = filters.durations.includes(dur)
      ? filters.durations.filter((d) => d !== dur)
      : [...filters.durations, dur];
    onChange({ ...filters, durations });
  };

  return (
    <aside className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Statut
        </h3>
        <div className="mt-2 space-y-0.5">
          {(
            [
              "completed",
              "in_progress",
              "not_started",
              "to_review",
            ] as StatusFilter[]
          ).map((status) => (
            <FilterCheckbox
              key={status}
              id={`status-${status}`}
              label={STATUS_LABELS[status]}
              checked={filters.statuses.includes(status)}
              onChange={() => toggleStatus(status)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Difficulté
        </h3>
        <div className="mt-2 space-y-0.5">
          {(
            [
              ["easy", "Facile"],
              ["medium", "Moyen"],
              ["hard", "Difficile"],
            ] as const
          ).map(([value, label]) => (
            <FilterCheckbox
              key={value}
              id={`diff-${value}`}
              label={label}
              checked={filters.difficulties.includes(value)}
              onChange={() => toggleDifficulty(value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Durée
        </h3>
        <div className="mt-2 space-y-0.5">
          {(
            [
              ["short", "< 20 min"],
              ["medium", "20 – 45 min"],
              ["long", "> 45 min"],
            ] as const
          ).map(([value, label]) => (
            <FilterCheckbox
              key={value}
              id={`dur-${value}`}
              label={label}
              checked={filters.durations.includes(value)}
              onChange={() => toggleDuration(value)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-sand bg-paper px-3 py-3">
        <FilterCheckbox
          id="bac-frequency"
          label="Fréquence BAC"
          checked={filters.bacFrequencyPriority}
          onChange={(checked) =>
            onChange({ ...filters, bacFrequencyPriority: checked })
          }
        />
        <p className="mt-1 pl-6 text-xs text-muted">
          Met en avant les chapitres souvent tombés au BAC
        </p>
      </div>
    </aside>
  );
}

function AiRecommendationsBanner({
  recommendations,
}: {
  recommendations: DiagnosticPriority[];
}) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-100 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-emerald-800" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Suggéré par l&apos;IA d&apos;après ton diagnostic
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {recommendations.map((rec) => (
              <li key={`${rec.subjectSlug}-${rec.chapterSlug}`}>
                <Link
                  href={`/app/chapitre/${rec.chapterSlug}`}
                  className="block rounded-xl border border-emerald-200/80 bg-cream/80 px-4 py-3 transition-colors hover:border-emerald-400 hover:bg-cream"
                >
                  <p className="text-sm font-medium text-emerald-900">
                    {rec.chapterTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Gain potentiel :{" "}
                    <span className="font-semibold text-gold-600">
                      +{rec.potentialGain.toFixed(1)} pts
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ChapterCard({
  chapter,
  chapterNumber,
  subscriptionPlan,
  isRecommended,
}: {
  chapter: LibraryChapter;
  chapterNumber: number;
  subscriptionPlan: SubscriptionPlan;
  isRecommended: boolean;
}) {
  const locked = isChapterLocked(chapter, subscriptionPlan);
  const href = locked ? "/tarifs" : `/app/chapitre/${chapter.slug}`;

  const ctaLabel =
    locked
      ? "Passer au Standard"
      : chapter.status === "completed"
        ? "Revoir le chapitre"
        : chapter.status === "in_progress"
          ? "Continuer"
          : chapter.status === "to_review"
            ? "Réviser"
            : "Commencer";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border bg-cream transition-shadow",
        locked
          ? "border-sand opacity-95"
          : "border-sand hover:border-emerald-300 hover:shadow-md",
        isRecommended && !locked && "ring-2 ring-emerald-300/60",
      )}
    >
      <div
        className={cn("w-1.5 shrink-0", STATUS_STRIPE[chapter.status])}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              chapter.status === "completed"
                ? "good"
                : chapter.status === "in_progress"
                  ? "warning"
                  : chapter.status === "to_review"
                    ? "alert"
                    : "neutral"
            }
          >
            {STATUS_LABELS[chapter.status]}
          </Badge>
          {(chapter.bacFrequency ?? 0) > 0 ? (
            <Badge variant="info">
              Tombé {chapter.bacFrequency}× au BAC
            </Badge>
          ) : null}
          {isRecommended && !locked ? (
            <Badge variant="info">IA</Badge>
          ) : null}
        </div>

        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted">
          {chapter.subjectName} · Ch. {chapterNumber}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-emerald-900">
          {chapter.title}
        </h3>
        {chapter.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {chapter.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <span>{formatDuration(chapter.estimatedDuration)}</span>
          <span>·</span>
          <span>
            {chapter.exerciseCount} exercice
            {chapter.exerciseCount > 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{getDifficultyLabel(chapter.difficulty)}</span>
        </div>

        {!locked ? (
          <div className="mt-4">
            {chapter.status === "completed" ? (
              <p className="text-sm font-medium text-emerald-800">
                Quiz :{" "}
                <span className="font-display text-lg text-emerald-900">
                  {chapter.quizBestScore}/20
                </span>
              </p>
            ) : (
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>Progression</span>
                  <span>{chapter.progressPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all"
                    style={{ width: `${chapter.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="relative z-10 mt-5">
          <span
            className={cn(
              "inline-flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium",
              locked
                ? "gap-2 bg-gold-500 font-semibold text-emerald-900"
                : "bg-emerald-800 text-cream",
            )}
          >
            {locked ? <Lock className="size-4" aria-hidden /> : null}
            {ctaLabel}
          </span>
        </div>
      </div>

      {locked ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cream/40 backdrop-blur-[1px]">
          <div className="flex size-12 items-center justify-center rounded-full bg-paper shadow-sm">
            <Lock className="size-5 text-muted" aria-hidden />
          </div>
        </div>
      ) : null}

      <Link
        href={href}
        className="absolute inset-0 z-[5]"
        aria-label={`Ouvrir ${chapter.title}`}
      />
    </article>
  );
}

function LibraryGridView({
  chapters,
  chapterNumbers,
  subscriptionPlan,
  recommendationSlugs,
}: {
  chapters: LibraryChapter[];
  chapterNumbers: Map<string, number>;
  subscriptionPlan: SubscriptionPlan;
  recommendationSlugs: Set<string>;
}) {
  if (chapters.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center text-sm text-muted">
        Aucun chapitre ne correspond à tes filtres.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          chapterNumber={chapterNumbers.get(chapter.id) ?? 0}
          subscriptionPlan={subscriptionPlan}
          isRecommended={recommendationSlugs.has(chapter.slug)}
        />
      ))}
    </div>
  );
}

function LibraryListView({
  chapters,
  chapterNumbers,
  subscriptionPlan,
}: {
  chapters: LibraryChapter[];
  chapterNumbers: Map<string, number>;
  subscriptionPlan: SubscriptionPlan;
}) {
  if (chapters.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center text-sm text-muted">
        Aucun chapitre ne correspond à tes filtres.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-cream">
      <div className="hidden border-b border-sand bg-paper px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted sm:grid sm:grid-cols-[auto_1fr_100px_120px_40px] sm:gap-4">
        <span>Statut</span>
        <span>Chapitre</span>
        <span>Durée</span>
        <span>Progression</span>
        <span className="sr-only">Action</span>
      </div>
      <ul className="divide-y divide-sand">
        {chapters.map((chapter) => {
          const locked = isChapterLocked(chapter, subscriptionPlan);
          const href = locked ? "/tarifs" : `/app/chapitre/${chapter.slug}`;

          return (
            <li key={chapter.id}>
              <Link
                href={href}
                className="grid items-center gap-3 px-4 py-4 transition-colors hover:bg-paper sm:grid-cols-[auto_1fr_100px_120px_40px] sm:gap-4"
              >
                <div
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    STATUS_STRIPE[chapter.status],
                  )}
                  title={STATUS_LABELS[chapter.status]}
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted">
                    {chapter.subjectName} · Ch.{" "}
                    {chapterNumbers.get(chapter.id) ?? "—"}
                  </p>
                  <p className="font-medium text-emerald-900">{chapter.title}</p>
                  <p className="mt-0.5 text-xs text-muted sm:hidden">
                    {formatDuration(chapter.estimatedDuration)} ·{" "}
                    {chapter.exerciseCount} exo.
                  </p>
                </div>
                <span className="hidden text-sm text-muted sm:block">
                  {formatDuration(chapter.estimatedDuration)}
                </span>
                <div className="hidden sm:block">
                  {chapter.status === "completed" ? (
                    <span className="text-sm font-medium text-emerald-800">
                      {chapter.quizBestScore}/20
                    </span>
                  ) : (
                    <div className="h-2 overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{ width: `${chapter.progressPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
                <ChevronRight
                  className="hidden size-4 text-muted sm:block"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LibraryTreeView({
  competencyTree,
}: {
  competencyTree: CompetencySubjectNode[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(competencyTree.map((s) => [s.subjectName, true])),
  );

  if (competencyTree.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center text-sm text-muted">
        L&apos;arbre de compétences sera disponible dès que les compétences
        seront configurées.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {competencyTree.map((subject) => {
        const isOpen = expanded[subject.subjectName] ?? false;
        const tone = TONE_STYLES[subject.tone];

        return (
          <article
            key={subject.subjectName}
            className="overflow-hidden rounded-2xl border border-sand bg-cream"
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [subject.subjectName]: !isOpen,
                }))
              }
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-paper"
            >
              {isOpen ? (
                <ChevronDown className="size-5 shrink-0 text-muted" />
              ) : (
                <ChevronRight className="size-5 shrink-0 text-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-emerald-900">
                    {subject.subjectName}
                  </h3>
                  <span className="text-xs text-muted">
                    coef. {subject.coefficient}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      tone.className,
                    )}
                  >
                    {tone.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold text-emerald-800">
                  {subject.globalScore}%
                </p>
                <p className="text-xs text-muted">score global</p>
              </div>
            </button>

            {isOpen ? (
              <ul className="border-t border-sand bg-paper/50 px-5 py-3">
                {subject.competencies.length === 0 ? (
                  <li className="py-2 text-sm text-muted">
                    Aucune compétence définie pour cette matière.
                  </li>
                ) : (
                  subject.competencies.map((comp) => (
                    <li
                      key={comp.name}
                      className="flex items-center gap-4 border-b border-sand/60 py-3 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-emerald-900">{comp.name}</p>
                        {comp.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                            {comp.description}
                          </p>
                        ) : null}
                      </div>
                      <Badge
                        variant={
                          comp.status === "Force"
                            ? "good"
                            : comp.status === "Priorité"
                              ? "alert"
                              : comp.status === "À consolider"
                                ? "warning"
                                : "neutral"
                        }
                      >
                        {comp.status}
                      </Badge>
                      <div className="w-24 text-right">
                        <p className="font-display text-lg font-semibold text-emerald-800">
                          {comp.masteryPercentage}%
                        </p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand">
                          <div
                            className="h-full rounded-full bg-emerald-700"
                            style={{ width: `${comp.masteryPercentage}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function LibraryView({
  chapters,
  stats,
  competencyTree,
  recommendations,
  subscriptionPlan,
}: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const subjects = useMemo(() => getUniqueSubjects(chapters), [chapters]);
  const chapterNumbers = useMemo(() => buildChapterNumberMap(chapters), [chapters]);
  const recommendationSlugs = useMemo(
    () => new Set(recommendations?.map((r) => r.chapterSlug) ?? []),
    [recommendations],
  );

  const { filtered } = useMemo(
    () =>
      processLibraryData(
        chapters,
        competencyTree,
        filters,
        sortMode,
        recommendations,
      ),
    [chapters, competencyTree, filters, sortMode, recommendations],
  );

  const activeFilterCount =
    filters.statuses.length +
    filters.difficulties.length +
    filters.durations.length +
    (filters.bacFrequencyPriority ? 1 : 0);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        tag="Bibliothèque"
        title="Bibliothèque"
        description="Tous tes chapitres, classés intelligemment."
      />

      {/* Recherche + stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Rechercher un chapitre…"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="h-10 w-full rounded-lg border border-sand bg-cream py-2 pr-3 pl-9 text-sm text-emerald-900 outline-none transition-colors placeholder:text-muted focus:border-emerald-700 focus:ring-2 focus:ring-emerald-800/20"
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <p>
            <span className="font-display text-xl font-semibold text-emerald-800">
              {stats.nbValides}
            </span>{" "}
            <span className="text-muted">validés</span>
          </p>
          <p>
            <span className="font-display text-xl font-semibold text-gold-600">
              {stats.nbEnCours}
            </span>{" "}
            <span className="text-muted">en cours</span>
          </p>
        </div>
      </div>

      {recommendations && recommendations.length > 0 ? (
        <AiRecommendationsBanner recommendations={recommendations} />
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, subjectSlug: null }))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filters.subjectSlug === null
                ? "border-emerald-800 bg-emerald-800 text-cream"
                : "border-sand bg-cream text-emerald-900 hover:bg-paper",
            )}
          >
            Toutes
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.slug}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  subjectSlug:
                    prev.subjectSlug === subject.slug ? null : subject.slug,
                }))
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                filters.subjectSlug === subject.slug
                  ? "border-emerald-800 bg-emerald-800 text-cream"
                  : "border-sand bg-cream text-emerald-900 hover:bg-paper",
              )}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="library-sort">
            Trier par
          </label>
          <select
            id="library-sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-9 rounded-lg border border-sand bg-cream px-3 text-sm text-emerald-900 outline-none focus:border-emerald-700"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-sand bg-cream p-0.5">
            {(
              [
                ["grid", LayoutGrid, "Grille"],
                ["list", List, "Liste"],
                ["tree", GitBranch, "Arbre"],
              ] as const
            ).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                title={label}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md transition-colors",
                  viewMode === mode
                    ? "bg-emerald-800 text-cream"
                    : "text-muted hover:text-emerald-900",
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="sr-only">{label}</span>
              </button>
            ))}
          </div>

          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="h-9 gap-1.5 border-sand bg-cream text-emerald-900 lg:hidden"
                />
              }
            >
              <Filter className="size-4" aria-hidden />
              Filtres
              {activeFilterCount > 0 ? (
                <span className="ml-1 rounded-full bg-emerald-800 px-1.5 py-0.5 text-[10px] text-cream">
                  {activeFilterCount}
                </span>
              ) : null}
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filtres</DialogTitle>
              </DialogHeader>
              <LibraryFiltersPanel filters={filters} onChange={setFilters} />
              <Button
                className="mt-4 w-full bg-emerald-800 text-cream hover:bg-emerald-900"
                onClick={() => setFiltersOpen(false)}
              >
                Appliquer
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-8">
        <LibraryFiltersPanel
          filters={filters}
          onChange={setFilters}
          className="hidden w-56 shrink-0 lg:block"
        />

        <div className="min-w-0 flex-1">
          {viewMode === "grid" ? (
            <LibraryGridView
              chapters={filtered}
              chapterNumbers={chapterNumbers}
              subscriptionPlan={subscriptionPlan}
              recommendationSlugs={recommendationSlugs}
            />
          ) : viewMode === "list" ? (
            <LibraryListView
              chapters={filtered}
              chapterNumbers={chapterNumbers}
              subscriptionPlan={subscriptionPlan}
            />
          ) : (
            <LibraryTreeView competencyTree={competencyTree} />
          )}

          {viewMode !== "tree" && filtered.length > 0 ? (
            <p className="mt-6 text-center text-sm text-muted">
              {filtered.length} chapitre{filtered.length > 1 ? "s" : ""} affiché
              {filtered.length > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
