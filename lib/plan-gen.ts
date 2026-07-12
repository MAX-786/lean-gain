import type { SupabaseClient } from "@supabase/supabase-js";
import { generatePlanDays } from "@/lib/calc";

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * (Re)generate a user's 30-day plan starting at `startDate` (YYYY-MM-DD).
 * Deletes existing plan days and rebuilds them so `startDate` is Day 1.
 */
export async function regeneratePlan(
  supabase: SupabaseClient,
  userId: string,
  startDate: string
) {
  const { data: templates } = await supabase
    .from("meal_templates")
    .select("id")
    .order("sort");
  const ids = (templates ?? []).map((t: { id: string }) => t.id);
  const plan = generatePlanDays(ids, 30);
  const rows = plan.map((p) => ({
    user_id: userId,
    plan_date: addDays(startDate, p.dayIndex - 1),
    day_index: p.dayIndex,
    template_id: p.templateId,
  }));
  await supabase.from("user_plan_days").delete().eq("user_id", userId);
  await supabase.from("user_plan_days").upsert(rows, { onConflict: "user_id,plan_date" });
}
