import Link from "next/link";

export default function InscriptionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-sand bg-paper p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-emerald-900">
          Inscription
        </h1>
        <p className="mt-3 text-muted">
          Le parcours d&apos;inscription arrive bientôt.
        </p>
        <Link
          href="/connexion"
          className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Déjà un compte ? Se connecter
        </Link>
      </div>
    </main>
  );
}
