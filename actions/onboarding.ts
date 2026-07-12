"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/schemas";
import { computeTargets, generatePlanDays } from "@/lib/calc";

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Persist onboarding: profile + computed targets + baseline weight + a
 * personalized 30-day plan. `startDate` is the user's LOCAL date (YYYY-MM-DD)
 * so plan day 1 is genuinely today in their timezone.
 */
export async function saveOnboarding(raw: unknown, startDate: string, timezone?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const input = onboardingSchema.parse(raw);
  const targets = computeTargets(input);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ? startDate
    : new Date().toISOString().slice(0, 10);
  const tz = timezone && timezone.length > 0 ? timezone : "Asia/Kolkata";

  // 1) profile
  const { error: pErr } = await supabase.from("profiles").upsert({
    id: user.id,
    name: input.name,
    sex: input.sex,
    age: input.age,
    height_cm: input.heightCm,
    goal: input.goal,
    target_min_kg: input.targetMinKg,
    target_max_kg: input.targetMaxKg,
    timeline_weeks: input.timelineWeeks,
    appetite: input.appetite ?? "small",
    activity_level: input.activity,
    training_days: input.trainingDays ?? 5,
    meals_per_day: input.mealsPerDay ?? 7,
    wake_time: input.wakeTime ?? "07:00",
    sleep_time: input.sleepTime ?? "22:00",
    timezone: tz,
    plan_start_date: today,
    onboarding_complete: true,
  });
  if (pErr) throw new Error(`profile: ${pErr.message}`);

  // 2) targets (mark previous not-current, insert fresh)
  await supabase
    .from("user_targets")
    .update({ is_current: false })
    .eq("user_id", user.id)
    .eq("is_current", true);
  const { error: tErr } = await supabase.from("user_targets").insert({
    user_id: user.id,
    calories: targets.calories,
    calories_min: targets.caloriesMin,
    calories_max: targets.caloriesMax,
    protein_g: targets.proteinG,
    fat_g: targets.fatG,
    carbs_g: targets.carbsG,
    water_l: targets.waterL,
    water_glasses: targets.waterGlasses,
    bmr: targets.bmr,
    tdee: targets.tdee,
    inputs: input,
    is_current: true,
  });
  if (tErr) throw new Error(`targets: ${tErr.message}`);

  // 3) baseline weight
  await supabase
    .from("weight_logs")
    .upsert({ user_id: user.id, log_date: today, kg: input.weightKg }, { onConflict: "user_id,log_date" });

  // 4) personalized 30-day plan
  const { data: templates } = await supabase
    .from("meal_templates")
    .select("id")
    .order("sort");
  const ids = (templates ?? []).map((t) => t.id);
  const plan = generatePlanDays(ids, 30);
  const rows = plan.map((p) => ({
    user_id: user.id,
    plan_date: addDays(today, p.dayIndex - 1),
    day_index: p.dayIndex,
    template_id: p.templateId,
  }));
  const { error: planErr } = await supabase
    .from("user_plan_days")
    .upsert(rows, { onConflict: "user_id,plan_date" });
  if (planErr) throw new Error(`plan: ${planErr.message}`);

  redirect("/today");
}
