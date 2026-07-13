import { createClient } from "@/lib/supabase/client";

/* ---------- helpers ---------- */

export function deviceToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/* ---------- query keys ---------- */

export const qk = {
  today: (date: string) => ["today", date] as const,
  plan: ["plan"] as const,
  recipes: ["recipes"] as const,
  progress: ["progress"] as const,
  profile: ["profile"] as const,
  activity: ["activity"] as const,
};

/* ---------- TODAY ---------- */

export interface TodayMeal {
  id: string;
  time_label: string;
  meal_label: string;
  items: string;
  kcal: number;
  protein: number;
}
export interface TodayScreen {
  date: string;
  name: string;
  dayIndex: number | null;
  hasPlan: boolean;
  targets: { calories: number; protein_g: number; water_glasses: number };
  meals: TodayMeal[];
  statuses: Record<string, { status: "pending" | "done" | "snoozed" | "skipped"; snoozedUntil?: string }>;
  water: number;
  streak: number;
  week: boolean[];
}

export async function fetchToday(date: string): Promise<TodayScreen> {
  const supabase = createClient();
  const [{ data: profile }, { data: targets }, { data: planDay }, { data: water }] = await Promise.all([
    supabase.from("profiles").select("name, timezone").maybeSingle(),
    supabase.from("user_targets").select("*").eq("is_current", true).maybeSingle(),
    supabase.from("user_plan_days").select("day_index, template_id").eq("plan_date", date).maybeSingle(),
    supabase.from("water_logs").select("glasses").eq("log_date", date).maybeSingle(),
  ]);

  let meals: TodayMeal[] = [];
  if (planDay) {
    const { data } = await supabase
      .from("template_meals")
      .select("id, slot, time_label, meal_label, items, kcal, protein")
      .eq("template_id", planDay.template_id)
      .order("slot");
    meals = (data ?? []) as TodayMeal[];
  }

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("template_meal_id, status, snoozed_until")
    .eq("log_date", date);

  const { data: recentDone } = await supabase
    .from("meal_logs")
    .select("log_date")
    .eq("status", "done")
    .gte("log_date", addDays(date, -30));
  const doneDates = new Set((recentDone ?? []).map((r) => r.log_date));
  const week = Array.from({ length: 7 }, (_, i) => doneDates.has(addDays(date, -(6 - i))));
  let streak = 0;
  for (let i = doneDates.has(date) ? 0 : 1; i < 60; i++) {
    if (doneDates.has(addDays(date, -i))) streak++;
    else break;
  }

  const statuses: TodayScreen["statuses"] = {};
  for (const l of logs ?? [])
    statuses[l.template_meal_id] = {
      status: (l.status as TodayScreen["statuses"][string]["status"]) ?? "pending",
      snoozedUntil: l.snoozed_until ?? undefined,
    };

  return {
    date,
    name: profile?.name ?? "",
    dayIndex: planDay?.day_index ?? null,
    hasPlan: !!planDay,
    targets: {
      calories: targets?.calories ?? 2900,
      protein_g: targets?.protein_g ?? 120,
      water_glasses: targets?.water_glasses ?? 12,
    },
    meals,
    statuses,
    water: water?.glasses ?? 0,
    streak,
    week,
  };
}

/* ---------- PLAN ---------- */

export interface PlanMeal {
  time_label: string;
  meal_label: string;
  items: string;
  kcal: number;
  protein: number;
}
export interface PlanDay {
  day_index: number;
  plan_date: string;
  template_id: string;
  isToday: boolean;
}
export interface PlanScreen {
  days: PlanDay[];
  mealsByTemplate: Record<string, PlanMeal[]>;
  totals: Record<string, { kcal: number; protein: number }>;
  currentDay: number;
}

export async function fetchPlan(): Promise<PlanScreen> {
  const supabase = createClient();
  const today = deviceToday();
  const [{ data: planDays }, { data: templates }, { data: tmeals }] = await Promise.all([
    supabase.from("user_plan_days").select("day_index, plan_date, template_id").order("day_index"),
    supabase.from("meal_templates").select("id, total_kcal, total_protein"),
    supabase
      .from("template_meals")
      .select("template_id, slot, time_label, meal_label, items, kcal, protein")
      .order("slot"),
  ]);

  const totals: PlanScreen["totals"] = {};
  for (const t of templates ?? []) totals[t.id] = { kcal: t.total_kcal, protein: t.total_protein };

  const mealsByTemplate: PlanScreen["mealsByTemplate"] = {};
  for (const m of tmeals ?? []) {
    (mealsByTemplate[m.template_id] ??= []).push({
      time_label: m.time_label,
      meal_label: m.meal_label,
      items: m.items,
      kcal: m.kcal,
      protein: m.protein,
    });
  }

  const days: PlanDay[] = (planDays ?? []).map((d) => ({
    day_index: d.day_index,
    plan_date: d.plan_date,
    template_id: d.template_id,
    isToday: d.plan_date === today,
  }));

  return { days, mealsByTemplate, totals, currentDay: days.find((d) => d.isToday)?.day_index ?? 1 };
}

/* ---------- RECIPES ---------- */

