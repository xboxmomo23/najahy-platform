"use client";

import Link from "next/link";

import { FadeUp } from "@/components/public/landing/motion";
import {
  SectionTag,
  SectionTitle,
  btnPrimaryClass,
} from "@/components/public/landing/section-primitives";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Découverte",
    price: "Gratuit",
    period: "",
    description: "Bibliothèque limitée + 5 questions IA / jour",
    featured: false,
  },
  {
    name: "Standard",
    price: "2 500",
    period: "DZD / mois",
    description: "Bibliothèque complète + IA illimitée + 2 visios / mois",
    featured: true,
  },
  {
    name: "Premium",
    price: "5 500",
    period: "DZD / mois",
    description: "Tout Standard + visios illimitées + correction IA",
    featured: false,
  },
] as const;

export function PricingTeaserSection() {
  return (
    <section className="bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <SectionTag>Tarifs</SectionTag>
          <SectionTitle className="mt-4">
            Un plan pour chaque ambition.
          </SectionTitle>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <FadeUp key={plan.name} delay={index * 0.08}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-2xl border p-6 sm:p-8",
                  plan.featured
                    ? "border-emerald-800 bg-emerald-900 text-cream shadow-lg"
                    : "border-sand bg-paper",
                )}
              >
                <h3
                  className={cn(
                    "font-display text-xl font-semibold",
                    plan.featured ? "text-cream" : "text-emerald-900",
                  )}
                >
                  {plan.name}
                </h3>
                <p className="mt-4">
                  <span
                    className={cn(
                      "font-display text-3xl font-semibold",
                      plan.featured ? "text-gold-400" : "text-emerald-900",
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span
                      className={cn(
                        "ml-1 text-sm",
                        plan.featured ? "text-gold-100" : "text-muted",
                      )}
                    >
                      {plan.period}
                    </span>
                  ) : null}
                </p>
                <p
                  className={cn(
                    "mt-4 flex-1 text-sm leading-relaxed",
                    plan.featured ? "text-emerald-100" : "text-muted",
                  )}
                >
                  {plan.description}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2} className="mt-10 text-center">
          <Link href="/tarifs" className={btnPrimaryClass}>
            Voir tous les détails
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
