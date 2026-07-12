-- ============================================================
-- Lean Gain — activity log for full undo / reversal history.
-- Run in the Supabase SQL Editor after 0001_init.sql.
-- Safe to re-run.
-- ============================================================

create table if not exists public.activity_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,          -- meal_done | meal_snooze | meal_missed | meal_reset | water_set | weight_log | weight_delete | grocery_toggle | plan_shift | profile_update
  entity      text not null,          -- meal_log | water_log | weight_log | grocery_check | profile
  entity_key  jsonb,                  -- key columns identifying the affected row
  prev_state  jsonb,                  -- state BEFORE the change (null if row did not exist) — used to reverse
  new_state   jsonb,                  -- state AFTER the change
  summary     text not null,          -- human-readable, e.g. "Marked Dinner done"
  reversible  boolean not null default true,
  undone      boolean not null default false,
  undone_at   timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_user_time on public.activity_events (user_id, created_at desc);

alter table public.activity_events enable row level security;
drop policy if exists "own_activity" on public.activity_events;
create policy "own_activity" on public.activity_events for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.activity_events to authenticated;
