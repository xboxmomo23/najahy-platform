import Link from "next/link";

import { LoginForm } from "@/app/connexion/login-form";
import { Logo } from "@/components/shared";

type ConnexionPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const { next: nextPath } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-16">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo href="/" size="lg" />
        </div>

        <div className="rounded-2xl border border-sand bg-paper p-8">
          <h1 className="text-center font-display text-2xl font-semibold text-emerald-900">
            Connexion
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Accède à ton espace Najahy
          </p>

          <div className="mt-8">
            <LoginForm nextPath={nextPath} />
          </div>

          {nextPath ? (
            <p className="mt-4 text-center text-xs text-muted">
              Après connexion →{" "}
              <span className="font-medium text-ink">{nextPath}</span>
            </p>
          ) : null}
        </div>

        <p className="text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-medium text-emerald-700 hover:text-emerald-900"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