export interface Recipe {
  id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number;
  prep_min: number;
  ingredients: string[];
  steps: string[];
}
export async function fetchRecipes(): Promise<Recipe[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, name, category, kcal, protein, prep_min, ingredients, steps")
    .order("category")
    .order("name");
  return (data ?? []) as Recipe[];
}

/* ---------- PROGRESS ---------- */

export interface WeightPoint {
  date: string;
  kg: number;
}
export interface WorkoutDay {
  id: string;
  day_name: string;
  focus: string;
  exercises: { name: string; sets: string; reps: string; sort: number }[];
}
export interface ProgressScreen {
  weights: WeightPoint[];
  startKg: number;
  targetMin: number;
  targetMax: number;
  waterTarget: number;
  waterData: { label: string; glasses: number }[];
  workoutDays: WorkoutDay[];
  today: string;
}

export async function fetchProgress(): Promise<ProgressScreen> {
  const supabase = createClient();
  const today = deviceToday();
  const [{ data: weights }, { data: profile }, { data: targets }, { data: waters }, { data: wdays }] =
    await Promise.all([
      supabase.from("weight_logs").select("log_date, kg").order("log_date"),
      supabase.from("profiles").select("target_min_kg, target_max_kg").maybeSingle(),
      supabase.from("user_targets").select("water_glasses").eq("is_current", true).maybeSingle(),
      supabase.from("water_logs").select("log_date, glasses"),
      supabase
        .from("workout_days")
        .select("id, day_name, focus, workout_exercises(name, sets, reps, sort)")
        .order("sort"),
    ]);

  const weightPoints: WeightPoint[] = (weights ?? []).map((w) => ({ date: w.log_date, kg: Number(w.kg) }));
  const waterMap = new Map((waters ?? []).map((w) => [w.log_date, w.glasses]));
  const waterData = Array.from({ length: 10 }, (_, i) => {
    const d = addDays(today, -(9 - i));
    return { label: d.slice(5), glasses: waterMap.get(d) ?? 0 };
  });

  return {
    weights: weightPoints,
    startKg: weightPoints[0]?.kg ?? 57,
    targetMin: profile?.target_min_kg ?? 61,
    targetMax: profile?.target_max_kg ?? 63,
    waterTarget: targets?.water_glasses ?? 12,
    waterData,
    workoutDays: (wdays ?? []).map((d) => ({
      id: d.id,
      day_name: d.day_name,
      focus: d.focus,
      exercises: ((d.workout_exercises ?? []) as WorkoutDay["exercises"]).sort((a, b) => a.sort - b.sort),
    })),
    today,
  };
}

/* ---------- PROFILE ---------- */

export interface GroceryItem {
  key: string;
  item: string;
  qty: string;
  price: number;
}
export interface GroceryWeek {
  week: number;
  categories: { name: string; items: GroceryItem[] }[];
}
export interface ProfileScreen {
  email: string;
  profile: {
    name: string;
    sex: string;
    age: number;
    height_cm: number;
    target_min_kg: number;
    target_max_kg: number;
    timeline_weeks: number;
  } | null;
  targets: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    water_l: number;
    bmr: number;
    tdee: number;
  } | null;
  weeks: GroceryWeek[];
  checks: Record<string, boolean>;
}

export async function fetchProfile(): Promise<ProfileScreen> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: profile }, { data: targets }, { data: groceries }, { data: checks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, sex, age, height_cm, target_min_kg, target_max_kg, timeline_weeks")
      .maybeSingle(),
    supabase
      .from("user_targets")
      .select("calories, protein_g, fat_g, carbs_g, water_l, bmr, tdee")
      .eq("is_current", true)
      .maybeSingle(),
    supabase.from("grocery_template_items").select("week, category, item, qty, price_inr, sort").order("week").order("sort"),
    supabase.from("grocery_checks").select("week, item_key, checked"),
  ]);

  const weekMap = new Map<number, GroceryWeek>();
  for (const g of groceries ?? []) {
    let wk = weekMap.get(g.week);
    if (!wk) {
      wk = { week: g.week, categories: [] };
      weekMap.set(g.week, wk);
    }
    let cat = wk.categories.find((c) => c.name === g.category);
    if (!cat) {
      cat = { name: g.category, items: [] };
      wk.categories.push(cat);
    }
    cat.items.push({ key: `${g.category}:${g.item}`, item: g.item, qty: g.qty, price: g.price_inr });
  }
  const initialChecks: Record<string, boolean> = {};
  for (const c of checks ?? []) initialChecks[`${c.week}::${c.item_key}`] = c.checked;

  return {
    email: user?.email ?? "",
    profile: (profile as ProfileScreen["profile"]) ?? null,
    targets: (targets as ProfileScreen["targets"]) ?? null,
    weeks: Array.from(weekMap.values()).sort((a, b) => a.week - b.week),
    checks: initialChecks,
  };
}

/* ---------- ACTIVITY ---------- */

export interface ActivityEvent {
  id: string;
  kind: string;
  summary: string;
  created_at: string;
  undone: boolean;
  reversible: boolean;
}
export async function fetchActivity(): Promise<{ events: ActivityEvent[]; tableMissing: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_events")
    .select("id, kind, summary, created_at, undone, reversible")
    .order("created_at", { ascending: false })
    .limit(150);
  return { events: (data ?? []) as ActivityEvent[], tableMissing: !!error };
}
