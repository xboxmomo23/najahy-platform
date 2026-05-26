import { redirect } from "next/navigation";

import { DASHBOARD_BY_ROLE } from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";

/** Profil minimal pour /app/bienvenue (sans shell élève). */
export async function getBienvenueUser(): Promise<{ firstName: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/connexion");
  }

  if (profile.role !== "student") {
    redirect(DASHBOARD_BY_ROLE[profile.role]);
  }

  return { firstName: profile.first_name };
}
