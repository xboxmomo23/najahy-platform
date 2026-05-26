"use server";

import { redirect } from "next/navigation";

import { isSafeRedirectPath } from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

const REDIRECT_BY_ROLE: Record<UserRole, string> = {
  student: "/app/dashboard",
  parent: "/parent/dashboard",
  teacher: "/prof/dashboard",
  admin: "/admin/dashboard",
};

export type SignInState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function zodFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) map[key] = messages[0];
  }
  return map;
}

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "").trim();

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.flatten().fieldErrors);
    const firstError =
      Object.values(fieldErrors)[0] ?? "Données invalides. Vérifie le formulaire.";
    return { error: firstError, fieldErrors };
  }

  const supabase = await createClient();

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

  if (signInError || !authData.user) {
    return { error: "Email ou mot de passe incorrect" };
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

  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", authData.user.id);

  if (nextPath && isSafeRedirectPath(nextPath)) {
    redirect(nextPath);
  }

  redirect(REDIRECT_BY_ROLE[profile.role]);
}
