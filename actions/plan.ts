"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordEvent } from "@/lib/audit";
import { regeneratePlan, addDays } from "@/lib/plan-gen";
import type { ActionResult } from "@/actions/day";

/**
 * Set which plan day "today" is. Shifts plan_start_date so today maps to
 * `dayIndex`, then regenerates the 30-day plan from that start.
 * `todayLocal` is the user's local YYYY-MM-DD.
 */
export async function setCurrentDay(dayIndex: number, todayLocal: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const day = Math.max(1, Math.min(30, Math.round(dayIndex)));
  const newStart = addDays(todayLocal, -(day - 1));

  const { data: prof } = await supabase
    .from("profiles")
    .select("plan_start_date")
    .eq("id", user.id)
    .maybeSingle();

  await regeneratePlan(supabase, user.id, newStart);
  await supabase.from("profiles").update({ plan_start_date: newStart }).eq("id", user.id);

  const summary = `Set today to Day ${day}`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "plan_shift",
    entity: "profile",
    entityKey: {},
    prev: { plan_start_date: prof?.plan_start_date ?? null },
    next: { plan_start_date: newStart },
    summary,
  });

  revalidatePath("/today");
  revalidatePath("/plan");
  return { eventId, summary };
}

export async function restartPlan(todayLocal: string) {
  return setCurrentDay(1, todayLocal);
}
