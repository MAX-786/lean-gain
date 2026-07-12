import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditEntity = "meal_log" | "water_log" | "weight_log" | "grocery_check" | "profile";

export interface RecordInput {
  kind: string;
  entity: AuditEntity;
  entityKey: Record<string, unknown>;
  prev: Record<string, unknown> | null;
  next: Record<string, unknown> | null;
  summary: string;
  reversible?: boolean;
}

/**
 * Record a reversible event. Best-effort: if the activity_events table does
 * not exist yet (migration not run) this returns null and never throws, so the
 * underlying mutation still succeeds.
 */
export async function recordEvent(
  supabase: SupabaseClient,
  userId: string,
  e: RecordInput
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("activity_events")
      .insert({
        user_id: userId,
        kind: e.kind,
        entity: e.entity,
        entity_key: e.entityKey,
        prev_state: e.prev,
        new_state: e.next,
        summary: e.summary,
        reversible: e.reversible ?? true,
      })
      .select("id")
      .single();
    if (error) return null;
    return (data?.id as string) ?? null;
  } catch {
    return null;
  }
}
