import Link from "next/link";
import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TodayClient, type TodayData, type TodayMeal } from "@/components/today/today-client";

export const dynamic = "force-dynamic";

function localDate(tz: string, offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}
function greeting(tz: string) {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date())
  );
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, timezone")
    .eq("id", user.id)
    .maybeSingle();

  const tz = profile?.timezone ?? "Asia/Kolkata";
  const today = localDate(tz);

  const [{ data: targets }, { data: planDay }, { data: water }] = await Promise.all([
    supabase.from("user_targets").select("*").eq("user_id", user.id).eq("is_current", true).maybeSingle(),
    supabase.from("user_plan_days").select("day_index, template_id").eq("user_id", user.id).eq("plan_date", today).maybeSingle(),
    supabase.from("water_logs").select("glasses").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
  ]);

  let meals: TodayMeal[] = [];
  if (planDay) {
    const { data } = await supabase
      .from("template_meals")
      .select("id, slot, time_label, meal_label, items, kcal, protein")
      .eq("template_id", planDay.template_id)
      .order("slot");
    meals = (data ?? []) as TodayMeal[];
  }

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("template_meal_id, status, snoozed_until")
    .eq("user_id", user.id)
    .eq("log_date", today);

  // streak: days (ending today/yesterday) with >=1 completed meal
  const { data: recentDone } = await supabase
    .from("meal_logs")
    .select("log_date")
    .eq("user_id", user.id)
    .eq("status", "done")
    .gte("log_date", localDate(tz, -30));
  const doneDates = new Set((recentDone ?? []).map((r) => r.log_date));
  const week = Array.from({ length: 7 }, (_, i) => doneDates.has(localDate(tz, -(6 - i))));
  let streak = 0;
  for (let i = doneDates.has(today) ? 0 : 1; i < 60; i++) {
    if (doneDates.has(localDate(tz, -i))) streak++;
    else break;
  }

  const initialStatuses: TodayData["initialStatuses"] = {};
  for (const l of logs ?? []) {
    initialStatuses[l.template_meal_id] = {
      status: (l.status as "pending" | "done" | "snoozed") ?? "pending",
      snoozedUntil: l.snoozed_until ?? undefined,
    };
  }

  const todayData: TodayData = {
    date: today,
    targets: {
      calories: targets?.calories ?? 2900,
      protein_g: targets?.protein_g ?? 120,
      water_glasses: targets?.water_glasses ?? 12,
    },
    meals,
    initialStatuses,
    initialWater: water?.glasses ?? 0,
    streak,
    week,
    todayIndex: 6,
  };

  return (
    <>
      <header className="safe-top sticky top-0 z-30 bg-canvas/85 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[13px] text-muted">
              {greeting(tz)}
              {profile?.name ? `, ${profile.name}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">Today</h1>
              {planDay && (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                  Day {planDay.day_index}
                </span>
              )}
            </div>
          </div>
          <Link
            href="/activity"
            className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-surface text-muted hover:text-ink"
            title="History & undo"
          >
            <History className="size-4" />
          </Link>
        </div>
      </header>

      <main className="space-y-3 px-4 pb-32">
        {!planDay ? (
          <div className="mt-2 rounded-lg border border-line bg-surface p-4 text-[14px] text-muted shadow-card">
            No plan for today yet. Re-run onboarding from your profile to generate it.
          </div>
        ) : (
          <TodayClient data={todayData} />
        )}
      </main>
    </>
  );
}
