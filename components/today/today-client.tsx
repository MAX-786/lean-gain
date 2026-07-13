"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Droplet, RotateCcw, Check, XCircle, AlertTriangle } from "lucide-react";
import { clamp } from "@/lib/utils";
import { FuelHeader } from "@/components/today/fuel-header";
import { StreakStrip } from "@/components/today/streak-strip";
import { SwipeCard, type FeedMeal } from "@/components/today/swipe-card";
import { SnoozeSheet } from "@/components/today/snooze-sheet";
import { useToast } from "@/components/toast/toaster";
import { markMealDone, markMealMissed, snoozeMeal, undoMeal, setWater, type ActionResult } from "@/actions/day";

export interface TodayMeal {
  id: string;
  time_label: string;
  meal_label: string;
  items: string;
  kcal: number;
  protein: number;
}

type Status = "pending" | "done" | "snoozed" | "skipped";
interface MealState {
  status: Status;
  snoozedUntil?: string;
}

export interface TodayData {
  date: string;
  targets: { calories: number; protein_g: number; water_glasses: number };
  meals: TodayMeal[];
  initialStatuses: Record<string, MealState>;
  initialWater: number;
  streak: number;
  week: boolean[];
  todayIndex: number;
}

function fmtClock(iso: string) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function parseTimeToday(label: string): number {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(label);
  const d = new Date();
  if (!m) return d.getTime();
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  d.setHours(h, min, 0, 0);
  return d.getTime();
}

