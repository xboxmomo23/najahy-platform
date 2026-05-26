"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type GateState = "loading" | "ready" | "error";

export function RecoverySessionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const cleanUrl = () => {
      if (window.location.hash || window.location.search.includes("code=")) {
        window.history.replaceState(null, "", "/mot-de-passe-reinitialiser");
      }
    };

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && !cancelled) {
        cleanUrl();
        setState("ready");
        return true;
      }
      return false;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        !cancelled &&
        session &&
        (event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "PASSWORD_RECOVERY")
      ) {
        cleanUrl();
        setState("ready");
      }
    });

    void checkSession();

    const timer = window.setTimeout(() => {
      void checkSession().then((ok) => {
        if (!ok && !cancelled) setState("error");
      });
    }, 2000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
        <Loader2 className="size-8 animate-spin text-emerald-800" aria-hidden />
        <p className="text-sm">Vérification du lien…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <p className="text-base text-emerald-900">
          Ce lien est invalide ou a expiré. Demande un nouveau lien de
          réinitialisation.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-medium text-cream hover:bg-emerald-900"
        >
          Mot de passe oublié
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
