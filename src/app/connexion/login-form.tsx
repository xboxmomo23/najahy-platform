"use client";

import { useActionState } from "react";

import { signInAction, type SignInState } from "@/app/connexion/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <form action={formAction} className="w-full space-y-5">
      {nextPath ? (
        <input type="hidden" name="next" value={nextPath} />
      ) : null}

      <div className="space-y-2 text-left">
        <Label htmlFor="email" className="text-ink">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="toi@exemple.dz"
          disabled={isPending}
          className="border-sand bg-cream"
        />
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="password" className="text-ink">
          Mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          disabled={isPending}
          className="border-sand bg-cream"
        />
      </div>

      {state.error ? (
        <p
          className="text-sm font-medium text-coral"
          role="alert"
          aria-live="polite"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "flex h-11 w-full items-center justify-center rounded-lg bg-emerald-800 text-sm font-medium text-cream transition-colors",
          "hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
