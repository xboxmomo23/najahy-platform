"use client";

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

const palette = [
  { name: "cream", className: "bg-cream", hex: "#FAF6EF" },
  { name: "paper", className: "bg-paper", hex: "#F4EDDC" },
  { name: "sand", className: "bg-sand", hex: "#EDE4D3" },
  { name: "emerald-800", className: "bg-emerald-800", hex: "#1A3A2A" },
  { name: "emerald-900", className: "bg-emerald-900", hex: "#0F2A1D" },
  { name: "gold-500", className: "bg-gold-500", hex: "#D4A24C" },
  { name: "gold-600", className: "bg-gold-600", hex: "#C8902B" },
  { name: "ink", className: "bg-ink", hex: "#1A1A1A" },
  { name: "muted", className: "bg-muted", hex: "#6F6A60" },
  { name: "coral", className: "bg-coral", hex: "#C97064" },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
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

function ShowcaseCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sand bg-paper p-4 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <ZelligeBackground className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader
          tag="Design system"
          title="Najahy"
          titleItalic="UI Kit"
          description="Prévisualisation des composants partagés, de la palette et de la typographie. Page de développement uniquement."
          actions={
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              variant="outline"
              className="border-sand bg-cream text-ink hover:bg-paper"
            >
              ← Accueil
            </Button>
          }
        />

        <nav
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Sections du design system"
        >
          {[
            ["palette", "Palette"],
            ["typo", "Typo"],
            ["logo", "Logo"],
            ["avatar", "Avatar"],
            ["badge", "Badge"],
            ["kpi", "KPI"],
            ["empty", "Empty"],
            ["skeleton", "Skeleton"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-sand bg-cream px-3 py-1 text-xs font-medium text-emerald-800 transition-colors hover:bg-paper"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-12 flex flex-col gap-16">
          <Section
            id="palette"
            title="Palette"
            description="Couleurs définies dans globals.css (@theme inline)"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {palette.map((color) => (
                <div
                  key={color.name}
                  className="overflow-hidden rounded-xl border border-sand bg-cream"
                >
                  <div className={cn("h-16 w-full", color.className)} />
                  <div className="space-y-0.5 p-2.5">
                    <p className="text-xs font-medium text-ink">{color.name}</p>
                    <p className="font-mono text-[10px] text-muted">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="typo" title="Typographie">
            <ShowcaseCard className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                  font-display — Fraunces
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-emerald-900">
                  Réussis ton BAC autrement
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                  font-sans — DM Sans
                </p>
                <p className="mt-2 font-sans text-base leading-relaxed text-ink">
                  La première plateforme algérienne qui combine cours en visio,
                  IA tutrice 24/7 et annales ONEC corrigées.
                </p>
              </div>
              <p className="text-muted">
                Texte secondaire — <span className="text-ink">ink</span> /
                muted
              </p>
            </ShowcaseCard>
          </Section>

          <Section id="logo" title="Logo">
            <ShowcaseCard className="flex flex-col gap-8">
              <div className="flex flex-wrap items-end gap-8">
                <Logo size="sm" />
                <Logo size="md" />
                <Logo size="lg" />
              </div>
              <div className="flex flex-wrap items-center gap-8">
                <Logo size="md" showText={false} />
                <Logo size="md" href="/" />
              </div>
            </ShowcaseCard>
          </Section>

          <Section id="avatar" title="Avatar">
            <ShowcaseCard className="flex flex-wrap items-center gap-6">
              <Avatar name="Nadir Djediden" size="sm" />
              <Avatar name="Nadir Djediden" size="md" online />
              <Avatar name="Amina Benali" size="lg" />
              <Avatar
                name="Yacine Meziane"
                size="xl"
                imageUrl="https://api.dicebear.com/7.x/initials/svg?seed=Yacine"
                online
              />
            </ShowcaseCard>
          </Section>

          <Section id="badge" title="Badge">
            <ShowcaseCard className="flex flex-wrap gap-2">
              <Badge variant="good">Maîtrisé</Badge>
              <Badge variant="warning">À revoir</Badge>
              <Badge variant="alert">Urgent</Badge>
              <Badge variant="info">Nouveau</Badge>
              <Badge variant="neutral">Brouillon</Badge>
            </ShowcaseCard>
          </Section>

          <Section id="kpi" title="KPICard">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KPICard
                label="Moyenne générale"
                value="14,2"
                delta="↑ 1,3 pts ce mois"
                deltaTone="positive"
                icon={<TrendingUp />}
                variant="emerald"
              />
              <KPICard
                label="Chapitres complétés"
                value="24/48"
                delta="50 % du programme"
                deltaTone="neutral"
                icon={<BookOpen />}
              />
              <KPICard
                label="Sessions manquées"
                value="2"
                delta="↓ vs semaine dernière"
                deltaTone="negative"
              />
              <KPICard
                label="Série active"
                value="7 j"
                delta="Record personnel"
                deltaTone="positive"
                icon={<Sparkles />}
              />
            </div>
          </Section>

          <Section id="empty" title="EmptyState">
            <EmptyState
              icon={<Inbox />}
              title="Aucune annale pour l'instant"
              description="Quand tu commenceras un chapitre, tes exercices ONEC apparaîtront ici."
              actionLabel="Explorer le programme"
              onAction={() => {
                window.alert("Action demo — EmptyState");
              }}
            />
          </Section>

          <Section
            id="skeleton"
            title="LoadingSkeleton"
            description="Presets pour les états de chargement"
          >
            <div className="flex flex-col gap-8">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                  Card
                </p>
                <LoadingSkeleton.Card />
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                  List (count=3)
                </p>
                <LoadingSkeleton.List count={3} />
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                  Dashboard
                </p>
                <LoadingSkeleton.Dashboard />
              </div>
            </div>
          </Section>

          <Section
            id="zellige"
            title="ZelligeBackground"
            description="Motif appliqué sur toute cette page"
          >
            <ShowcaseCard>
              <p className="text-sm text-muted">
                Le fond zellige est actif sur le conteneur parent. Opacité
                faible emerald + gold pour un rendu méditerranéen discret.
              </p>
            </ShowcaseCard>
          </Section>
        </div>

        <footer className="mt-16 border-t border-sand pt-8 text-center text-xs text-muted">
          Najahy Design System — usage interne ·{" "}
          <Link href="/" className="text-emerald-700 hover:text-emerald-900">
            Retour accueil
          </Link>
        </footer>
      </div>
    </ZelligeBackground>
  );
}
