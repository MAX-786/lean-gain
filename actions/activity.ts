"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { regeneratePlan } from "@/lib/plan-gen";

function revalidateAll() {
  for (const p of ["/today", "/progress", "/profile", "/plan", "/activity"]) revalidatePath(p);
}

/** Reverse a previously recorded event by restoring its prev_state. */
export async function undoEvent(eventId: string): Promise<{ ok: boolean; summary?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: ev } = await supabase
    .from("activity_events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ev || ev.undone || !ev.reversible) return { ok: false };

  const key = (ev.entity_key ?? {}) as Record<string, unknown>;
  const prev = ev.prev_state as Record<string, unknown> | null;

  if (ev.entity === "meal_log") {
    if (!prev) {
      await supabase
        .from("meal_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("log_date", key.log_date as string)
        .eq("template_meal_id", key.template_meal_id as string);
    } else {
      await supabase.from("meal_logs").upsert(
        {
          user_id: user.id,
          log_date: key.log_date as string,
          template_meal_id: key.template_meal_id as string,
          status: prev.status,
          snoozed_until: prev.snoozed_until ?? null,
          completed_at: prev.completed_at ?? null,
        },
        { onConflict: "user_id,log_date,template_meal_id" }
      );
    }
  } else if (ev.entity === "water_log") {
    if (!prev) {
      await supabase.from("water_logs").delete().eq("user_id", user.id).eq("log_date", key.log_date as string);
    } else {
      await supabase
        .from("water_logs")
        .upsert(
          { user_id: user.id, log_date: key.log_date as string, glasses: prev.glasses },
          { onConflict: "user_id,log_date" }
        );
    }
  } else if (ev.entity === "weight_log") {
    if (!prev) {
      await supabase.from("weight_logs").delete().eq("user_id", user.id).eq("log_date", key.log_date as string);
    } else {
      await supabase
        .from("weight_logs")
        .upsert(
          { user_id: user.id, log_date: key.log_date as string, kg: prev.kg },
          { onConflict: "user_id,log_date" }
        );
    }
  } else if (ev.entity === "grocery_check") {
    if (!prev) {
      await supabase
        .from("grocery_checks")
        .delete()
        .eq("user_id", user.id)
        .eq("week", key.week as number)
        .eq("item_key", key.item_key as string);
    } else {
      await supabase.from("grocery_checks").upsert(
        { user_id: user.id, week: key.week as number, item_key: key.item_key as string, checked: prev.checked },
        { onConflict: "user_id,week,item_key" }
      );
    }
  } else if (ev.entity === "profile") {
    if (prev && typeof prev.plan_start_date === "string") {
      await supabase.from("profiles").update({ plan_start_date: prev.plan_start_date }).eq("id", user.id);
      await regeneratePlan(supabase, user.id, prev.plan_start_date);
    } else if (prev) {
      await supabase.from("profiles").update(prev).eq("id", user.id);
    }
  }

  await supabase
    .from("activity_events")
    .update({ undone: true, undone_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", user.id);

  revalidateAll();
  return { ok: true, summary: ev.summary as string };
}
