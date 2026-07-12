import { Dumbbell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/screen-header";
import { WeightTracker, type WeightPoint } from "@/components/progress/weight-tracker";
import { WaterChart } from "@/components/progress/water-chart";

export const dynamic = "force-dynamic";

function localDate(tz: string, offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, target_min_kg, target_max_kg")
    .eq("id", user.id)
    .maybeSingle();
  const tz = profile?.timezone ?? "Asia/Kolkata";
  const today = localDate(tz);

  const [{ data: weights }, { data: targets }, { data: waters }, { data: wdays }] = await Promise.all([
    supabase.from("weight_logs").select("log_date, kg").eq("user_id", user.id).order("log_date"),
    supabase.from("user_targets").select("water_glasses").eq("user_id", user.id).eq("is_current", true).maybeSingle(),
    supabase.from("water_logs").select("log_date, glasses").eq("user_id", user.id),
    supabase.from("workout_days").select("id, day_name, focus, workout_exercises(name, sets, reps, sort)").order("sort"),
  ]);

  const weightPoints: WeightPoint[] = (weights ?? []).map((w) => ({ date: w.log_date, kg: Number(w.kg) }));
  const startKg = weightPoints[0]?.kg ?? 57;
  const waterTarget = targets?.water_glasses ?? 12;

  // last 10 days water
  const waterMap = new Map((waters ?? []).map((w) => [w.log_date, w.glasses]));
  const waterData = Array.from({ length: 10 }, (_, i) => {
    const d = localDate(tz, -(9 - i));
    return { label: d.slice(5), glasses: waterMap.get(d) ?? 0 };
  });

  return (
    <>
      <ScreenHeader title="Progress" sub="Weight, water & training" />
      <main className="space-y-3 px-4 pb-32">
        <WeightTracker
          initial={weightPoints}
          targetMin={profile?.target_min_kg ?? 61}
          targetMax={profile?.target_max_kg ?? 63}
          today={today}
          startKg={startKg}
        />
        <WaterChart data={waterData} target={waterTarget} />

        <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
          <p className="eyebrow mb-3 flex items-center gap-1">
            <Dumbbell className="size-3 text-strain" /> Weekly training split
          </p>
          <div className="space-y-2.5">
            {(wdays ?? []).map((d) => {
              const ex = (d.workout_exercises ?? []).sort(
                (a: { sort: number }, b: { sort: number }) => a.sort - b.sort
              );
              return (
                <div key={d.id} className="rounded-md bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-ink">{d.day_name}</span>
                    <span className="rounded-full bg-strain/15 px-2 py-0.5 text-[11px] font-medium text-strain">
                      {d.focus}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {ex.map((e: { name: string; sets: string; reps: string }, i: number) => (
                      <li key={i} className="flex justify-between text-[12px] text-muted">
                        <span>{e.name}</span>
                        <span className="font-mono text-dim">
                          {e.sets !== "-" ? `${e.sets}×${e.reps}` : e.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
