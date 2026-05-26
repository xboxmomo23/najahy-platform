"use client";

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Lock,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  markChapterStarted,
  type ChapterDetailResult,
  type ChapterExercisePublic,
} from "@/app/(app)/chapitre/[slug]/actions";
import { QuizMode } from "@/components/features/chapter/QuizMode";
import { ChapterMarkdown } from "@/components/features/chapter/ChapterMarkdown";
import {
  formatDuration,
  getDifficultyLabel,
} from "@/components/features/library/library-utils";
import { Badge, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabId = "cours" | "fiche" | "video" | "exercises" | "annales";

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "cours", label: "Cours", icon: <BookOpen className="size-4" /> },
  { id: "fiche", label: "Fiche synthèse", icon: <FileText className="size-4" /> },
  { id: "video", label: "Vidéo", icon: <Play className="size-4" /> },
  {
    id: "exercises",
    label: "Exercices",
    icon: <Target className="size-4" />,
  },
  {
    id: "annales",
    label: "Annales",
    icon: <GraduationCap className="size-4" />,
  },
];

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    if (parsed.pathname.includes("/embed/")) return url;
  } catch {
    return null;
  }
  return null;
}

function ExerciseDifficultyBadge({
  difficulty,
}: {
  difficulty: number | null;
}) {
  const label = getDifficultyLabel(difficulty);
  const variant =
    (difficulty ?? 2) <= 1
      ? "good"
      : (difficulty ?? 2) === 2
        ? "warning"
        : "alert";

  return <Badge variant={variant}>{label}</Badge>;
}

function ChapterPaywall({
  chapterTitle,
  contentPreview,
}: {
  chapterTitle: string;
  contentPreview: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sand bg-cream">
      {contentPreview ? (
        <div className="relative max-h-72 overflow-hidden">
          <div className="pointer-events-none select-none blur-sm">
            <ChapterMarkdown content={contentPreview} className="p-6 opacity-90" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-cream/80 to-cream" />
        </div>
      ) : null}

      <div className="relative px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Lock className="size-7" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-emerald-900 sm:text-3xl">
          Ce chapitre fait partie de l&apos;offre Standard
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Débloque <strong className="text-emerald-900">{chapterTitle}</strong>{" "}
          et tous les chapitres premium pour accélérer ta préparation au BAC.
        </p>
        <Link
          href="/tarifs"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-gold-500 px-6 text-sm font-semibold text-emerald-900 transition-colors hover:bg-gold-400"
        >
          Voir les offres
        </Link>
      </div>
    </div>
  );
}

