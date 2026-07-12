import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/screen-header";
import { PlanClient, type PlanDay, type PlanMeal } from "@/components/plan/plan-client";
import { PlanControls } from "@/components/plan/plan-controls";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const tz = profile?.timezone ?? "Asia/Kolkata";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

  const [{ data: planDays }, { data: templates }, { data: tmeals }] = await Promise.all([
    supabase
      .from("user_plan_days")
      .select("day_index, plan_date, template_id")
      .eq("user_id", user.id)
      .order("day_index"),
    supabase.from("meal_templates").select("id, total_kcal, total_protein"),
    supabase
      .from("template_meals")
      .select("template_id, slot, time_label, meal_label, items, kcal, protein")
      .order("slot"),
  ]);

  const totals: Record<string, { kcal: number; protein: number }> = {};
  for (const t of templates ?? [])
    totals[t.id] = { kcal: t.total_kcal, protein: t.total_protein };

  const mealsByTemplate: Record<string, PlanMeal[]> = {};
  for (const m of tmeals ?? []) {
    (mealsByTemplate[m.template_id] ??= []).push({
      time_label: m.time_label,
      meal_label: m.meal_label,
      items: m.items,
      kcal: m.kcal,
      protein: m.protein,
    });
  }

  const days: PlanDay[] = (planDays ?? []).map((d) => ({
    day_index: d.day_index,
    plan_date: d.plan_date,
    template_id: d.template_id,
    isToday: d.plan_date === today,
  }));

  const currentDay = days.find((d) => d.isToday)?.day_index ?? 1;

  return (
    <>
      <ScreenHeader title="Plan" sub="Your rotating 30-day plan" />
      {days.length === 0 ? (
        <main className="px-4">
          <p className="mt-4 text-[14px] text-muted">No plan yet — finish onboarding to generate it.</p>
        </main>
      ) : (
        <main className="pb-32">
          <div className="px-4 pt-2">
            <PlanControls currentDay={currentDay} />
          </div>
          <PlanClient days={days} mealsByTemplate={mealsByTemplate} totals={totals} />
        </main>
      )}
    </>
  );
}
