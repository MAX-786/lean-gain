/* ============================================================
   Lean Gain — calculation engine (pure, isomorphic, unit-tested)
   Mifflin-St Jeor BMR → TDEE → lean-gain surplus → macros →
   water → distribute into small meals. No I/O, no framework.
   ============================================================ */

import { clamp } from "@/lib/utils";

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lean_gain" | "maintain" | "recomp";

export interface StatsInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  trainingDays?: number;
  appetite?: "small" | "medium" | "large";
  mealsPerDay?: number;
  wakeTime?: string; // "07:00"
  sleepTime?: string; // "22:00"
  fastMetabolism?: boolean;
}

export interface MealSlot {
  index: number;
  label: string;
  timeLabel: string; // "9:30 AM"
  fraction: number;
  kcal: number;
  protein: number;
}

export interface Targets {
  bmr: number;
  tdee: number;
  calories: number;
  caloriesMin: number;
  caloriesMax: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterL: number;
  waterGlasses: number;
  mealsPerDay: number;
  mealSlots: MealSlot[];
}

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmr(sex: Sex, age: number, heightCm: number, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (sex === "male" ? 5 : -161));
}

/** Total daily energy expenditure. Optional +5% NEAT for a fast metabolism. */
export function tdee(bmrValue: number, activity: Activity, fastMetabolism = false): number {
  const t = bmrValue * ACTIVITY_FACTOR[activity] * (fastMetabolism ? 1.05 : 1);
  return Math.round(t);
}

/** Calorie target from goal. Lean gain adds a conservative surplus capped at 15% of TDEE. */
export function calorieTarget(tdeeValue: number, goal: Goal): number {
  let surplus = 0;
  if (goal === "lean_gain") surplus = clamp(350, 0, 0.15 * tdeeValue);
  else if (goal === "recomp") surplus = 100;
  const raw = tdeeValue + surplus;
  return Math.round(raw / 10) * 10; // round to nearest 10
}

export function proteinTarget(weightKg: number): number {
  return Math.round(clamp(weightKg * 2.0, weightKg * 1.6, weightKg * 2.2));
}

/** Fat at ~25% of calories; carbs fill the remainder. */
export function macroSplit(calories: number, proteinG: number) {
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { fatG, carbsG };
}

/** Water target in litres → glasses (250 ml). */
export function waterTarget(weightKg: number, trainingDays = 0) {
  const bonus = trainingDays > 0 ? 0.7 : 0.3;
  const litres = clamp(Math.round((weightKg * 0.033 + bonus) * 10) / 10, 2.5, 4);
  return { litres, glasses: Math.round(litres / 0.25) };
}

const LABELS: Record<number, string[]> = {
  7: ["Wake-Up", "Breakfast", "Mid-Morning", "Lunch", "Evening", "Dinner", "Bedtime"],
  6: ["Wake-Up", "Breakfast", "Lunch", "Evening", "Dinner", "Bedtime"],
  5: ["Breakfast", "Mid-Morning", "Lunch", "Evening", "Dinner"],
};

const WEIGHTS: Record<number, number[]> = {
  7: [0.09, 0.18, 0.09, 0.21, 0.12, 0.19, 0.12],
  6: [0.1, 0.2, 0.24, 0.13, 0.21, 0.12],
  5: [0.22, 0.12, 0.28, 0.14, 0.24],
};

function parseHHMM(s: string, fallback: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return fallback;
  return Number(m[1]) + Number(m[2]) / 60;
}

function fmtTime(hoursDecimal: number): string {
  let h = Math.floor(hoursDecimal);
  const min = Math.round((hoursDecimal - h) * 60);
  const mm = String(min).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}:${mm} ${ampm}`;
}

/**
 * Distribute daily calories + protein across N small meals, anchored between
 * wake and sleep. Reconciles rounding drift so slot sums == daily totals.
 */
export function distribute(
  calories: number,
  proteinG: number,
  mealsPerDay: number,
  wakeTime = "07:00",
  sleepTime = "22:00"
): MealSlot[] {
  const n = mealsPerDay;
  const weights =
    WEIGHTS[n] ?? Array.from({ length: n }, () => 1 / n);
  const labels =
    LABELS[n] ?? Array.from({ length: n }, (_, i) => `Meal ${i + 1}`);

  const wake = parseHHMM(wakeTime, 7);
  let sleep = parseHHMM(sleepTime, 22);
  if (sleep <= wake) sleep = wake + 15;
  const span = sleep - wake;

  const kcals = weights.map((w) => Math.round(calories * w));
  const prots = weights.map((w) => Math.round(proteinG * w));
  reconcile(kcals, calories);
  reconcile(prots, proteinG);

  return weights.map((w, i) => ({
    index: i,
    label: labels[i] ?? `Meal ${i + 1}`,
    timeLabel: fmtTime(n === 1 ? wake : wake + (span * i) / (n - 1)),
    fraction: w,
    kcal: kcals[i],
    protein: prots[i],
  }));
}

/** Nudge the largest entries so the array sums exactly to `total`. */
function reconcile(arr: number[], total: number) {
  let diff = total - arr.reduce((a, b) => a + b, 0);
  const order = arr.map((_, i) => i).sort((a, b) => arr[b] - arr[a]);
  let k = 0;
  while (diff !== 0 && arr.length > 0) {
    const idx = order[k % order.length];
    const step = diff > 0 ? 1 : -1;
    if (arr[idx] + step >= 0) {
      arr[idx] += step;
      diff -= step;
    }
    k++;
    if (k > arr.length * Math.abs(total) + 1000) break; // safety
  }
}

/** Full target computation from a user's stats. */
export function computeTargets(input: StatsInput): Targets {
  const mealsPerDay = input.mealsPerDay ?? 7;
  const b = bmr(input.sex, input.age, input.heightCm, input.weightKg);
  const t = tdee(b, input.activity, input.fastMetabolism);
  const calories = calorieTarget(t, input.goal);
  const proteinG = proteinTarget(input.weightKg);
  const { fatG, carbsG } = macroSplit(calories, proteinG);
  const water = waterTarget(input.weightKg, input.trainingDays ?? 0);
  const mealSlots = distribute(
    calories,
    proteinG,
    mealsPerDay,
    input.wakeTime,
    input.sleepTime
  );

  return {
    bmr: b,
    tdee: t,
    calories,
    caloriesMin: calories - 150,
    caloriesMax: calories + 150,
    proteinG,
    fatG,
    carbsG,
    waterL: water.litres,
    waterGlasses: water.glasses,
    mealsPerDay,
    mealSlots,
  };
}

/**
 * Map `count` calendar days onto the available templates with a rotating
 * offset so week boundaries don't always land on the same template.
 */
export function generatePlanDays(templateIds: string[], count = 30): { dayIndex: number; templateId: string }[] {
  if (templateIds.length === 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    dayIndex: i + 1,
    templateId: templateIds[i % templateIds.length],
  }));
}

/** Portion scale factor to bring a template's native calories toward the user's target. */
export function scaleFactor(templateKcal: number, targetKcal: number): number {
  if (templateKcal <= 0) return 1;
  return clamp(Math.round((targetKcal / templateKcal) * 100) / 100, 0.85, 1.25);
}
