"use client";

import { Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgress, qk } from "@/lib/queries";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenSkeleton } from "@/components/screen-skeleton";
import { WeightTracker } from "@/components/progress/weight-tracker";
import { WaterChart } from "@/components/progress/water-chart";

export default function ProgressPage() {
  const { data } = useQuery({ queryKey: qk.progress, queryFn: fetchProgress });

  return (
    <>
      <ScreenHeader title="Progress" sub="Weight, water & training" />
      {!data ? (
        <ScreenSkeleton />
      ) : (
        <main className="space-y-3 px-4 pb-32">
          <WeightTracker
            initial={data.weights}
            targetMin={data.targetMin}
            targetMax={data.targetMax}
            today={data.today}
            startKg={data.startKg}
          />
          <WaterChart data={data.waterData} target={data.waterTarget} />

          <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <p className="eyebrow mb-3 flex items-center gap-1">
              <Dumbbell className="size-3 text-strain" /> Weekly training split
            </p>
            <div className="space-y-2.5">
              {data.workoutDays.map((d) => (
                <div key={d.id} className="rounded-md bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-ink">{d.day_name}</span>
                    <span className="rounded-full bg-strain/15 px-2 py-0.5 text-[11px] font-medium text-strain">
                      {d.focus}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {d.exercises.map((e, i) => (
                      <li key={i} className="flex justify-between text-[12px] text-muted">
                        <span>{e.name}</span>
                        <span className="font-mono text-dim">
                          {e.sets !== "-" ? `${e.sets}×${e.reps}` : e.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </>
  );
}
