"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordEvent } from "@/lib/audit";
import type { ActionResult } from "@/actions/day";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function logWeight(input: { date: string; kg: number }): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data: prev } = await supabase
    .from("weight_logs")
    .select("kg")
    .eq("user_id", user.id)
    .eq("log_date", input.date)
    .maybeSingle();
  await supabase
    .from("weight_logs")
    .upsert({ user_id: user.id, log_date: input.date, kg: input.kg }, { onConflict: "user_id,log_date" });
  const summary = `Logged ${input.kg} kg`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "weight_log",
    entity: "weight_log",
    entityKey: { log_date: input.date },
    prev: prev ? { kg: Number(prev.kg) } : null,
    next: { kg: input.kg },
    summary,
  });
  revalidatePath("/progress");
  return { eventId, summary };
}

export async function deleteWeight(input: { date: string }): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data: prev } = await supabase
    .from("weight_logs")
    .select("kg")
    .eq("user_id", user.id)
    .eq("log_date", input.date)
    .maybeSingle();
  await supabase.from("weight_logs").delete().eq("user_id", user.id).eq("log_date", input.date);
  const summary = "Deleted weigh-in";
  const eventId = await recordEvent(supabase, user.id, {
    kind: "weight_delete",
    entity: "weight_log",
    entityKey: { log_date: input.date },
    prev: prev ? { kg: Number(prev.kg) } : null,
    next: null,
    summary,
  });
  revalidatePath("/progress");
  return { eventId, summary };
}

export async function toggleGrocery(input: {
  week: number;
  itemKey: string;
  checked: boolean;
  itemName?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data: prev } = await supabase
    .from("grocery_checks")
    .select("checked")
    .eq("user_id", user.id)
    .eq("week", input.week)
    .eq("item_key", input.itemKey)
    .maybeSingle();
  await supabase.from("grocery_checks").upsert(
    { user_id: user.id, week: input.week, item_key: input.itemKey, checked: input.checked },
    { onConflict: "user_id,week,item_key" }
  );
  const summary = `${input.checked ? "Checked" : "Unchecked"} ${input.itemName ?? "item"}`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "grocery_toggle",
    entity: "grocery_check",
    entityKey: { week: input.week, item_key: input.itemKey },
    prev: prev ?? null,
    next: { checked: input.checked },
    summary,
  });
  revalidatePath("/profile");
  return { eventId, summary };
}
