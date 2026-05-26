import Link from "next/link";

export default function TarifsPage() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
          Tarifs
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
          Choisis ton plan
        </h1>
        <p className="mt-4 text-lg text-muted">
          Page tarifs en construction — Gratuit, Standard et Premium arrivent
          bientôt.
        </p>
        <Link
          href="/inscription"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-emerald-900"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
