"use client";

import { Check, Minus, X } from "lucide-react";

import { FadeUp } from "@/components/public/landing/motion";
import {
  SectionTag,
  SectionTitle,
} from "@/components/public/landing/section-primitives";
import { cn } from "@/lib/utils";

type CellValue = "yes" | "partial" | "no";

const FEATURES = [
  "Contenu BAC algérien",
  "Profs visio",
  "IA tutrice",
  "Paiement local",
  "Correction IA",
] as const;

const COMPETITORS: {
  name: string;
  highlight?: boolean;
  values: CellValue[];
}[] = [
  {
    name: "Najahy",
    highlight: true,
    values: ["yes", "yes", "yes", "yes", "yes"],
  },
  {
    name: "Zidney",
    values: ["partial", "no", "no", "yes", "no"],
  },
  {
    name: "iMadrassa",
    values: ["partial", "no", "partial", "yes", "no"],
  },
  {
    name: "Karrini",
    values: ["yes", "no", "no", "partial", "no"],
  },
  {
    name: "DzExams",
    values: ["partial", "no", "no", "yes", "partial"],
  },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
        <Check className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Oui</span>
        <span aria-hidden>✓</span>
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-gold-600">
        <Minus className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Partiel</span>
        <span aria-hidden>~</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-muted">
      <X className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">Non</span>
      <span aria-hidden>✗</span>
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section
      id="comment-ca-marche"
      className="scroll-mt-24 bg-paper px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <SectionTag>Pourquoi Najahy</SectionTag>
          <SectionTitle className="mt-4">
            Tout ce que les autres font à moitié.
          </SectionTitle>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-sand bg-cream">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparaison Najahy avec les principales plateformes concurrentes
              </caption>
              <thead>
                <tr className="border-b border-sand">
                  <th
                    scope="col"
                    className="p-4 font-medium text-muted"
                  >
                    Plateforme
                  </th>
                  {FEATURES.map((feature) => (
                    <th
                      key={feature}
                      scope="col"
                      className="p-4 text-center font-medium text-emerald-900"
                    >
                      {feature}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row) => (
                  <tr
                    key={row.name}
                    className={cn(
                      "border-b border-sand last:border-0",
                      row.highlight && "bg-emerald-50/80",
                    )}
                  >
                    <th
                      scope="row"
                      className={cn(
                        "p-4 font-display text-base font-semibold",
                        row.highlight ? "text-emerald-900" : "text-ink",
                      )}
                    >
                      {row.name}
                    </th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.name}-${FEATURES[index]}`}
                        className="p-4 text-center"
                      >
                        <CellIcon value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
