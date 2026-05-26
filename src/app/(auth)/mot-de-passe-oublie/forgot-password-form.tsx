"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import {
  requestPasswordResetAction,
  type ResetPasswordRequestState,
} from "@/app/(auth)/mot-de-passe-oublie/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

const initialState: ResetPasswordRequestState = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
          <Logo href="/" size="sm" />
          <Link
            href="/connexion"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Connexion
          </Link>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-6 text-center">
          <p className="text-base leading-relaxed text-emerald-900 sm:text-lg">
            📧 C&apos;est envoyé. Vérifie ta boîte mail (et tes spams).
          </p>
        </div>

        <Link
          href="/connexion"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-sand bg-cream text-sm font-medium text-emerald-900 transition-colors hover:border-emerald-800/30 hover:bg-paper"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
        <Logo href="/" size="sm" />
        <Link
          href="/connexion"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Connexion
        </Link>
      </div>

      <header className="mb-8 lg:mb-10">
        <h1 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
          Tu as oublié ton mot de passe ?
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Pas de panique. Saisis ton email, on t&apos;envoie un lien pour le
          réinitialiser.
        </p>
      </header>

      <form action={formAction} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.dz"
            disabled={isPending}
            aria-invalid={!!state.fieldErrors?.email}
            className="h-10 border-sand bg-cream"
          />
          {state.fieldErrors?.email ? (
            <p className="text-sm font-medium text-coral" role="alert">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        {state.error && !state.fieldErrors?.email ? (
          <p className="text-sm font-medium text-coral" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 text-sm font-medium text-cream transition-colors",
            "hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Envoi…
            </>
          ) : (
            "Envoyer le lien"
          )}
        </button>
      </form>

      <p className="mt-8 text-center">
        <Link
          href="/connexion"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
