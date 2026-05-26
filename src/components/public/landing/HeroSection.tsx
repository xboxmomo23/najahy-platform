"use client";

import Link from "next/link";

import { FadeUp } from "@/components/public/landing/motion";
import { btnPrimaryClass } from "@/components/public/landing/section-primitives";

const TRUST_BADGES = [
  "✓ 0 €/mois pour démarrer",
  "✓ Sans carte bancaire",
  "✓ Annulable à tout moment",
] as const;

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(45deg, transparent 0, transparent 18px, rgba(26, 58, 42, 0.025) 18px, rgba(26, 58, 42, 0.025) 19px)",
            "repeating-linear-gradient(-45deg, transparent 0, transparent 18px, rgba(200, 144, 43, 0.02) 18px, rgba(200, 144, 43, 0.02) 19px)",
          ].join(", "),
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 size-[min(90vw,28rem)] rounded-full bg-gold-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-0 size-[min(80vw,24rem)] rounded-full bg-emerald-800/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <FadeUp>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            Plateforme N°1 pour le BAC algérien
          </p>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-emerald-900 sm:text-6xl lg:text-7xl">
            Le BAC, mais en mieux.{" "}
            <span className="italic text-gold-600">
              — Pour ta génération.
            </span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Cours, profs en visio, IA tutrice 24/7. Conçu pour le programme
            algérien, prêt pour tes ambitions.
          </p>
        </FadeUp>

        <FadeUp delay={0.24}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/inscription" className={btnPrimaryClass}>
              Commencer gratuitement
            </Link>
            <Link
              href="/#notre-approche"
              className="text-sm font-semibold text-emerald-800 underline-offset-4 transition-colors hover:text-emerald-900 hover:underline"
            >
              Voir comment ça marche
            </Link>
          </div>
        </FadeUp>

        <FadeUp delay={0.32}>
          <ul className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-6">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge}
                className="text-sm font-medium text-emerald-800"
              >
                {badge}
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
