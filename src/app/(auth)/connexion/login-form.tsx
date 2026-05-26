"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { signInAction, type SignInState } from "@/app/(auth)/connexion/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

const initialState: SignInState = {};

export interface LoginFormProps {
  nextPath?: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
        <Logo href="/" size="sm" />
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Accueil
        </Link>
      </div>

      <header className="mb-8 lg:mb-10">
        <h1 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
          Connexion
        </h1>
        <p className="mt-2 text-muted">
          Accède à ton espace Najahy avec ton email et ton mot de passe.
        </p>
      </header>

      <form action={formAction} className="space-y-5" noValidate>
        {nextPath ? (
          <input type="hidden" name="next" value={nextPath} />
        ) : null}

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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.password}
              className="h-10 border-sand bg-cream pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-emerald-800"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {state.fieldErrors?.password ? (
            <p className="text-sm font-medium text-coral" role="alert">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        {state.error ? (
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
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-sand" />
        </div>
        <p className="relative flex justify-center text-xs uppercase tracking-wider text-muted">
          <span className="bg-cream px-3">ou</span>
        </p>
      </div>

      <Link
        href="/inscription"
        className={cn(
          "flex h-11 w-full items-center justify-center rounded-lg border border-sand bg-cream text-sm font-medium text-emerald-900 transition-colors",
          "hover:border-emerald-800/30 hover:bg-paper",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        )}
      >
        Pas encore inscrit ? Créer un compte
      </Link>

      {nextPath ? (
        <p className="mt-6 text-center text-xs text-muted">
          Après connexion →{" "}
          <span className="font-medium text-ink">{nextPath}</span>
        </p>
      ) : null}
    </div>
  );
}
