"use client";

import * as React from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, to } from "@react-spring/web";
import { Check, Clock, Dumbbell, Flame, Zap, XCircle } from "lucide-react";
import { cn, clamp } from "@/lib/utils";

export interface FeedMeal {
  id: string;
  time_label: string;
  meal_label: string;
  items: string;
  kcal: number;
  protein: number;
  status: "pending" | "snoozed";
  snoozedLabel?: string;
  whenLabel?: string;
  workout?: boolean;
}

const THRESH = 108;

export function SwipeCard({
  meal,
  upNext = false,
  pastDue = false,
  onDone,
  onSnooze,
  onMissed,
}: {
  meal: FeedMeal;
  upNext?: boolean;
  pastDue?: boolean;
  onDone: () => void;
  onSnooze: () => void;
  onMissed: () => void;
}) {
  const [{ x, rot, scale }, api] = useSpring(() => ({ x: 0, rot: 0, scale: 1 }));
  const accent = meal.workout ? "bg-strain" : meal.protein >= 20 ? "bg-fuel" : "bg-heat";

  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (last) {
        const flungRight = mx > THRESH || (vx > 0.4 && dx > 0 && mx > 24);
        const flungLeft = mx < -THRESH || (vx > 0.4 && dx < 0 && mx < -24);
        if (flungRight) {
          navigator.vibrate?.(15);
          api.start({ x: 540, rot: 14, scale: 1, config: { tension: 240, friction: 28 }, onRest: () => onDone() });
        } else if (flungLeft) {
          navigator.vibrate?.(10);
          api.start({ x: 0, rot: 0, scale: 1, config: { tension: 260, friction: 24 } });
          onSnooze();
        } else {
          api.start({ x: 0, rot: 0, scale: 1, config: { tension: 300, friction: 26 } });
        }
      } else {
        api.start({ x: mx, rot: clamp(mx / 18, -8, 8), scale: 1.02, immediate: true });
      }
    },
    { axis: "x", filterTaps: true }
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-lg px-6">
        <animated.span
          style={{ opacity: x.to((v) => (v > 0 ? clamp(v / THRESH, 0, 1) : 0)) }}
          className="flex items-center gap-1.5 font-semibold text-fuel"
        >
          <Check className="size-5" strokeWidth={3} /> Done
        </animated.span>
        <animated.span
          style={{ opacity: x.to((v) => (v < 0 ? clamp(-v / THRESH, 0, 1) : 0)) }}
          className="ml-auto flex items-center gap-1.5 font-semibold text-amber"
        >
          Snooze <Clock className="size-5" />
        </animated.span>
      </div>

      <animated.div
        {...bind()}
        style={{
          transform: to([x, rot, scale], (px, r, s) => `translate3d(${px}px,0,0) rotate(${r}deg) scale(${s})`),
          touchAction: "pan-y",
        }}
        className={cn(
          "relative flex touch-pan-y select-none overflow-hidden rounded-lg border bg-surface shadow-card",
          upNext ? "border-fuel/30 shadow-glow" : pastDue ? "border-amber/40" : "border-line"
        )}
      >
        <animated.div
          style={{ opacity: x.to((v) => (v > 0 ? clamp(v / THRESH, 0, 1) * 0.16 : 0)) }}
          className="pointer-events-none absolute inset-0 z-10 bg-fuel"
        />
        <animated.div
          style={{ opacity: x.to((v) => (v < 0 ? clamp(-v / THRESH, 0, 1) * 0.16 : 0)) }}
          className="pointer-events-none absolute inset-0 z-10 bg-amber"
        />

        <div className={cn("w-1.5 shrink-0", accent)} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink">{meal.time_label}</span>
            {meal.whenLabel && (
              <span
                className={cn(
                  "font-mono text-[11px]",
                  upNext ? "text-fuel" : pastDue ? "text-amber" : "text-dim"
                )}
              >
                {meal.whenLabel}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1.5">
              {meal.status === "snoozed" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-1 text-[11px] font-semibold text-amber">
                  <Clock className="size-3" /> {meal.snoozedLabel ?? "Snoozed"}
                </span>
              )}
              {upNext && (
                <span className="rounded-full bg-fuel/12 px-2 py-1 text-[11px] font-semibold text-fuel">Up next</span>
              )}
              {pastDue && meal.status !== "snoozed" && (
                <span className="rounded-full bg-amber/15 px-2 py-1 text-[11px] font-semibold text-amber">Past due</span>
              )}
            </span>
          </div>
          <h3 className="mt-2 flex items-center gap-2 font-display text-[22px] font-semibold leading-tight text-ink">
            {meal.workout && <Dumbbell className="size-5 text-strain" strokeWidth={1.75} />}
            {meal.meal_label}
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-muted">{meal.items}</p>
          <div className="mt-3 flex items-center gap-4 text-[13px]">
            <span className="inline-flex items-center gap-1 text-heat">
              <Flame className="size-3.5" /> <span className="tnum font-semibold">{meal.kcal}</span>{" "}
              <span className="text-dim">kcal</span>
            </span>
            {meal.protein > 0 && (
              <span className="inline-flex items-center gap-1 text-fuel">
                <Zap className="size-3.5" /> <span className="tnum font-semibold">{meal.protein}g</span>
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5">
            <span className="text-[11px] text-dim">← snooze · done →</span>
            <div className="ml-auto flex gap-2">
              {pastDue && (
                <button
                  onClick={onMissed}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-medium text-muted"
                >
                  <XCircle className="size-3.5" /> Missed
                </button>
              )}
              <button
                onClick={onSnooze}
                className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-medium text-muted"
              >
                Snooze
              </button>
              <button
                onClick={() => {
                  navigator.vibrate?.(15);
                  api.start({ x: 540, rot: 14, config: { tension: 240, friction: 28 }, onRest: () => onDone() });
                }}
                className="inline-flex items-center gap-1 rounded-full bg-fuel px-3.5 py-1.5 text-[12px] font-semibold text-[#04120c]"
              >
                <Check className="size-3.5" strokeWidth={2.5} /> Done
              </button>
            </div>
          </div>
        </div>
      </animated.div>
    </div>
  );
}
