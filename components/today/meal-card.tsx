"use client";

import * as React from "react";
import { Check, Clock, Dumbbell, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type MacroColor = "fuel" | "heat" | "strain";
export type CardStatus = "done" | "pending" | "upnext" | "snoozed";

const ACCENT: Record<MacroColor, string> = {
  fuel: "bg-fuel",
  heat: "bg-heat",
  strain: "bg-strain",
};

export interface MealCardData {
  time: string;
  countdown?: string;
  label: string;
  items: string;
  chips?: string[];
  kcal: number;
  protein: number;
  accent: MacroColor;
  status: CardStatus;
  reminder?: string;
  workout?: boolean;
}

export function MealCard({ data }: { data: MealCardData }) {
  const { status, accent } = data;
  const done = status === "done";
  const upnext = status === "upnext";

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-lg border bg-surface transition-all",
        upnext ? "border-fuel/30 shadow-glow" : "border-line shadow-card",
        done && "opacity-55"
      )}
      style={upnext ? { transform: "scale(1.015)" } : undefined}
    >
      {/* macro-coded left glow bar */}
      <div className={cn("w-1.5 shrink-0", ACCENT[accent], done && "opacity-40")} />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink">
            {data.time}
          </span>
          {data.countdown && !done && (
            <span className="font-mono text-[11px] text-muted">· {data.countdown}</span>
          )}
          <span className="ml-auto">
            <StatusPill status={status} reminder={data.reminder} />
          </span>
        </div>

        <h3 className="mt-2 flex items-center gap-2 font-display text-[22px] font-semibold leading-tight text-ink">
          {data.workout && <Dumbbell className="size-5 text-strain" strokeWidth={1.75} />}
          {data.label}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-muted">{data.items}</p>

        {data.chips && data.chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.chips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-[13px]">
          <span className="inline-flex items-center gap-1 text-heat">
            <Flame className="size-3.5" strokeWidth={2} />
            <span className="tnum font-semibold">{data.kcal}</span>
            <span className="text-dim">kcal</span>
          </span>
          <span className="inline-flex items-center gap-1 text-fuel">
            <Zap className="size-3.5" strokeWidth={2} />
            <span className="tnum font-semibold">{data.protein}g</span>
            <span className="text-dim">protein</span>
          </span>
        </div>

        {upnext && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px] text-dim">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> swipe left to snooze
            </span>
            <span className="inline-flex items-center gap-1">
              swipe right — done <Check className="size-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, reminder }: { status: CardStatus; reminder?: string }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-fuel/12 px-2 py-1 text-[11px] font-semibold text-fuel">
        <Check className="size-3" strokeWidth={3} /> Done
      </span>
    );
  if (status === "snoozed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-1 text-[11px] font-semibold text-amber">
        <Clock className="size-3" /> {reminder ?? "Snoozed"}
      </span>
    );
  if (status === "upnext")
    return (
      <span className="rounded-full bg-fuel/12 px-2 py-1 text-[11px] font-semibold text-fuel">
        Up next
      </span>
    );
  return (
    <span className="rounded-full bg-surface-2 px-2 py-1 text-[11px] font-medium text-dim">
      Pending
    </span>
  );
}
