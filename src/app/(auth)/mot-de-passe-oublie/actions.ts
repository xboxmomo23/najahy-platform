"use server";

import { createClient } from "@/lib/supabase/server";
import { clientEnv } from "@/lib/env";
import { resetPasswordRequestSchema } from "@/lib/validations/auth";

export type ResetPasswordRequestState =
  | { success: true }
  | {
      success: false;
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

export async function requestPasswordResetAction(
  _prevState: ResetPasswordRequestState,
  formData: FormData,
): Promise<ResetPasswordRequestState> {
  const email = String(formData.get("email") ?? "").trim();

  const parsed = resetPasswordRequestSchema.safeParse({ email });

  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.flatten().fieldErrors);
    const firstError =
      Object.values(fieldErrors)[0] ?? "Données invalides. Vérifie le formulaire.";
    return { success: false, error: firstError, fieldErrors };
  }

  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/mot-de-passe-reinitialiser`,
  });

  // Toujours succès côté UI — pas de fuite sur l'existence du compte
  return { success: true };
}
