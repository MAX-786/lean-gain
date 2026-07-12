"use client";

import * as React from "react";
import { Flame, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreakStrip({
  streak,
  week,
  todayIndex,
  freezes = 1,
}: {
  streak: number;
  week: boolean[];
  todayIndex: number;
  freezes?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card">
      <div className="flex items-center gap-1.5">
        <Flame className="size-5 text-amber" strokeWidth={2} fill="currentColor" />
        <span className="tnum font-display text-xl font-bold text-ink">{streak}</span>
        <span className="text-[11px] leading-tight text-dim">
          day
          <br />
          streak
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {week.map((filled, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[10px] font-semibold transition-colors",
                filled
                  ? "bg-fuel text-[#04120c]"
                  : "bg-surface-2 text-dim",
                i === todayIndex &&
                  "ring-2 ring-fuel ring-offset-2 ring-offset-surface shadow-[0_0_10px_rgba(0,229,160,0.6)]"
              )}
            >
              {DAYS[i]}
            </span>
          </div>
        ))}
      </div>

      {freezes > 0 && (
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-strain/15 px-2 py-1 text-[11px] font-medium text-strain">
          <Snowflake className="size-3" /> {freezes}
        </span>
      )}
    </div>
  );
}
