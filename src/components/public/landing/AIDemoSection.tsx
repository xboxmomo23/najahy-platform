"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FadeUp } from "@/components/public/landing/motion";
import { btnPrimaryClass } from "@/components/public/landing/section-primitives";
import { Input } from "@/components/ui/input";

const DEMO_EXCHANGE = [
  {
    role: "user" as const,
    text: "Explique-moi les fonctions exponentielles, je suis en 3ème sciences.",
  },
  {
    role: "ai" as const,
    text: "Une fonction exponentielle s'écrit f(x) = aˣ. Le nombre a est la base. Si a > 1, la courbe monte de plus en plus vite — c'est ce qu'on voit en croissance ou en décroissance radioactive.",
  },
];

export function AIDemoSection() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("question", trimmed);
    }
    router.push(
      `/inscription${params.toString() ? `?${params.toString()}` : ""}`,
    );
  }

  return (
    <section className="bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <FadeUp className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h2 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            Pose ta première question à l&apos;IA, c&apos;est gratuit
          </h2>
          <p className="mt-3 text-muted">
            Inscris-toi pour obtenir ta réponse personnalisée — en français,
            arabe ou darija.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="ai-question" className="sr-only">
              Ta question pour l&apos;IA
            </label>
            <Input
              id="ai-question"
              name="question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Explique-moi les fonctions exponentielles"
              className="h-12 flex-1 border-sand bg-paper text-base"
              autoComplete="off"
            />
            <button type="submit" className={btnPrimaryClass}>
              Essayer
            </button>
          </form>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div
            className="mt-8 space-y-4 rounded-2xl border border-sand bg-paper p-5 sm:p-6"
            aria-label="Exemple d'échange avec l'IA tutrice"
          >
            {DEMO_EXCHANGE.map((message) => (
              <div
                key={message.role}
                className={
                  message.role === "user"
                    ? "ml-0 mr-8 rounded-2xl rounded-bl-sm bg-cream px-4 py-3 text-sm text-ink"
                    : "ml-8 mr-0 rounded-2xl rounded-br-sm border border-sand bg-cream px-4 py-3 text-sm text-ink"
                }
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {message.role === "user" ? "Toi" : "IA Najahy"}
                </p>
                {message.text}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
