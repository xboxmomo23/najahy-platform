import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

const FREE_DAILY_QUESTION_LIMIT = 3;

type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

export type QuotaCheckResult = {
  allowed: boolean;
  remaining: number | "unlimited";
  plan: string;
};

/** Date du jour au fuseau Algérie (YYYY-MM-DD), alignée sur `usage_date`. */
function getTodayUsageDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Algiers",
  });
}

async function getActivePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.plan ?? "free";
}

async function getTodayQuestionCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const today = getTodayUsageDate();

  const { data, error } = await supabase
    .from("ai_daily_usage")
    .select("questions_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.questions_count ?? 0;
}

/**
 * Vérifie si l'élève peut poser une question au tuteur IA.
 * Free : 3 questions / jour ; standard & premium : illimité.
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const supabase = await createClient();
  const plan = await getActivePlan(supabase, userId);

  if (plan === "standard" || plan === "premium") {
    return {
      allowed: true,
      remaining: "unlimited",
      plan,
    };
  }

  const count = await getTodayQuestionCount(supabase, userId);
  const remaining = Math.max(0, FREE_DAILY_QUESTION_LIMIT - count);

  return {
    allowed: count < FREE_DAILY_QUESTION_LIMIT,
    remaining,
    plan,
  };
}

/**
 * Incrémente l'usage quotidien après une question (insert ou update).
 */
export async function incrementUsage(
  userId: string,
  tokensUsed: number,
): Promise<void> {
  const supabase = await createClient();
  const today = getTodayUsageDate();

  const { data: existing, error: selectError } = await supabase
    .from("ai_daily_usage")
    .select("id, questions_count, tokens_used")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("ai_daily_usage")
      .update({
        questions_count: (existing.questions_count ?? 0) + 1,
        tokens_used: (existing.tokens_used ?? 0) + tokensUsed,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
    return;
  }

  const { error: insertError } = await supabase.from("ai_daily_usage").insert({
    user_id: userId,
    usage_date: today,
    questions_count: 1,
    tokens_used: tokensUsed,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}
