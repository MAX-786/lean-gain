"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, RotateCcw } from "lucide-react";
import { useToast } from "@/components/toast/toaster";
import { setCurrentDay, restartPlan } from "@/actions/plan";
import { Button } from "@/components/ui/button";

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PlanControls({ currentDay }: { currentDay: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [day, setDay] = React.useState(currentDay);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setDay(currentDay), [currentDay]);

  function refreshPlan() {
    qc.invalidateQueries({ queryKey: ["plan"] });
    qc.invalidateQueries({ queryKey: ["today"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
  }

  async function apply(n: number) {
    setBusy(true);
    const res = await setCurrentDay(n, localToday());
    refreshPlan();
    setBusy(false);
    toast({ message: res.summary, undoEventId: res.eventId });
  }

  async function restart() {
    setBusy(true);
    const res = await restartPlan(localToday());
    refreshPlan();
    setBusy(false);
    toast({ message: res.summary, undoEventId: res.eventId });
  }

  return (
    <div className="mb-1 rounded-lg border border-line bg-surface p-4 shadow-card">
      <p className="eyebrow mb-2 flex items-center gap-1">
        <CalendarClock className="size-3 text-strain" /> Which day are you on?
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDay((d) => Math.max(1, d - 1))}
          className="grid size-10 place-items-center rounded-md border border-line bg-surface-2 text-ink"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <span className="tnum font-display text-2xl font-bold text-ink">Day {day}</span>
        </div>
        <button
          onClick={() => setDay((d) => Math.min(30, d + 1))}
          className="grid size-10 place-items-center rounded-md border border-line bg-surface-2 text-ink"
        >
          +
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="md" className="flex-1" disabled={busy || day === currentDay} onClick={() => apply(day)}>
          Set to Day {day}
        </Button>
        <Button variant="surface" size="md" disabled={busy} onClick={restart}>
          <RotateCcw className="size-4" /> Restart
        </Button>
      </div>
      <p className="mt-2 text-[12px] text-dim">Shifts your plan so today becomes the chosen day. Reversible from History.</p>
    </div>
  );
}
