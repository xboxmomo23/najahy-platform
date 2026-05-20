"use server";

import { redirect } from "next/navigation";

import {
  getDashboardPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    return {
      error:
        signInError.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : signInError.message,
    };
  }

  if (!authData.user) {
    return { error: "Connexion impossible. Réessaie." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      error: "Profil utilisateur introuvable. Contacte le support.",
    };
  }

  if (nextPath && isSafeRedirectPath(nextPath)) {
    redirect(nextPath);
  }

  redirect(getDashboardPathForRole(profile.role));
}
