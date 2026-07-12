"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanMeal {
  time_label: string;
  meal_label: string;
  items: string;
  kcal: number;
  protein: number;
}
export interface PlanDay {
  day_index: number;
  plan_date: string;
  template_id: string;
  isToday: boolean;
}

export function PlanClient({
  days,
  mealsByTemplate,
  totals,
}: {
  days: PlanDay[];
  mealsByTemplate: Record<string, PlanMeal[]>;
  totals: Record<string, { kcal: number; protein: number }>;
}) {
  const [openDay, setOpenDay] = React.useState<number | null>(
    days.find((d) => d.isToday)?.day_index ?? null
  );

  const weeks: PlanDay[][] = [];
  days.forEach((d) => {
    const wi = Math.floor((d.day_index - 1) / 7);
    (weeks[wi] ??= []).push(d);
  });

  return (
    <div className="px-4 pb-32">
      {weeks.map((week, wi) => (
        <div key={wi} className="mt-4 first:mt-2">
          <p className="eyebrow mb-2 px-1">Week {wi + 1}</p>
          <div className="space-y-2">
            {week.map((d) => {
              const t = totals[d.template_id] ?? { kcal: 0, protein: 0 };
              const meals = mealsByTemplate[d.template_id] ?? [];
              const isOpen = openDay === d.day_index;
              return (
                <div
                  key={d.day_index}
                  className={cn(
                    "overflow-hidden rounded-lg border bg-surface shadow-card transition-colors",
                    d.isToday ? "border-fuel/40" : "border-line"
                  )}
                >
                  <button
                    onClick={() => setOpenDay(isOpen ? null : d.day_index)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                        Day {d.day_index}
                        {d.isToday && (
                          <span className="rounded-full bg-fuel/12 px-2 py-0.5 text-[10px] font-semibold text-fuel">
                            Today
                          </span>
                        )}
                      </span>
                      <span className="text-[12px] text-dim tnum">
                        {t.kcal} kcal · {t.protein}g protein · {meals.length} meals
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "ml-auto size-5 text-dim transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line px-4 py-3">
                      <div className="space-y-3">
                        {meals.map((m, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] text-dim">
                              {m.time_label}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-semibold text-ink">{m.meal_label}</div>
                              <div className="text-[12px] text-muted">{m.items}</div>
                              <div className="mt-0.5 text-[11px] text-dim tnum">
                                {m.kcal} kcal · {m.protein}g protein
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
