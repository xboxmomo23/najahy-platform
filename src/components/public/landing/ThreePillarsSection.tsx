"use client";

import { BookOpen, Sparkles, Users } from "lucide-react";

import { FadeUp } from "@/components/public/landing/motion";
import {
  SectionTag,
  SectionTitle,
} from "@/components/public/landing/section-primitives";

const PILLARS = [
  {
    icon: BookOpen,
    iconClass: "text-gold-600",
    bgClass: "bg-gold-50",
    title: "Une bibliothèque complète",
    description:
      "Tous les chapitres du programme, fiches synthèse, 10 ans d'annales ONEC corrigées.",
  },
  {
    icon: Users,
    iconClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    title: "Des profs en visio à la demande",
    description:
      "Réserve un cours visio avec un prof vérifié. À ton rythme, à tes horaires.",
  },
  {
    icon: Sparkles,
    iconClass: "text-coral",
    bgClass: "bg-coral-100",
    title: "Une IA tutrice 24/7",
    description:
      "Pose ta question à toute heure. En français, arabe, ou darija. Elle ne dort jamais.",
  },
] as const;

export function ThreePillarsSection() {
  return (
    <section
      id="notre-approche"
      className="scroll-mt-24 bg-cream px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <SectionTag>Notre approche</SectionTag>
          <SectionTitle className="mt-4">
            3 piliers pour réussir. Sans en sacrifier aucun.
          </SectionTitle>
        </FadeUp>

        <div className="mt-12 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <FadeUp key={pillar.title} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-sand bg-paper p-6 sm:p-8">
                <div
                  className={`mb-5 flex size-12 items-center justify-center rounded-xl ${pillar.bgClass}`}
                  aria-hidden
                >
                  <pillar.icon className={`size-6 ${pillar.iconClass}`} />
                </div>
                <h3 className="font-display text-xl font-semibold text-emerald-900">
                  {pillar.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted sm:text-base">
                  {pillar.description}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
