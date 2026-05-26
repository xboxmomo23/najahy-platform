import Link from "next/link";

import { BienvenueEntrance } from "@/components/app/bienvenue-entrance";
import { WelcomeConfetti } from "@/components/app/welcome-confetti";
import { ZelligeBackground } from "@/components/shared";
import { getBienvenueUser } from "@/lib/auth/get-bienvenue-user";
import { cn } from "@/lib/utils";

function SuccessCheckIcon() {
  return (
    <svg
      width={96}
      height={96}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      aria-hidden
    >
      <circle
        cx={48}
        cy={48}
        r={44}
        className="fill-emerald-100 stroke-emerald-600"
        strokeWidth={3}
      />
      <path
        d="M30 48.5L42.5 61L66 35"
        className="stroke-emerald-700"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function BienvenuePage() {
  const { firstName } = await getBienvenueUser();

  return (
    <ZelligeBackground className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <WelcomeConfetti />

      <BienvenueEntrance>
        <article className="relative z-10 mx-auto w-full max-w-2xl rounded-2xl border border-sand bg-cream/90 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-10 sm:py-12">
          <SuccessCheckIcon />

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold-600">
            Compte créé
          </p>

          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-emerald-900 sm:text-6xl">
            Bienvenue sur Najahy, {firstName}.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Ton compte est prêt. Maintenant, on va apprendre à te connaître pour
            te faire un plan sur mesure.
          </p>

          <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-100 px-5 py-4 text-left text-sm leading-relaxed text-emerald-900 sm:text-base">
            Le diagnostic prend 15 minutes. C&apos;est ce qui rend ton plan
            vraiment personnalisé. Tu peux le passer maintenant ou plus tard
            depuis ton dashboard.
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app/diagnostic"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium transition-colors",
                "bg-emerald-800 text-cream hover:bg-emerald-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
              )}
            >
              Commencer mon diagnostic
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-colors",
                "border-sand bg-cream text-emerald-900 hover:border-emerald-800/30 hover:bg-paper",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
              )}
            >
              Plus tard, voir mon dashboard
            </Link>
          </div>
        </article>
      </BienvenueEntrance>
    </ZelligeBackground>
  );
}
