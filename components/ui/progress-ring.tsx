"use client";

import * as React from "react";
import { clamp } from "@/lib/utils";

type RingColor = "fuel" | "heat" | "strain" | "amber";

const STROKE: Record<RingColor, string> = {
  fuel: "var(--fuel)",
  heat: "var(--heat)",
  strain: "var(--strain)",
  amber: "var(--amber)",
};

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  stroke = 8,
  color = "fuel",
  trackColor = "var(--ring-track)",
  rounded = true,
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: RingColor;
  trackColor?: string;
  rounded?: boolean;
  children?: React.ReactNode;
}) {
  const pct = clamp(max === 0 ? 0 : value / max, 0, 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={STROKE[color]}
          strokeWidth={stroke}
          strokeLinecap={rounded ? "round" : "butt"}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      {children != null && (
        <div className="absolute inset-0 grid place-items-center">{children}</div>
      )}
    </div>
  );
}
