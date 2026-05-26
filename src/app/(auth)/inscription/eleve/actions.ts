"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  fullStudentSignupSchema,
  type FullStudentSignup,
} from "@/lib/validations/auth";

export type SignupStudentResult =
  | { success: true; redirectTo: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function isMinor(birthdate: string): boolean {
  const birth = new Date(birthdate);
  const adultThreshold = new Date();
  adultThreshold.setFullYear(adultThreshold.getFullYear() - 18);
  return birth > adultThreshold;
}

function isDuplicateEmailError(message: string, code?: string): boolean {
  const lower = message.toLowerCase();
  return (
    code === "email_exists" ||
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("duplicate")
  );
}

async function rollbackAuthUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error(
      `[signupStudent] Échec du rollback auth pour ${userId}:`,
      error.message,
    );
  }
}

export async function signupStudent(
  formData: FullStudentSignup,
): Promise<SignupStudentResult> {
  const parsed = fullStudentSignupSchema.safeParse(formData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat().find(Boolean) ??
      "Données invalides. Vérifie le formulaire.";

    return {
      success: false,
      error: firstError,
      fieldErrors,
    };
  }

  const data = parsed.data;
  const parentEmail =
    data.parentEmail && data.parentEmail !== ""
      ? data.parentEmail.trim()
      : undefined;

  const admin = createAdminClient();
  const supabase = await createClient();

  // Déconnecte une session existante (ex. compte admin de dev) avant de créer l'élève
  await supabase.auth.signOut();

  const { data: authData, error: createUserError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

  if (createUserError) {
    if (
      isDuplicateEmailError(createUserError.message, createUserError.code)
    ) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }
    return {
      success: false,
      error: createUserError.message ?? "Impossible de créer le compte.",
    };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return {
      success: false,
      error: "Impossible de créer le compte.",
    };
  }

  const { data: parentCode, error: parentCodeError } = await admin.rpc(
    "generate_parent_code",
  );

  if (parentCodeError || !parentCode) {
    await rollbackAuthUser(userId);
    return {
      success: false,
      error: "Impossible de générer le code parent.",
    };
  }

  const { error: userInsertError } = await admin.from("users").insert({
    id: userId,
    email: data.email,
    role: "student",
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone || null,
    wilaya: data.wilaya,
    language_preference: data.languagePreference,
  });

  if (userInsertError) {
    await rollbackAuthUser(userId);
    return {
      success: false,
      error:
        userInsertError.message ?? "Erreur lors de la création du profil.",
    };
  }

  const { error: studentInsertError } = await admin.from("students").insert({
    user_id: userId,
    filiere: data.filiere,
    level: data.level,
    birthdate: data.birthdate,
    parent_code: parentCode,
    target_score: data.targetScore,
    hours_per_week: data.hoursPerWeek,
  });

  if (studentInsertError) {
    await rollbackAuthUser(userId);
    return {
      success: false,
      error:
        studentInsertError.message ??
        "Erreur lors de la création du profil élève.",
    };
  }

  if (isMinor(data.birthdate)) {
    if (parentEmail) {
      const { data: parentProfile } = await admin
        .from("users")
        .select("id")
        .eq("email", parentEmail)
        .eq("role", "parent")
        .maybeSingle();

      if (parentProfile) {
        const { error: linkError } = await admin
          .from("parent_child_links")
          .insert({
            child_id: userId,
            parent_id: parentProfile.id,
            validated_minor: false,
            confirmed_by_child: false,
          });

        if (linkError) {
          console.error(
            `[signupStudent] Lien parent-enfant non créé:`,
            linkError.message,
          );
        } else {
          console.info(
            `[signupStudent] Lien parent-enfant en validation en attente — notification email à prévoir pour ${parentEmail}.`,
          );
        }
      } else {
        console.warn(
          `[signupStudent] Élève mineur — aucun compte parent pour ${parentEmail}. Invitation email à prévoir.`,
        );
      }
    } else {
      console.warn(
        `[signupStudent] Élève mineur ${userId} sans email parent — liaison possible plus tard.`,
      );
    }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInError) {
    return {
      success: false,
      error:
        "Compte créé mais connexion automatique impossible. Connecte-toi manuellement.",
    };
  }

  return {
    success: true,
    redirectTo: "/app/bienvenue",
  };
}
