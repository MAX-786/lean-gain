"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Clock,
  XCircle,
  RotateCcw,
  Droplet,
  TrendingUp,
  Trash2,
  ShoppingCart,
  CalendarDays,
  User,
  Undo2,
} from "lucide-react";
import { useToast } from "@/components/toast/toaster";
import { undoEvent } from "@/actions/activity";
import { cn } from "@/lib/utils";

export interface ActivityEvent {
  id: string;
  kind: string;
  summary: string;
  created_at: string;
  undone: boolean;
  reversible: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  meal_done: <Check className="size-4 text-fuel" />,
  meal_snooze: <Clock className="size-4 text-amber" />,
  meal_missed: <XCircle className="size-4 text-amber" />,
  meal_reset: <RotateCcw className="size-4 text-muted" />,
  water_set: <Droplet className="size-4 text-amber" />,
  weight_log: <TrendingUp className="size-4 text-fuel" />,
  weight_delete: <Trash2 className="size-4 text-danger" />,
  grocery_toggle: <ShoppingCart className="size-4 text-muted" />,
  plan_shift: <CalendarDays className="size-4 text-strain" />,
  profile_update: <User className="size-4 text-strain" />,
};

function fmtWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const time = `${h}:${m} ${ap}`;
  return sameDay ? time : `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

export function ActivityList({ events }: { events: ActivityEvent[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function undo(id: string) {
    setBusy(id);
    const res = await undoEvent(id);
    qc.invalidateQueries();
    setBusy(null);
    if (res.ok) toast({ message: "Undone" });
  }

  if (events.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-line bg-surface p-6 text-center text-[14px] text-muted shadow-card">
        No activity yet. Actions you take — meals, water, weigh-ins — show up here so you can undo any of them.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div
          key={e.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card",
            e.undone && "opacity-55"
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2">
            {ICONS[e.kind] ?? <Check className="size-4 text-muted" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] text-ink">{e.summary}</p>
            <p className="text-[11px] text-dim">{fmtWhen(e.created_at)}</p>
          </div>
          {e.undone ? (
            <span className="text-[11px] text-dim">Undone</span>
          ) : e.reversible ? (
            <button
              onClick={() => undo(e.id)}
              disabled={busy === e.id}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-fuel disabled:opacity-50"
            >
              <Undo2 className="size-3.5" /> {busy === e.id ? "…" : "Undo"}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
