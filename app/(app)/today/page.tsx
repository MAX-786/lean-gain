"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchToday, qk, deviceToday } from "@/lib/queries";
import { TodayClient } from "@/components/today/today-client";
import { ScreenSkeleton } from "@/components/screen-skeleton";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function TodayPage() {
  const date = deviceToday();
  const { data } = useQuery({ queryKey: qk.today(date), queryFn: () => fetchToday(date) });

  return (
    <>
      <header className="safe-top sticky top-0 z-30 bg-canvas/85 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[13px] text-muted">
              {greeting()}
              {data?.name ? `, ${data.name}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">Today</h1>
              {data?.dayIndex != null && (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                  Day {data.dayIndex}
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
        {!data ? (
          <ScreenSkeleton />
        ) : !data.hasPlan ? (
          <Link
            href="/onboarding"
            className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-fuel/30 bg-surface p-4 text-[14px] text-ink shadow-glow"
          >
            <span>No plan yet — finish onboarding to generate it.</span>
            <span className="text-fuel">→</span>
          </Link>
        ) : (
          <TodayClient
            data={{
              date: data.date,
              targets: data.targets,
              meals: data.meals,
              initialStatuses: data.statuses,
              initialWater: data.water,
              streak: data.streak,
              week: data.week,
              todayIndex: 6,
            }}
          />
        )}
      </main>
    </>
  );
}
