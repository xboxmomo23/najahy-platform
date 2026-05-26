import Link from "next/link";

import { RoleSelectionCard } from "@/components/auth/RoleSelectionCard";
import { Logo } from "@/components/shared";

const WAVE_TWO_TOOLTIP = "Disponible à la Vague 2 — fin août 2026";

export default function InscriptionPage() {
  return (
    <main className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo href="/" size="md" />
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <header className="mt-10 text-center sm:mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            Inscription
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-emerald-900 sm:text-5xl">
            Tu es ? On va t&apos;orienter.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            Le parcours d&apos;inscription change selon ton rôle. Choisis le tien.
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <RoleSelectionCard
            title="Je suis élève"
            description="Je prépare le BAC. Je veux progresser à mon rythme."
            href="/inscription/eleve"
            icon="student"
            iconWrapperClass="bg-gold-100"
            iconClass="text-gold-600"
            badge="⭐ Le plus fréquent"
            badgeVariant="good"
          />
          <RoleSelectionCard
            title="Je suis parent"
            description="J'inscris mon enfant ou je rejoins son compte existant."
            href="/inscription/parent"
            icon="parent"
            iconWrapperClass="bg-emerald-100"
            iconClass="text-emerald-700"
            disabled
            disabledMessage={WAVE_TWO_TOOLTIP}
          />
          <RoleSelectionCard
            title="Je suis professeur"
            description="Je veux donner des cours en visio aux élèves de Najahy."
            href="/inscription/prof"
            icon="teacher"
            iconWrapperClass="bg-paper"
            iconClass="text-emerald-800"
            badge="Sur dossier"
            badgeVariant="warning"
            disabled
            disabledMessage={WAVE_TWO_TOOLTIP}
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            Connecte-toi
          </Link>
        </p>
      </div>
    </main>
  );
}
