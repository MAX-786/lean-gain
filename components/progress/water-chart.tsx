"use client";

import * as React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from "recharts";
import { Droplet } from "lucide-react";

export function WaterChart({
  data,
  target,
}: {
  data: { label: string; glasses: number }[];
  target: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <p className="eyebrow mb-1 flex items-center gap-1">
        <Droplet className="size-3 text-amber" /> Water · last {data.length} days
      </p>
      <p className="mb-2 text-[12px] text-dim">Target {target} glasses/day</p>
      <div className="h-[160px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
              <ReferenceLine y={target} stroke="var(--amber)" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--dim)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={28} />
              <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.glasses >= target ? "var(--fuel)" : "var(--amber)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
