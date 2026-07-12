"use client";

import * as React from "react";
import { Flame, Timer } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";

export interface FuelStat {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: "fuel" | "heat" | "amber";
}

export function FuelHeader({
  score,
  stats,
  nextIn,
}: {
  score: number;
  stats: FuelStat[];
  nextIn: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div>
          <div className="eyebrow flex items-center gap-1">
            <Flame className="size-3 text-heat" strokeWidth={2.5} /> Fuel score
          </div>
          <div className="mt-1 flex items-end gap-1">
            <span className="font-display text-[44px] font-bold leading-none text-ink">
              {score}
            </span>
            <span className="mb-1 text-sm text-dim">/100</span>
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-amber">
            <Timer className="size-3" /> next fuel in {nextIn}
          </div>
        </div>

        <div className="ml-auto flex gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <ProgressRing value={s.value} max={s.max} size={58} stroke={6} color={s.color}>
                <div className="text-center">
                  <div className="tnum font-display text-[13px] font-semibold text-ink">
                    {Math.round((s.value / s.max) * 100)}
                  </div>
                </div>
              </ProgressRing>
              <span className="eyebrow">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
