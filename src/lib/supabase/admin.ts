import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

function getAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.",
    );
  }

  return { url, serviceRoleKey };
}

/**
 * Client admin Supabase (service role) — contourne le RLS.
 * À utiliser uniquement dans des Server Actions ou Route Handlers protégés.
 * Ne jamais importer dans un Client Component.
 */
export function createAdminClient() {
  const { url, serviceRoleKey } = getAdminEnv();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