function fmtDur(ms: number) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function TodayClient({ data }: { data: TodayData }) {
  const [states, setStates] = React.useState<Record<string, MealState>>(data.initialStatuses);
  const [water, setWaterState] = React.useState(data.initialWater);
  const [snoozeFor, setSnoozeFor] = React.useState<TodayMeal | null>(null);
  const [, startTransition] = React.useTransition();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Re-sync from the server whenever it reports a different state (e.g. after a
  // toaster-undo revalidates this route). Fingerprint keeps optimistic updates stable.
  const fp = JSON.stringify(data.initialStatuses) + "|" + data.initialWater;
  React.useEffect(() => {
    setStates(data.initialStatuses);
    setWaterState(data.initialWater);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const statusOf = (id: string): Status => states[id]?.status ?? "pending";

  const done = data.meals.filter((m) => statusOf(m.id) === "done");
  const missed = data.meals.filter((m) => statusOf(m.id) === "skipped");
  const active = data.meals.filter((m) => statusOf(m.id) === "pending" || statusOf(m.id) === "snoozed");

  function dueTime(m: TodayMeal): number {
    const st = states[m.id];
    if (st?.status === "snoozed" && st.snoozedUntil) {
      const t = new Date(st.snoozedUntil).getTime();
      if (t > now) return t;
    }
    return parseTimeToday(m.time_label);
  }

  const withDue = active.map((m) => ({ m, due: dueTime(m) })).sort((a, b) => a.due - b.due);
  const pastDue = withDue.filter((x) => x.due < now);
  const upcoming = withDue.filter((x) => x.due >= now);
  const upNextId = upcoming[0]?.m.id;

  const consumedKcal = done.reduce((a, m) => a + m.kcal, 0);
  const consumedProtein = done.reduce((a, m) => a + m.protein, 0);

  const calProg = clamp(consumedKcal / data.targets.calories, 0, 1);
  const protProg = clamp(consumedProtein / data.targets.protein_g, 0, 1);
  const waterProg = clamp(water / data.targets.water_glasses, 0, 1);
  const score = Math.round(100 * (0.4 * calProg + 0.35 * protProg + 0.25 * waterProg));

  const nextIn =
    upcoming.length > 0
      ? fmtDur(upcoming[0].due - now)
      : pastDue.length > 0
      ? "catch up"
      : "all set";

  function run(action: Promise<ActionResult>) {
    startTransition(async () => {
      try {
        const res = await action;
        // Background refresh so streak/rings + history stay accurate.
        qc.invalidateQueries({ queryKey: ["today"] });
        qc.invalidateQueries({ queryKey: ["activity"] });
        toast({ message: res.summary, undoEventId: res.eventId });
      } catch {}
    });
  }

  function handleDone(m: TodayMeal) {
    setStates((s) => ({ ...s, [m.id]: { status: "done" } }));
    run(markMealDone({ templateMealId: m.id, date: data.date, mealLabel: m.meal_label }));
  }
  function handleMissed(m: TodayMeal) {
    setStates((s) => ({ ...s, [m.id]: { status: "skipped" } }));
    run(markMealMissed({ templateMealId: m.id, date: data.date, mealLabel: m.meal_label }));
  }
  function handleUndo(m: TodayMeal) {
    setStates((s) => ({ ...s, [m.id]: { status: "pending" } }));
    run(undoMeal({ templateMealId: m.id, date: data.date, mealLabel: m.meal_label }));
  }
  function handleSnoozePick(minutes: number) {
    const m = snoozeFor;
    if (!m) return;
    const until = new Date(Date.now() + minutes * 60_000).toISOString();
    setStates((s) => ({ ...s, [m.id]: { status: "snoozed", snoozedUntil: until } }));
    run(snoozeMeal({ templateMealId: m.id, date: data.date, minutes, mealLabel: m.meal_label }));
  }
  function changeWater(delta: number) {
    const next = Math.max(0, water + delta);
    setWaterState(next);
    run(setWater({ date: data.date, glasses: next }));
  }

  function toFeed(m: TodayMeal, past: boolean): FeedMeal {
    const st = states[m.id];
    const due = dueTime(m);
    return {
      id: m.id,
      time_label: m.time_label,
      meal_label: m.meal_label,
      items: m.items,
      kcal: m.kcal,
      protein: m.protein,
      status: st?.status === "snoozed" ? "snoozed" : "pending",
      snoozedLabel: st?.snoozedUntil ? fmtClock(st.snoozedUntil) : undefined,
      whenLabel: past ? `${fmtDur(now - due)} ago` : due - now < 60000 ? "now" : `in ${fmtDur(due - now)}`,
    };
  }

  const card = (m: TodayMeal, past: boolean) => (
    <SwipeCard
      key={m.id}
      meal={toFeed(m, past)}
      upNext={m.id === upNextId}
      pastDue={past}
      onDone={() => handleDone(m)}
      onSnooze={() => setSnoozeFor(m)}
      onMissed={() => handleMissed(m)}
    />
  );

  return (
    <>
      <FuelHeader
        score={score}
        nextIn={nextIn}
        stats={[
          { label: "Cals", value: consumedKcal, max: data.targets.calories, unit: "kcal", color: "heat" },
          { label: "Protein", value: consumedProtein, max: data.targets.protein_g, unit: "g", color: "fuel" },
          { label: "Water", value: water, max: data.targets.water_glasses, unit: "gl", color: "amber" },
        ]}
      />

      <StreakStrip streak={data.streak} week={data.week} todayIndex={data.todayIndex} freezes={0} />

      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card">
        <Droplet className="size-5 text-amber" />
        <div className="text-[14px]">
          <span className="font-semibold text-ink">Water</span>
          <span className="ml-2 tnum text-muted">{water}/{data.targets.water_glasses} glasses</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => changeWater(-1)} className="grid size-9 place-items-center rounded-full border border-line bg-surface-2 text-ink">−</button>
          <button onClick={() => changeWater(1)} className="grid size-9 place-items-center rounded-full bg-amber text-[#1a0a04]">+</button>
        </div>
      </div>

      {done.length > 0 && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-[13px] shadow-card">
          <span className="font-medium text-fuel">✓ {done.length} done</span>
          <span className="ml-2 text-dim tnum">{consumedKcal} kcal · {consumedProtein}g protein</span>
        </div>
      )}

      {/* Backlog / catch-up */}
      {pastDue.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber">
            <AlertTriangle className="size-3" /> Earlier today · catch up
          </p>
          <div className="space-y-3">{pastDue.map((x) => card(x.m, true))}</div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className={pastDue.length > 0 ? "pt-1" : ""}>
          <p className="eyebrow mb-2 px-1">Up next</p>
          <div className="space-y-3">{upcoming.map((x) => card(x.m, false))}</div>
        </div>
      )}

      {active.length === 0 && (
        <div className="rounded-lg border border-line bg-surface p-6 text-center shadow-card">
          <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-fuel/12 text-fuel">
            <Check className="size-6" strokeWidth={2.5} />
          </div>
          <p className="font-display text-lg font-semibold text-ink">All done for today 🎉</p>
          <p className="mt-1 text-[13px] text-muted">{consumedKcal} kcal · {consumedProtein}g protein logged. Nice work.</p>
        </div>
      )}

      {/* Missed */}
      {missed.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Missed</p>
          {missed.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 shadow-card">
              <XCircle className="size-4 text-amber" />
              <span className="text-[13px] text-muted line-through">{m.meal_label}</span>
              <button onClick={() => handleUndo(m)} className="ml-auto inline-flex items-center gap-1 text-[12px] text-dim hover:text-ink">
                <RotateCcw className="size-3" /> Undo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div className="space-y-2 pt-1">
          {done.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 opacity-70 shadow-card">
              <Check className="size-4 text-fuel" strokeWidth={2.5} />
              <span className="text-[13px] text-ink">{m.meal_label}</span>
              <span className="text-[12px] text-dim">{m.kcal} kcal</span>
              <button onClick={() => handleUndo(m)} className="ml-auto inline-flex items-center gap-1 text-[12px] text-dim hover:text-ink">
                <RotateCcw className="size-3" /> Undo
              </button>
            </div>
          ))}
        </div>
      )}

      <SnoozeSheet
        open={snoozeFor !== null}
        onOpenChange={(v) => !v && setSnoozeFor(null)}
        mealLabel={snoozeFor?.meal_label}
        onPick={handleSnoozePick}
      />
    </>
  );
}
