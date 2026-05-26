import { z } from "zod";

const filiereValues = [
  "sciences_exp",
  "mathematiques",
  "techniques_math",
  "gestion_eco",
  "lettres_philo",
  "langues",
] as const;

const languagePreferenceValues = ["fr", "ar", "darija"] as const;

/** Étape 1 : compte de base */
export const signupStep1Schema = z.object({
  firstName: z
    .string()
    .min(2, "Prénom trop court")
    .max(50, "Prénom trop long"),
  lastName: z.string().min(2, "Nom trop court").max(50, "Nom trop long"),
  email: z.email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
});

/** Étape 2 : profil scolaire (élève) */
export const signupStep2Schema = z.object({
  filiere: z.enum(filiereValues),
  level: z.string().default("terminale"),
  birthdate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Date invalide",
  }),
  wilaya: z.string().min(2, "Wilaya requise"),
  phone: z.string().optional(),
});

/** Étape 3 : objectifs */
export const signupStep3Schema = z.object({
  targetScore: z.number().min(10).max(20),
  hoursPerWeek: z.number().min(1).max(40),
  focusAreas: z.array(z.string()).default([]),
});

/** Étape 4 : préférences finales (langue + parent optionnel) */
export const signupStep4Schema = z.object({
  languagePreference: z.enum(languagePreferenceValues).default("fr"),
  parentEmail: z
    .union([z.email("Email invalide"), z.literal("")])
    .optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Tu dois accepter les CGU",
  }),
});

/** Schéma complet (utilisé côté Server Action finale) */
export const fullStudentSignupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema)
  .merge(signupStep4Schema);

export type SignupStep1 = z.infer<typeof signupStep1Schema>;
export type SignupStep2 = z.infer<typeof signupStep2Schema>;
export type SignupStep3 = z.infer<typeof signupStep3Schema>;
export type SignupStep4 = z.infer<typeof signupStep4Schema>;
export type FullStudentSignup = z.infer<typeof fullStudentSignupSchema>;

/** Schéma de connexion */
export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Schéma reset password */
export const resetPasswordRequestSchema = z.object({
  email: z.email("Email invalide"),
});

export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;

export const resetPasswordConfirmSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });

export type ResetPasswordConfirmInput = z.infer<
  typeof resetPasswordConfirmSchema
>;
