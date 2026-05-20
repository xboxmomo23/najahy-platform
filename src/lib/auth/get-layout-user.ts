import { redirect } from "next/navigation";

import {
  DASHBOARD_BY_ROLE,
  type UserRole,
} from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type LayoutUser = {
  id: string;
  firstName: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  secondaryLabel?: string;
  verificationStatus?: Database["public"]["Enums"]["teacher_verification"];
};

const PLAN_LABELS: Record<
  Database["public"]["Enums"]["subscription_plan"],
  string
> = {
  free: "Plan Gratuit",
  standard: "Plan Standard",
  premium: "Plan Premium",
};

function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export async function getLayoutUser(
  expectedRole: UserRole,
): Promise<LayoutUser> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/connexion");
  }

  if (profile.role !== expectedRole) {
    redirect(DASHBOARD_BY_ROLE[profile.role]);
  }

  const layoutUser: LayoutUser = {
    id: profile.id,
    firstName: profile.first_name,
    name: formatFullName(profile.first_name, profile.last_name),
    avatarUrl: profile.avatar_url ?? undefined,
    role: profile.role,
  };

  if (expectedRole === "student") {
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const subscription = subscriptions?.find(
      (s) => s.status === "active" || s.status === "pending",
    );
    layoutUser.secondaryLabel = PLAN_LABELS[subscription?.plan ?? "free"];
  }

  if (expectedRole === "teacher") {
    const { data: teacher } = await supabase
      .from("teachers")
      .select("verification_status")
      .eq("user_id", user.id)
      .maybeSingle();

    layoutUser.verificationStatus = teacher?.verification_status ?? "pending";
  }

  if (expectedRole === "admin") {
    layoutUser.secondaryLabel = "Super Admin";
  }

  return layoutUser;
}
