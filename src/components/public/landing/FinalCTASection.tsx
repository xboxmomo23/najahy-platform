"use client";

import Link from "next/link";

import { FadeUp } from "@/components/public/landing/motion";
import { btnGoldClass } from "@/components/public/landing/section-primitives";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-emerald-900 px-4 py-16 sm:px-6 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(45deg, transparent 0, transparent 18px, rgba(250, 246, 239, 0.04) 18px, rgba(250, 246, 239, 0.04) 19px)",
            "repeating-linear-gradient(-45deg, transparent 0, transparent 18px, rgba(212, 162, 76, 0.06) 18px, rgba(212, 162, 76, 0.06) 19px)",
          ].join(", "),
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FadeUp>
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl lg:text-5xl">
            Commence aujourd&apos;hui. Paie quand tu seras sûr.
          </h2>
        </FadeUp>
        <FadeUp delay={0.12}>
          <p className="mt-4 text-base text-emerald-100 sm:text-lg">
            7 jours gratuits sur le plan Standard. Sans engagement.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <Link href="/inscription" className={`${btnGoldClass} mt-8`}>
            Commencer mes 7 jours gratuits
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
