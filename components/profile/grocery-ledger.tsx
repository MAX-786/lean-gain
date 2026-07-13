"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleGrocery } from "@/actions/trackers";

export interface GroceryItem {
  key: string; // `${category}:${item}`
  item: string;
  qty: string;
  price: number;
}
export interface GroceryCategory {
  name: string;
  items: GroceryItem[];
}
export interface GroceryWeek {
  week: number;
  categories: GroceryCategory[];
}

export function GroceryLedger({
  weeks,
  initialChecks,
}: {
  weeks: GroceryWeek[];
  initialChecks: Record<string, boolean>; // `${week}::${key}`
}) {
  const [active, setActive] = React.useState(weeks[0]?.week ?? 1);
  const [checks, setChecks] = React.useState(initialChecks);
  const [, startTransition] = React.useTransition();
  const qc = useQueryClient();

  const fp = JSON.stringify(initialChecks);
  React.useEffect(() => {
    setChecks(initialChecks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  const wk = weeks.find((w) => w.week === active);
  const total = wk?.categories.reduce((a, c) => a + c.items.reduce((s, it) => s + it.price, 0), 0) ?? 0;

  function toggle(week: number, item: GroceryItem) {
    const ck = `${week}::${item.key}`;
    const next = !checks[ck];
    setChecks((c) => ({ ...c, [ck]: next }));
    startTransition(async () => {
      try {
        await toggleGrocery({ week, itemKey: item.key, checked: next, itemName: item.item });
        qc.invalidateQueries({ queryKey: ["activity"] });
      } catch {}
    });
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Grocery list</p>
        <span className="tnum text-[13px] font-semibold text-ink">₹{total}</span>
      </div>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
        {weeks.map((w) => (
          <button
            key={w.week}
            onClick={() => setActive(w.week)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium",
              w.week === active ? "border-fuel/50 bg-fuel/12 text-fuel" : "border-line bg-surface-2 text-muted"
            )}
          >
            Week {w.week}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {wk?.categories.map((cat) => (
          <div key={cat.name}>
            <p className="mb-1.5 text-[12px] font-semibold text-muted">{cat.name}</p>
            <div className="space-y-1">
              {cat.items.map((it) => {
                const checked = !!checks[`${active}::${it.key}`];
                return (
                  <button
                    key={it.key}
                    onClick={() => toggle(active, it)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border",
                        checked ? "border-fuel bg-fuel text-[#04120c]" : "border-line-strong"
                      )}
                    >
                      {checked && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className={cn("text-[14px]", checked ? "text-dim line-through" : "text-ink")}>
                      {it.item}
                    </span>
                    <span className="ml-auto text-[12px] text-dim">{it.qty}</span>
                    <span className="w-12 text-right text-[12px] text-muted tnum">₹{it.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
