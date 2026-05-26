import { redirect } from "next/navigation";

import { parseDiagnosticResults } from "@/lib/diagnostic/parse-diagnostic-results";
import type { DiagnosticResult } from "@/lib/diagnostic/scoring";
import { DASHBOARD_BY_ROLE } from "@/lib/auth/dashboard-by-role";
import { createClient } from "@/lib/supabase/server";

export type StudentDashboardData = {
  firstName: string;
  diagnosticCompleted: boolean;
  diagnosticResults: DiagnosticResult | null;
  currentPredictedScore: number | null;
  targetScore: number | null;
};

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/dashboard");
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

  const { data: student } = await supabase
    .from("students")
    .select(
      "diagnostic_completed, diagnostic_results, current_predicted_score, target_score",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const diagnosticCompleted = student?.diagnostic_completed === true;

  return {
    firstName: profile.first_name,
    diagnosticCompleted,
    diagnosticResults: diagnosticCompleted
      ? parseDiagnosticResults(student?.diagnostic_results)
      : null,
    currentPredictedScore: student?.current_predicted_score ?? null,
    targetScore: student?.target_score ?? null,
  };
}
