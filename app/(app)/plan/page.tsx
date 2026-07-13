"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPlan, qk } from "@/lib/queries";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenSkeleton } from "@/components/screen-skeleton";
import { PlanClient } from "@/components/plan/plan-client";
import { PlanControls } from "@/components/plan/plan-controls";

export default function PlanPage() {
  const { data } = useQuery({ queryKey: qk.plan, queryFn: fetchPlan });

  return (
    <>
      <ScreenHeader title="Plan" sub="Your rotating 30-day plan" />
      {!data ? (
        <ScreenSkeleton />
      ) : data.days.length === 0 ? (
        <main className="px-4">
          <p className="mt-4 text-[14px] text-muted">No plan yet — finish onboarding to generate it.</p>
        </main>
      ) : (
        <main className="pb-32">
          <div className="px-4 pt-2">
            <PlanControls currentDay={data.currentDay} />
          </div>
          <PlanClient days={data.days} mealsByTemplate={data.mealsByTemplate} totals={data.totals} />
        </main>
      )}
    </>
  );
}