function ExercisesTab({
  exercises,
  chapterTitle,
  onStartQuiz,
}: {
  exercises: ChapterExercisePublic[];
  chapterTitle: string;
  onStartQuiz: () => void;
}) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        icon={<Target />}
        title="Aucun exercice pour l'instant"
        description="Les exercices de ce chapitre seront ajoutés très bientôt."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-emerald-900">
            {exercises.length} exercice{exercises.length > 1 ? "s" : ""}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Entraîne-toi avec correction immédiate et explications détaillées.
          </p>
        </div>
        <Button
          type="button"
          onClick={onStartQuiz}
          className="shrink-0 bg-emerald-800 text-cream hover:bg-emerald-900"
        >
          Commencer les exercices
        </Button>
      </div>

      <ul className="divide-y divide-sand rounded-2xl border border-sand bg-cream">
        {exercises.map((ex, index) => (
          <li
            key={ex.id}
            className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Exercice {index + 1}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-emerald-900">
                {ex.question}
              </p>
            </div>
            <ExerciseDifficultyBadge difficulty={ex.difficulty} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ChapterDetailProps {
  data: ChapterDetailResult;
}

export function ChapterDetail({ data }: ChapterDetailProps) {
  const { chapter, locked, exercises, progress, chapterNumber, contentPreview } =
    data;

  const [activeTab, setActiveTab] = useState<TabId>("cours");
  const [quizOpen, setQuizOpen] = useState(false);

  const progressPercent = progress?.progressPercentage ?? 0;
  const embedUrl = chapter.videoUrl
    ? getYoutubeEmbedUrl(chapter.videoUrl)
    : null;

  useEffect(() => {
    if (locked) return;

    void markChapterStarted(chapter.id).then((result) => {
      if (!result.success) {
        console.warn("[markChapterStarted]", result.error);
      }
    });
  }, [chapter.id, locked]);

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="border-b border-sand pb-6">
        <Link
          href="/app/bibliotheque"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-emerald-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour à la bibliothèque
        </Link>

        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold-600">
          {chapter.subjectName} · Chapitre {chapterNumber}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-emerald-900 sm:text-4xl">
          {chapter.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {chapter.estimatedDuration ? (
            <Badge variant="neutral">
              <Clock className="mr-1 inline size-3.5" aria-hidden />
              {formatDuration(chapter.estimatedDuration)}
            </Badge>
          ) : null}
          <Badge variant="neutral">{getDifficultyLabel(chapter.difficulty)}</Badge>
          {(chapter.bacFrequency ?? 0) > 0 ? (
            <Badge variant="info">
              Tombé {chapter.bacFrequency}× au BAC
            </Badge>
          ) : null}
        </div>

        {!locked ? (
          <div className="mt-6 max-w-xl">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>Progression du chapitre</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </header>

      {locked ? (
        <div className="mt-8">
          <ChapterPaywall
            chapterTitle={chapter.title}
            contentPreview={contentPreview}
          />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <nav
            className="mt-6 -mb-px flex gap-1 overflow-x-auto border-b border-sand pb-px"
            aria-label="Sections du chapitre"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-emerald-800 text-emerald-900"
                    : "border-transparent text-muted hover:border-sand hover:text-emerald-800",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8">
            {activeTab === "cours" ? (
              <div className="relative">
                {chapter.content ? (
                  <ChapterMarkdown content={chapter.content} />
                ) : (
                  <EmptyState
                    icon={<BookOpen />}
                    title="Cours en préparation"
                    description="Le contenu de ce chapitre sera bientôt disponible."
                  />
                )}

                <Link
                  href={`/app/tuteur-ia?chapitre=${chapter.slug}`}
                  className="fixed bottom-6 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-emerald-900 px-5 text-sm font-medium text-cream shadow-lg transition-transform hover:scale-[1.02] hover:bg-emerald-800 sm:right-8"
                >
                  <Sparkles className="size-4 text-gold-400" aria-hidden />
                  Poser une question à l&apos;IA sur ce chapitre
                </Link>
              </div>
            ) : null}

            {activeTab === "fiche" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                      Fiche synthèse
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold text-emerald-900">
                      L&apos;essentiel à retenir
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-sand bg-cream text-emerald-900"
                    onClick={() =>
                      toast.info("Le téléchargement PDF arrive bientôt.")
                    }
                  >
                    <Download className="size-4" aria-hidden />
                    Télécharger en PDF
                  </Button>
                </div>
                <div className="mt-6 rounded-xl border border-sand/80 bg-cream p-5 sm:p-6">
                  {chapter.ficheContent ? (
                    <ChapterMarkdown
                      content={chapter.ficheContent}
                      className="text-[0.95rem]"
                    />
                  ) : (
                    <p className="text-sm text-muted">
                      La fiche synthèse de ce chapitre sera disponible prochainement.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {activeTab === "video" ? (
              embedUrl ? (
                <div className="overflow-hidden rounded-2xl border border-sand bg-ink shadow-sm">
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={`Vidéo — ${chapter.title}`}
                      className="absolute inset-0 size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Play />}
                  title="Vidéo bientôt disponible"
                  description="Une vidéo explicative sera ajoutée à ce chapitre très prochainement."
                />
              )
            ) : null}

            {activeTab === "exercises" ? (
              <ExercisesTab
                exercises={exercises}
                chapterTitle={chapter.title}
                onStartQuiz={() => setQuizOpen(true)}
              />
            ) : null}

            {activeTab === "annales" ? (
              <EmptyState
                icon={<GraduationCap />}
                title="Annales bientôt disponibles"
                description="Les annales ONEC corrigées de ce chapitre seront intégrées dans une prochaine mise à jour."
              />
            ) : null}
          </div>
        </>
      )}

      {quizOpen ? (
        <QuizMode
          exercises={exercises}
          chapterId={chapter.id}
          chapterSlug={chapter.slug}
          chapterTitle={chapter.title}
          onClose={() => setQuizOpen(false)}
        />
      ) : null}
    </div>
  );
}
