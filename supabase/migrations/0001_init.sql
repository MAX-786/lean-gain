-- ============================================================
-- Lean Gain — schema + Row-Level Security
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" / "drop policy if exists".
-- ============================================================

create extension if not exists pgcrypto;

-- shared updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================
-- SHARED CONTENT (read-only reference data; seeded once)
-- ============================================================

create table if not exists public.meal_templates (
  id            text primary key,
  name          text,
  total_kcal    int not null,
  total_protein int not null,
  sort          int not null default 0
);

create table if not exists public.template_meals (
  id          uuid primary key default gen_random_uuid(),
  template_id text not null references public.meal_templates(id) on delete cascade,
  slot        int  not null,
  time_label  text not null,
  meal_label  text not null,
  items       text not null,
  kcal        int  not null,
  protein     int  not null,
  unique (template_id, slot)
);

create table if not exists public.recipes (
  id          text primary key,
  name        text not null,
  category    text not null,
  kcal        int  not null,
  protein     int  not null,
  prep_min    int  not null,
  ingredients jsonb not null,
  steps       jsonb not null
);

create table if not exists public.grocery_template_items (
  id        uuid primary key default gen_random_uuid(),
  week      int  not null,
  category  text not null,
  item      text not null,
  qty       text not null,
  price_inr int  not null,
  sort      int  not null default 0
);

create table if not exists public.workout_days (
  id       text primary key,
  day_name text not null,
  focus    text not null,
  sort     int  not null default 0
);

create table if not exists public.workout_exercises (
  id             uuid primary key default gen_random_uuid(),
  workout_day_id text not null references public.workout_days(id) on delete cascade,
  name           text not null,
  sets           text not null,
  reps           text not null,
  sort           int  not null default 0
);

create table if not exists public.habit_definitions (
  key   text primary key,
  label text not null,
  sort  int  not null default 0
);

-- ============================================================
-- PER-USER DATA (private; RLS-isolated to auth.uid())
-- ============================================================

create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text,
  sex                 text check (sex in ('male','female')),
  age                 int,
  height_cm           numeric,
  goal                text default 'lean_gain',
  target_min_kg       numeric,
  target_max_kg       numeric,
  timeline_weeks      int,
  appetite            text,
  activity_level      text,
  training_days       int,
  wake_time           time default '07:00',
  sleep_time          time default '22:00',
  meals_per_day       int  default 7,
  plan_start_date     date,
  timezone            text default 'Asia/Kolkata',
  coach_intensity     text default 'full',
  reminders_enabled   boolean default true,
  snooze_presets      jsonb default '["evening","1h","2h"]'::jsonb,
  quiet_start         time default '22:30',
  quiet_end           time default '07:00',
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.user_targets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  calories      int not null,
  calories_min  int not null,
  calories_max  int not null,
  protein_g     int not null,
  fat_g         int not null,
  carbs_g       int not null,
  water_l       numeric not null,
  water_glasses int not null,
  bmr           int not null,
  tdee          int not null,
  inputs        jsonb,
  is_current    boolean not null default true,
  computed_at   timestamptz not null default now()
);

create table if not exists public.user_plan_days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_date   date not null,
  day_index   int  not null,
  template_id text not null references public.meal_templates(id),
  unique (user_id, plan_date)
);

create table if not exists public.meal_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  log_date         date not null,
  template_meal_id uuid not null references public.template_meals(id),
  status           text not null default 'pending' check (status in ('pending','done','snoozed','skipped')),
  snoozed_until    timestamptz,
  completed_at     timestamptz,
  unique (user_id, log_date, template_meal_id)
);

create table if not exists public.weight_logs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  kg       numeric not null,
  unique (user_id, log_date)
);

create table if not exists public.water_logs (
  user_id  uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  glasses  int not null default 0,
  primary key (user_id, log_date)
);

create table if not exists public.habit_logs (
  user_id   uuid not null references auth.users(id) on delete cascade,
  log_date  date not null,
  habit_key text not null,
  done      boolean not null default false,
  primary key (user_id, log_date, habit_key)
);

create table if not exists public.workout_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  log_date       date not null,
  workout_day_id text references public.workout_days(id),
  completed      boolean not null default false,
  notes          text,
  unique (user_id, log_date)
);

create table if not exists public.grocery_checks (
  user_id  uuid not null references auth.users(id) on delete cascade,
  week     int  not null,
  item_key text not null,
  checked  boolean not null default false,
  primary key (user_id, week, item_key)
);

create table if not exists public.reminders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  kind         text not null check (kind in ('meal','habit','water','workout','weigh_in')),
  ref_id       text,
  title        text not null,
  body         text,
  scheduled_at timestamptz not null,
  status       text not null default 'scheduled' check (status in ('scheduled','sent','done','snoozed','skipped','expired')),
  snooze_until timestamptz,
  snooze_count int not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_ok_at timestamptz,
  unique (user_id, endpoint)
);

-- ---------- indexes ----------
create index if not exists idx_meal_logs_user_date   on public.meal_logs (user_id, log_date);
create index if not exists idx_weight_logs_user_date on public.weight_logs (user_id, log_date);
create index if not exists idx_plan_days_user_date   on public.user_plan_days (user_id, plan_date);
create index if not exists idx_targets_user_current  on public.user_targets (user_id) where is_current;
create index if not exists idx_reminders_due         on public.reminders (scheduled_at) where status = 'scheduled';

-- ---------- updated_at trigger ----------
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- shared content: enable RLS, allow authenticated (and anon) to READ only.
do $$
declare t text;
begin
  foreach t in array array[
    'meal_templates','template_meals','recipes','grocery_template_items',
    'workout_days','workout_exercises','habit_definitions'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "read_shared" on public.%I;', t);
    execute format('create policy "read_shared" on public.%I for select to anon, authenticated using (true);', t);
    execute format('grant select on public.%I to anon, authenticated;', t);
  end loop;
end $$;

-- per-user tables keyed by user_id: full isolation to the owner.
do $$
declare t text;
begin
  foreach t in array array[
    'user_targets','user_plan_days','meal_logs','weight_logs','water_logs',
    'habit_logs','workout_logs','grocery_checks','reminders','push_subscriptions'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own_rows" on public.%I;', t);
    execute format('create policy "own_rows" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated;', t);
  end loop;
end $$;

-- profiles: keyed by id (= auth.uid()).
alter table public.profiles enable row level security;
drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
grant select, insert, update, delete on public.profiles to authenticated;
