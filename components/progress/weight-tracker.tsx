"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceArea,
  Tooltip,
} from "recharts";
import { Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logWeight, deleteWeight } from "@/actions/trackers";
import { useToast } from "@/components/toast/toaster";
import { useQueryClient } from "@tanstack/react-query";

export interface WeightPoint {
  date: string;
  kg: number;
}

export function WeightTracker({
  initial,
  targetMin,
  targetMax,
  today,
  startKg,
}: {
  initial: WeightPoint[];
  targetMin: number;
  targetMax: number;
  today: string;
  startKg: number;
}) {
  const [logs, setLogs] = React.useState<WeightPoint[]>(initial);
  const [kg, setKg] = React.useState("");
  const [date, setDate] = React.useState(today);
  const [mounted, setMounted] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const { toast } = useToast();
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["progress"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
  };
  React.useEffect(() => setMounted(true), []);

  const fp = JSON.stringify(initial);
  React.useEffect(() => {
    setLogs(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.length ? sorted[sorted.length - 1].kg : startKg;
  const gained = +(latest - startKg).toFixed(1);

  const chartData = sorted.map((p) => ({ ...p, label: p.date.slice(5) }));
  const ys = sorted.map((p) => p.kg).concat([targetMin, targetMax]);
  const yMin = Math.floor(Math.min(...ys) - 1);
  const yMax = Math.ceil(Math.max(...ys) + 1);

  function add() {
    const val = parseFloat(kg);
    if (!val || val <= 0) return;
    setLogs((l) => [...l.filter((e) => e.date !== date), { date, kg: val }]);
    setKg("");
    startTransition(async () => {
      try {
        const res = await logWeight({ date, kg: val });
        refresh();
        toast({ message: res.summary, undoEventId: res.eventId });
      } catch {}
    });
  }

  function remove(d: string) {
    setLogs((l) => l.filter((e) => e.date !== d));
    startTransition(async () => {
      try {
        const res = await deleteWeight({ date: d });
        refresh();
        toast({ message: res.summary, undoEventId: res.eventId });
      } catch {}
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow flex items-center gap-1">
              <TrendingUp className="size-3 text-fuel" /> Current weight
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-ink tnum">{latest} kg</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-muted">
              {gained >= 0 ? "+" : ""}
              {gained} kg since start
            </p>
            <p className="text-[12px] text-dim">
              target {targetMin}–{targetMax} kg
            </p>
          </div>
        </div>

        <div className="mt-3 h-[190px] w-full">
          {mounted && sorted.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <ReferenceArea y1={targetMin} y2={targetMax} fill="var(--fuel)" fillOpacity={0.12} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[yMin, yMax]} tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={34} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--ink)",
                  }}
                  labelStyle={{ color: "var(--muted)" }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="var(--fuel)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--fuel)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-[13px] text-dim">
              {sorted.length === 0 ? "Log your first weigh-in to see the trend" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
        <p className="eyebrow mb-2">Log a weigh-in</p>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 flex-1" />
          <Input
            type="number"
            step="0.1"
            placeholder="kg"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className="h-11 w-24"
          />
          <Button onClick={add} size="md">
            Add
          </Button>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="rounded-lg border border-line bg-surface p-2 shadow-card">
          {[...sorted].reverse().map((e) => (
            <div key={e.date} className="flex items-center gap-3 px-2 py-2 text-[14px]">
              <span className="font-mono text-[12px] text-dim">{e.date}</span>
              <span className="font-semibold text-ink tnum">{e.kg} kg</span>
              <button onClick={() => remove(e.date)} className="ml-auto text-dim hover:text-danger">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
