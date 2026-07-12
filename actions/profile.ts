"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordEvent } from "@/lib/audit";
import type { ActionResult } from "@/actions/day";

export async function updateName(name: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clean = name.trim().slice(0, 60);
  const { data: prev } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  await supabase.from("profiles").update({ name: clean }).eq("id", user.id);

  const summary = `Renamed to ${clean}`;
  const eventId = await recordEvent(supabase, user.id, {
    kind: "profile_update",
    entity: "profile",
    entityKey: {},
    prev: { name: prev?.name ?? null },
    next: { name: clean },
    summary,
  });

  revalidatePath("/profile");
  revalidatePath("/today");
  return { eventId, summary };
}
