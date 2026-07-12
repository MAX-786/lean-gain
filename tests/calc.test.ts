import { describe, it, expect } from "vitest";
import {
  bmr,
  tdee,
  calorieTarget,
  proteinTarget,
  macroSplit,
  waterTarget,
  distribute,
  computeTargets,
  generatePlanDays,
  scaleFactor,
} from "@/lib/calc";

// Persona: 24yo male, 180cm, 57kg, trains ~5d/wk, lean-gain goal.
const persona = {
  sex: "male" as const,
  age: 24,
  heightCm: 180,
  weightKg: 57,
  activity: "moderate" as const,
  goal: "lean_gain" as const,
  trainingDays: 5,
  fastMetabolism: true,
  mealsPerDay: 7,
  wakeTime: "07:00",
  sleepTime: "22:00",
};

describe("BMR (Mifflin-St Jeor)", () => {
  it("computes the persona's BMR ≈ 1580", () => {
    expect(bmr("male", 24, 180, 57)).toBe(1580);
  });
  it("female offset is -161 vs male +5 (166 apart)", () => {
    expect(bmr("male", 30, 175, 70) - bmr("female", 30, 175, 70)).toBe(166);
  });
});

describe("TDEE", () => {
  it("applies activity + fast-metabolism bump", () => {
    const t = tdee(1580, "moderate", true);
    expect(t).toBe(Math.round(1580 * 1.55 * 1.05)); // 2571
  });
});

describe("calorie target", () => {
  it("lean gain adds a capped surplus, rounded to 10", () => {
    const t = tdee(1580, "moderate", true);
    const cals = calorieTarget(t, "lean_gain");
    expect(cals % 10).toBe(0);
    expect(cals).toBeGreaterThan(t);
    expect(cals - t).toBeLessThanOrEqual(0.15 * t + 5);
  });
  it("maintain adds nothing", () => {
    expect(calorieTarget(2500, "maintain")).toBe(2500);
  });
});

describe("macros", () => {
  it("protein ~2 g/kg within band", () => {
    expect(proteinTarget(57)).toBe(114);
  });
  it("fat ~25% kcal and carbs fill remainder, non-negative", () => {
    const { fatG, carbsG } = macroSplit(2900, 114);
    expect(fatG).toBe(Math.round((2900 * 0.25) / 9));
    expect(carbsG).toBeGreaterThan(0);
  });
});

describe("water", () => {
  it("persona lands in the 2.5–3 L band, ~10 glasses", () => {
    const w = waterTarget(57, 5);
    expect(w.litres).toBeGreaterThanOrEqual(2.5);
    expect(w.litres).toBeLessThanOrEqual(3);
    expect(w.glasses).toBe(Math.round(w.litres / 0.25));
  });
});

describe("meal distribution", () => {
  const slots = distribute(2900, 114, 7, "07:00", "22:00");
  it("produces one slot per meal", () => {
    expect(slots).toHaveLength(7);
  });
  it("slot calories sum exactly to the target (reconciled)", () => {
    expect(slots.reduce((a, s) => a + s.kcal, 0)).toBe(2900);
  });
  it("slot protein sums exactly to the target", () => {
    expect(slots.reduce((a, s) => a + s.protein, 0)).toBe(114);
  });
  it("first slot is at wake, last at sleep", () => {
    expect(slots[0].timeLabel).toBe("7:00 AM");
    expect(slots[6].timeLabel).toBe("10:00 PM");
  });
  it("keeps plates small — no single slot over 25% of the day", () => {
    for (const s of slots) expect(s.kcal / 2900).toBeLessThanOrEqual(0.25);
  });
});

describe("computeTargets (end to end)", () => {
  const t = computeTargets(persona);
  it("sits in the expected lean-gain band for the persona", () => {
    expect(t.calories).toBeGreaterThanOrEqual(2700);
    expect(t.calories).toBeLessThanOrEqual(3000);
    expect(t.proteinG).toBe(114);
    expect(t.waterGlasses).toBeGreaterThanOrEqual(9);
  });
  it("macro calories are internally consistent (±1 slot rounding)", () => {
    expect(t.mealSlots.reduce((a, s) => a + s.kcal, 0)).toBe(t.calories);
  });
});

describe("plan generation", () => {
  it("maps 30 days across templates with rotation", () => {
    const ids = ["T1", "T2", "T3"];
    const plan = generatePlanDays(ids, 30);
    expect(plan).toHaveLength(30);
    expect(plan[0]).toEqual({ dayIndex: 1, templateId: "T1" });
    expect(plan[3].templateId).toBe("T1"); // wraps every 3
  });
  it("scaleFactor is clamped to realistic portions", () => {
    expect(scaleFactor(2000, 2900)).toBeLessThanOrEqual(1.25);
    expect(scaleFactor(4000, 2900)).toBeGreaterThanOrEqual(0.85);
  });
});
