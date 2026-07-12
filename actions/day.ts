"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordEvent } from "@/lib/audit";

export interface ActionResult {
  eventId: string | null;
  summary: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

async function prevMealLog(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, date: string, mealId: string) {
  const { data } = await supabase
    .from("meal_logs")
    .select("status, snoozed_until, completed_at")
    .eq("user_id", userId)
    .eq("log_date", date)
    .eq("template_meal_id", mealId)
    .maybeSingle();
  return data ?? null;
}

async function setMealStatus(
  input: { templateMealId: string; date: string; mealLabel?: string },
  next: { status: string; snoozed_until?: string | null; completed_at?: string | null },
  kind: string,
  verb: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const prev = await prevMealLog(supabase, user.id, input.date, input.templateMealId);
  await supabase.from("meal_logs").upsert(
    {
      user_id: user.id,
      log_date: input.date,
      template_meal_id: input.templateMealId,
      status: next.status,
      snoozed_until: next.snoozed_until ?? null,
      completed_at: next.completed_at ?? null,
    },
    { onConflict: "user_id,log_date,template_meal_id" }
  );
  const summary = `${verb} ${input.mealLabel ?? "meal"}`;
  const eventId = await recordEvent(supabase, user.id, {
    kind,
    entity: "meal_log",
    entityKey: { log_date: input.date, template_meal_id: input.templateMealId },
    prev,
    next: { status: next.status, snoozed_until: next.snoozed_until ?? null, completed_at: next.completed_at ?? null },
    summary,
  });
  revalidatePath("/today");
  return { eventId, summary };
}

export async function markMealDone(input: { templateMealId: string; date: string; mealLabel?: string }) {
  return setMealStatus(input, { status: "done", completed_at: new Date().toISOString() }, "meal_done", "Marked");
}

export async function markMealMissed(input: { templateMealId: string; date: string; mealLabel?: string }) {
  return setMealStatus(input, { status: "skipped" }, "meal_missed", "Missed");
}

export async function undoMeal(input: { templateMealId: string; date: string; mealLabel?: string }) {
  return setMealStatus(input, { status: "pending" }, "meal_reset", "Reset");
}

export async function snoozeMeal(input: {
  templateMealId: string;
  date: string;
  minutes: number;
  mealLabel?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const prev = await prevMealLog(supabase, user.id, input.date, input.templateMealId);
  const until = new Date(Date.now() + input.minutes * 60_000).toISOString();
  await supabase.from("meal_logs").upsert(
    {
      user_id: user.id,
      log_date: input.date,
      template_meal_id: input.templateMealId,
      status: "snoozed",
      snoozed_until: until,
      completed_at: null,
    },
    { onConflict: "user_id,log_date,template_meal_id" }
  );
  await supabase.from("reminders").insert({
    user_id: user.id,
    kind: "meal",
    ref_id: input.templateMealId,
    title: `Reminder: ${input.mealLabel ?? "meal"}`,
    scheduled_at: until,
    status: "scheduled",
  });
  const summary = `Snoozed ${input.mealLabel ?? "meal"}`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "meal_snooze",
    entity: "meal_log",
    entityKey: { log_date: input.date, template_meal_id: input.templateMealId },
    prev,
    next: { status: "snoozed", snoozed_until: until, completed_at: null },
    summary,
  });
  revalidatePath("/today");
  return { eventId, summary };
}

export async function setWater(input: { date: string; glasses: number }): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data: prevRow } = await supabase
    .from("water_logs")
    .select("glasses")
    .eq("user_id", user.id)
    .eq("log_date", input.date)
    .maybeSingle();
  const glasses = Math.max(0, input.glasses);
  await supabase
    .from("water_logs")
    .upsert({ user_id: user.id, log_date: input.date, glasses }, { onConflict: "user_id,log_date" });
  const summary = `Water set to ${glasses} glasses`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "water_set",
    entity: "water_log",
    entityKey: { log_date: input.date },
    prev: prevRow ?? null,
    next: { glasses },
    summary,
  });
  revalidatePath("/today");
  return { eventId, summary };
}
