"use client";

import { FadeUp } from "@/components/public/landing/motion";
import {
  SectionTag,
  SectionTitle,
} from "@/components/public/landing/section-primitives";

const TESTIMONIALS = [
  {
    quote:
      "L'IA m'a aidée à comprendre les suites en maths la veille du devoir. J'ai eu 15 — ma mère n'en revenait pas.",
    name: "Farida B.",
    role: "Élève · 3ème Sciences · Alger",
    stars: 5,
  },
  {
    quote:
      "Je vois enfin la progression de mon fils chapitre par chapitre. Les cours visio avec un prof sérieux, ça change tout.",
    name: "Karim L.",
    role: "Parent · Oran",
    stars: 5,
  },
  {
    quote:
      "Depuis la France, je paie l'abonnement et je suis les résultats de ma fille en temps réel. Comme si j'étais à côté d'elle.",
    name: "Riad M.",
    role: "Parent diaspora · Lyon",
    stars: 5,
  },
] as const;

function StarRating({ count }: { count: number }) {
  return (
    <p className="text-gold-500" aria-label={`${count} étoiles sur 5`}>
      {"★".repeat(count)}
      <span className="sr-only"> sur 5</span>
    </p>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="temoignages"
      className="scroll-mt-24 bg-paper px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <SectionTag>Témoignages</SectionTag>
          <SectionTitle className="mt-4">
            Ils ont choisi Najahy pour le BAC.
          </SectionTitle>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <FadeUp key={item.name} delay={index * 0.08}>
              <blockquote className="flex h-full flex-col rounded-2xl border border-sand bg-cream p-6">
                <StarRating count={item.stars} />
                <p className="mt-4 flex-1 font-display text-lg leading-snug text-emerald-900">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-6 border-t border-sand pt-4">
                  <cite className="not-italic">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="text-sm text-muted">{item.role}</p>
                  </cite>
                </footer>
              </blockquote>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
