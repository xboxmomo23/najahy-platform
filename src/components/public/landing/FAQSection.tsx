"use client";

import { FadeUp } from "@/components/public/landing/motion";
import {
  SectionTag,
  SectionTitle,
} from "@/components/public/landing/section-primitives";

const FAQ_ITEMS = [
  {
    question: "Pour quel niveau ?",
    answer:
      "Najahy couvre le programme du BAC algérien — 3ème année secondaire, toutes filières (Sciences, Maths, Lettres, Gestion, etc.).",
  },
  {
    question: "Comment ça marche ?",
    answer:
      "Tu t'inscris gratuitement, tu explores la bibliothèque et tu poses des questions à l'IA. Quand tu es prêt, tu passes au Standard ou Premium pour débloquer les visios et la correction IA.",
  },
  {
    question: "Est-ce que c'est gratuit ?",
    answer:
      "Oui pour démarrer : le plan Découverte est gratuit, sans carte bancaire. Tu peux upgrader quand tu veux.",
  },
  {
    question: "Comment je paie en Algérie ?",
    answer:
      "Par CIB / Edahabia via Chargily, ou virement — paiement 100 % local en dinars algériens.",
  },
  {
    question: "Je vis à l'étranger, je peux payer pour mon enfant ?",
    answer:
      "Oui. Les parents diaspora peuvent souscrire et suivre la progression depuis l'espace Parent, où qu'ils soient.",
  },
] as const;

export function FAQSection() {
  return (
    <section className="bg-paper px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <FadeUp className="text-center">
          <SectionTag>FAQ</SectionTag>
          <SectionTitle className="mt-4">Questions fréquentes</SectionTitle>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-sand bg-cream"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-emerald-900 transition-colors marker:content-none hover:bg-paper [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span
                      className="text-gold-600 transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <div className="border-t border-sand px-5 py-4 text-sm leading-relaxed text-muted">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
