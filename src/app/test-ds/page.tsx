"use client";

/**
 * Page de test visuel temporaire — à supprimer avant la prod.
 * @see /design-system pour une version plus présentable
 */

import {
  BookOpen,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  Badge,
  EmptyState,
  KPICard,
  LoadingSkeleton,
  Logo,
  PageHeader,
  ZelligeBackground,
} from "@/components/shared";
import { cn } from "@/lib/utils";

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-20 border-b border-sand pb-2 font-display text-2xl font-semibold text-emerald-900"
    >
      {children}
    </h2>
  );
}

function VariantLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

function VariantBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sand bg-paper p-4 sm:p-5",
        className,
      )}
    >
      <VariantLabel>{label}</VariantLabel>
      {children}
    </div>
  );
}

export default function TestDesignSystemPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-12 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
            Dev only · temporaire
          </p>
          <h1 className="font-display text-3xl font-semibold text-emerald-900">
            Test — composants partagés
          </h1>
          <p className="text-sm text-muted">
            Toutes les variantes sur fond{" "}
            <code className="rounded bg-paper px-1 text-ink">cream</code>.{" "}
            <Link href="/design-system" className="text-emerald-700 underline">
              /design-system
            </Link>
          </p>
        </header>

        <div className="flex flex-col gap-14">
          {/* ——— Logo ——— */}
          <section className="space-y-4" aria-labelledby="section-logo">
            <SectionTitle id="section-logo">Logo</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VariantBlock label='size="sm" · showText'>
                <Logo size="sm" />
              </VariantBlock>
              <VariantBlock label='size="md" · showText (default)'>
                <Logo size="md" />
              </VariantBlock>
              <VariantBlock label='size="lg" · showText'>
                <Logo size="lg" />
              </VariantBlock>
              <VariantBlock label='size="md" · showText={false}'>
                <Logo size="md" showText={false} />
              </VariantBlock>
              <VariantBlock label='size="sm" · showText={false}'>
                <Logo size="sm" showText={false} />
              </VariantBlock>
              <VariantBlock label='size="lg" · href="/"'>
                <Logo size="lg" href="/" />
              </VariantBlock>
            </div>
          </section>

          {/* ——— Avatar ——— */}
          <section className="space-y-4" aria-labelledby="section-avatar">
            <SectionTitle id="section-avatar">Avatar</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VariantBlock label='size="sm" · initiales'>
                <Avatar name="Nadir Djediden" size="sm" />
              </VariantBlock>
              <VariantBlock label='size="md" · initiales'>
                <Avatar name="Nadir Djediden" size="md" />
              </VariantBlock>
              <VariantBlock label='size="lg" · initiales'>
                <Avatar name="Amina Benali" size="lg" />
              </VariantBlock>
              <VariantBlock label='size="xl" · initiales'>
                <Avatar name="Yacine Meziane" size="xl" />
              </VariantBlock>
              <VariantBlock label='size="md" · online'>
                <Avatar name="Nadir Djediden" size="md" online />
              </VariantBlock>
              <VariantBlock label='size="lg" · online · imageUrl'>
                <Avatar
                  name="Sara Khelifi"
                  size="lg"
                  online
                  imageUrl="https://api.dicebear.com/7.x/initials/svg?seed=Sara"
                />
              </VariantBlock>
              <VariantBlock label='size="xl" · imageUrl · sans online'>
                <Avatar
                  name="Karim Boudiaf"
                  size="xl"
                  imageUrl="https://api.dicebear.com/7.x/initials/svg?seed=Karim"
                />
              </VariantBlock>
              <VariantBlock label="nom court · initiales 2 lettres">
                <Avatar name="Li" size="md" />
              </VariantBlock>
              <VariantBlock label="nom vide · fallback ?">
                <Avatar name="  " size="md" />
              </VariantBlock>
            </div>
          </section>

          {/* ——— KPI Cards ——— */}
          <section className="space-y-4" aria-labelledby="section-kpi">
            <SectionTitle id="section-kpi">KPI Cards</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <VariantBlock label='variant="default" · complet'>
                <KPICard
                  label="Moyenne générale"
                  value="14,2"
                  delta="↑ 1,3 pts"
                  deltaTone="positive"
                  icon={<TrendingUp />}
                />
              </VariantBlock>
              <VariantBlock label='variant="emerald" · complet'>
                <KPICard
                  label="Moyenne générale"
                  value="14,2"
                  delta="↑ 1,3 pts"
                  deltaTone="positive"
                  icon={<TrendingUp />}
                  variant="emerald"
                />
              </VariantBlock>
              <VariantBlock label='variant="default" · sans icon · sans delta'>
                <KPICard label="Chapitres" value="24/48" />
              </VariantBlock>
              <VariantBlock label='deltaTone="negative"'>
                <KPICard
                  label="Absences"
                  value="2"
                  delta="↑ 1 séance"
                  deltaTone="negative"
                />
              </VariantBlock>
              <VariantBlock label='deltaTone="neutral"'>
                <KPICard
                  label="Progression"
                  value="50 %"
                  delta="Mi-parcours"
                  deltaTone="neutral"
                  icon={<BookOpen />}
                />
              </VariantBlock>
              <VariantBlock label="value = ReactNode">
                <KPICard
                  label="Badge"
                  value={
                    <span className="text-gold-500">
                      ★ Premium
                    </span>
                  }
                  variant="emerald"
                  icon={<Sparkles />}
                />
              </VariantBlock>
            </div>
          </section>

          {/* ——— Empty State ——— */}
          <section className="space-y-4" aria-labelledby="section-empty">
            <SectionTitle id="section-empty">Empty State</SectionTitle>
            <div className="grid gap-4 lg:grid-cols-2">
              <VariantBlock label="avec action">
                <EmptyState
                  icon={<Inbox className="size-7" />}
                  title="Aucune annale"
                  description="Tes exercices ONEC apparaîtront ici après le premier chapitre."
                  actionLabel="Explorer"
                  onAction={() => window.alert("EmptyState — action")}
                />
              </VariantBlock>
              <VariantBlock label="sans action">
                <EmptyState
                  icon={<BookOpen className="size-7" />}
                  title="Rien à afficher"
                  description="Pas de bouton lorsque actionLabel / onAction sont omis."
                />
              </VariantBlock>
            </div>
          </section>

          {/* ——— Loading Skeletons ——— */}
          <section className="space-y-4" aria-labelledby="section-skeleton">
            <SectionTitle id="section-skeleton">
              Loading Skeletons
            </SectionTitle>
            <VariantBlock label="<LoadingSkeleton.Card />">
              <LoadingSkeleton.Card />
            </VariantBlock>
            <VariantBlock label='<LoadingSkeleton.List count={3} />'>
              <LoadingSkeleton.List count={3} />
            </VariantBlock>
            <VariantBlock label='<LoadingSkeleton.List count={5} /> (default)'>
              <LoadingSkeleton.List count={5} />
            </VariantBlock>
            <VariantBlock label="<LoadingSkeleton.Dashboard />">
              <LoadingSkeleton.Dashboard />
            </VariantBlock>
          </section>

          {/* ——— Page Header ——— */}
          <section className="space-y-4" aria-labelledby="section-header">
            <SectionTitle id="section-header">Page Header</SectionTitle>
            <VariantBlock label="minimal · title seul">
              <PageHeader title="Mon parcours" />
            </VariantBlock>
            <VariantBlock label="tag + title + description">
              <PageHeader
                tag="BAC 2026"
                title="Tableau de bord"
                description="Suis ta progression chapitre par chapitre."
              />
            </VariantBlock>
            <VariantBlock label="title + titleItalic">
              <PageHeader
                tag="Élève"
                title="Salut,"
                titleItalic="Nadir"
                description="Prêt pour réviser aujourd'hui ?"
              />
            </VariantBlock>
            <VariantBlock label="avec actions">
              <PageHeader
                tag="Prof"
                title="Mes classes"
                titleItalic="2nde Sciences"
                actions={
                  <>
                    <Button
                      variant="outline"
                      className="border-sand bg-cream"
                    >
                      Filtrer
                    </Button>
                    <Button className="bg-emerald-900 text-cream hover:bg-emerald-800">
                      Nouveau cours
                    </Button>
                  </>
                }
              />
            </VariantBlock>
          </section>

          {/* ——— Badges ——— */}
          <section className="space-y-4" aria-labelledby="section-badge">
            <SectionTitle id="section-badge">Badges</SectionTitle>
            <VariantBlock label="toutes les variantes">
              <div className="flex flex-wrap gap-2">
                <Badge variant="good">good — Maîtrisé</Badge>
                <Badge variant="warning">warning — À revoir</Badge>
                <Badge variant="alert">alert — Urgent</Badge>
                <Badge variant="info">info — Nouveau</Badge>
                <Badge variant="neutral">neutral — Brouillon</Badge>
              </div>
            </VariantBlock>
          </section>

          {/* ——— Zellige Background ——— */}
          <section className="space-y-4" aria-labelledby="section-zellige">
            <SectionTitle id="section-zellige">
              Zellige Background
            </SectionTitle>
            <VariantBlock label="ZelligeBackground vs fond cream seul">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-sand bg-cream p-6">
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Fond cream seul
                  </p>
                  <p className="mt-2 font-display text-lg text-emerald-900">
                    Sans motif
                  </p>
                </div>
                <ZelligeBackground className="rounded-xl border border-sand">
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted">
                      ZelligeBackground
                    </p>
                    <p className="mt-2 font-display text-lg text-emerald-900">
                      Motif zellige actif
                    </p>
                  </div>
                </ZelligeBackground>
              </div>
            </VariantBlock>
            <VariantBlock label="page entière en cream (cette page)">
              <p className="text-sm text-muted">
                Le conteneur racine utilise{" "}
                <code className="rounded bg-cream px-1">bg-cream</code>. La
                section ci-dessus montre le composant isolé.
              </p>
            </VariantBlock>
          </section>
        </div>

        <p className="mt-16 text-center text-xs text-muted">
          <Link href="/" className="text-emerald-700 hover:underline">
            ← Accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
