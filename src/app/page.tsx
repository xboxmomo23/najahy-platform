import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
          Soutien scolaire · BAC · Algérie
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-emerald-900 sm:text-5xl">
          Réussis ton BAC autrement
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          Cours en visio, IA tutrice 24/7 et annales ONEC corrigées — conçu pour
          le programme algérien.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/inscription"
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-900 px-8 text-sm font-medium text-cream transition-colors hover:bg-emerald-800"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/connexion"
            className="inline-flex h-12 items-center justify-center rounded-full border border-sand bg-paper px-8 text-sm font-medium text-ink transition-colors hover:bg-cream"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
