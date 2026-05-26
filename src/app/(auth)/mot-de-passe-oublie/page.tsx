import Link from "next/link";

import { ForgotPasswordForm } from "@/app/(auth)/mot-de-passe-oublie/forgot-password-form";

export default function MotDePasseOubliePage() {
  return (
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
          Mot de passe
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-cream">
          On t&apos;aide à retrouver l&apos;accès.
        </h1>

        <blockquote className="mt-auto border-l-2 border-gold-500/60 pl-4">
          <p className="font-display text-lg italic text-gold-100">
            &ldquo;Un lien par email, et c&apos;est reparti.&rdquo;
          </p>
          <footer className="mt-2 text-sm text-emerald-200/80">
            — L&apos;équipe Najahy
          </footer>
        </blockquote>
      </aside>

      <main className="flex min-h-screen flex-col justify-center lg:col-span-8">
        <div className="mx-auto w-full max-w-md px-5 py-12 sm:px-8 lg:max-w-lg lg:py-16">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
