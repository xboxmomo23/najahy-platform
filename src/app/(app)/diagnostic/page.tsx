import { redirect } from "next/navigation";

import { getDiagnosticQuestions } from "@/app/(app)/diagnostic/actions";
import { DiagnosticEntryGate } from "@/components/features/diagnostic/DiagnosticEntryGate";
import { DiagnosticWizard } from "@/components/features/diagnostic/DiagnosticWizard";
import { parseDiagnosticResults } from "@/lib/diagnostic/parse-diagnostic-results";
import { createClient } from "@/lib/supabase/server";

export default async function DiagnosticPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/app/diagnostic");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/connexion");
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "diagnostic_completed, diagnostic_results, diagnostic_completed_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const questionsBySubject = await getDiagnosticQuestions();
  const firstName = profile.first_name;
  const diagnosticAlreadyCompleted = student?.diagnostic_completed === true;

  if (questionsBySubject.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-emerald-900">
          Diagnostic indisponible
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Aucune question n&apos;est configurée pour ta filière pour le moment.
          Réessaie plus tard ou contacte le support.
        </p>
      </div>
    );
  }

  if (diagnosticAlreadyCompleted) {
    const existingResult = parseDiagnosticResults(
      student?.diagnostic_results,
    );

    return (
      <DiagnosticEntryGate
        firstName={firstName}
        existingResult={existingResult}
        questionsBySubject={questionsBySubject}
        completedAt={student?.diagnostic_completed_at}
      />
    );
  }

  return (
    <DiagnosticWizard
      questionsBySubject={questionsBySubject}
      firstName={firstName}
    />
  );
}
