import Link from "next/link";
import { Suspense } from "react";

import { PasswordUpdatedToast } from "@/app/(auth)/connexion/password-updated-toast";
import { LoginForm } from "@/app/(auth)/connexion/login-form";

type ConnexionPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const { next: nextPath } = await searchParams;

  return (
    <>
      <Suspense fallback={null}>
        <PasswordUpdatedToast />
      </Suspense>
    <div className="min-h-screen lg:grid lg:grid-cols-12">
      <aside className="relative hidden flex-col bg-emerald-800 px-10 py-12 text-cream lg:col-span-4 lg:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800"
          aria-label="Najahy — accueil"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900 font-display text-2xl font-semibold text-gold-500">
            ن
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-gold-500">
            Najahy
          </span>
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gold-400">
          Connexion
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-cream">
          Content de te revoir.
        </h1>

        <blockquote className="mt-auto border-l-2 border-gold-500/60 pl-4">
          <p className="font-display text-lg italic text-gold-100">
            &ldquo;Najahy m&apos;a fait gagner 4 points en 2 mois.&rdquo;
          </p>
          <footer className="mt-2 text-sm text-emerald-200/80">
            — Yacine, Oran
          </footer>
        </blockquote>
      </aside>

      <main className="flex min-h-screen flex-col justify-center lg:col-span-8">
        <div className="mx-auto w-full max-w-md px-5 py-12 sm:px-8 lg:max-w-lg lg:py-16">
          <LoginForm nextPath={nextPath} />
        </div>
      </main>
    </div>
    </>
  );
}
