"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { resetPasswordConfirmSchema } from "@/lib/validations/auth";

export type UpdatePasswordState = {
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

export async function updatePasswordAction(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const parsed = resetPasswordConfirmSchema.safeParse({
    password,
    passwordConfirm,
  });

  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.flatten().fieldErrors);
    const firstError =
      Object.values(fieldErrors)[0] ?? "Données invalides. Vérifie le formulaire.";
    return { error: firstError, fieldErrors };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Lien invalide ou expiré. Demande un nouveau lien de réinitialisation.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return {
      error:
        "Impossible de mettre à jour le mot de passe. Réessaie ou demande un nouveau lien.",
    };
  }

  await supabase.auth.signOut();

  redirect("/connexion?passwordUpdated=1");
}
