"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "@/app/(auth)/mot-de-passe-reinitialiser/actions";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

const initialState: UpdatePasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          Choisis un nouveau mot de passe.
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Minimum 8 caractères, avec au moins une majuscule et un chiffre.
        </p>
      </header>

      <form action={formAction} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.password}
              className="h-10 border-sand bg-cream pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted hover:text-emerald-800"
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
          <PasswordStrength password={password} />
          {state.fieldErrors?.password ? (
            <p className="text-sm font-medium text-coral" role="alert">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirmation</Label>
          <div className="relative">
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.passwordConfirm}
              className="h-10 border-sand bg-cream pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted hover:text-emerald-800"
              aria-label={
                showConfirm
                  ? "Masquer la confirmation"
                  : "Afficher la confirmation"
              }
            >
              {showConfirm ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {state.fieldErrors?.passwordConfirm ? (
            <p className="text-sm font-medium text-coral" role="alert">
              {state.fieldErrors.passwordConfirm}
            </p>
          ) : null}
        </div>

        {state.error &&
        !state.fieldErrors?.password &&
        !state.fieldErrors?.passwordConfirm ? (
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
              Mise à jour…
            </>
          ) : (
            "Mettre à jour mon mot de passe"
          )}
        </button>
      </form>
    </div>
  );
}
