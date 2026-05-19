import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  DAILY_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CHARGILY_API_KEY: z.string().min(1).optional(),
  CHARGILY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined>,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Variables d'environnement ${label} invalides ou manquantes :\n${formatEnvError(result.error)}`,
    );
  }
  return result.data;
}

/** Variables exposées au navigateur (préfixe NEXT_PUBLIC_). */
export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}, "client");

/** Variables serveur uniquement — ne jamais importer depuis un Client Component. */
export const serverEnv = parseEnv(serverEnvSchema, {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  DAILY_API_KEY: process.env.DAILY_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CHARGILY_API_KEY: process.env.CHARGILY_API_KEY,
  CHARGILY_WEBHOOK_SECRET: process.env.CHARGILY_WEBHOOK_SECRET,
}, "serveur");
