"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { Clock, Moon, Sun, Timer } from "lucide-react";

export interface SnoozeOption {
  label: string;
  minutes: number;
  icon: React.ReactNode;
}

/** Minutes from now until the next 6:00 PM in the user's local time. */
function minutesUntilEvening(): number {
  const now = new Date();
  const evening = new Date(now);
  evening.setHours(18, 0, 0, 0);
  if (evening <= now) evening.setDate(evening.getDate() + 1);
  return Math.round((evening.getTime() - now.getTime()) / 60000);
}

export function SnoozeSheet({
  open,
  onOpenChange,
  mealLabel,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mealLabel?: string;
  onPick: (minutes: number) => void;
}) {
  const options: SnoozeOption[] = [
    { label: "In 1 hour", minutes: 60, icon: <Timer className="size-5" /> },
    { label: "In 2 hours", minutes: 120, icon: <Clock className="size-5" /> },
    { label: "This evening", minutes: minutesUntilEvening(), icon: <Sun className="size-5" /> },
    { label: "Before bed", minutes: -1, icon: <Moon className="size-5" /> },
  ];

  function pick(o: SnoozeOption) {
    const mins = o.minutes === -1 ? minutesUntilBed() : o.minutes;
    onPick(mins);
    onOpenChange(false);
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[440px] flex-col rounded-t-[28px] border-t border-line bg-surface p-4 pb-8 shadow-sheet outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-surface-3" />
          <Drawer.Title className="font-display text-lg font-semibold text-ink">
            Remind me{mealLabel ? ` about ${mealLabel}` : ""}
          </Drawer.Title>
          <Drawer.Description className="mb-4 text-[13px] text-muted">
            No stress — we&apos;ll nudge you to catch it later.
          </Drawer.Description>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button
                key={o.label}
                onClick={() => pick(o)}
                className="flex flex-col items-start gap-2 rounded-md border border-line bg-surface-2 p-4 text-left transition-colors hover:border-amber/50"
              >
                <span className="text-amber">{o.icon}</span>
                <span className="text-[14px] font-semibold text-ink">{o.label}</span>
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function minutesUntilBed(): number {
  const now = new Date();
  const bed = new Date(now);
  bed.setHours(22, 0, 0, 0);
  if (bed <= now) bed.setDate(bed.getDate() + 1);
  return Math.round((bed.getTime() - now.getTime()) / 60000);
}
