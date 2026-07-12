import { z } from "zod";

export const statsInputSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(13).max(100),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(200),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lean_gain", "maintain", "recomp"]),
  trainingDays: z.number().int().min(0).max(7).optional(),
  appetite: z.enum(["small", "medium", "large"]).optional(),
  mealsPerDay: z.number().int().min(3).max(8).optional(),
  wakeTime: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  sleepTime: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  fastMetabolism: z.boolean().optional(),
});

export type StatsInputParsed = z.infer<typeof statsInputSchema>;

export const onboardingSchema = statsInputSchema.extend({
  name: z.string().min(1).max(60),
  targetMinKg: z.number().min(30).max(200),
  targetMaxKg: z.number().min(30).max(200),
  timelineWeeks: z.number().int().min(4).max(52),
});
