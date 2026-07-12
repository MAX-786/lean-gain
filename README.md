# Lean Gain — fuel the gain

A modern, mobile-first **muscle-gain nutrition & training tracker**. Built for a small-appetite,
fast-metabolism hardgainer: small calorie-dense meals eaten often, surfaced as a swipeable daily
deck that keeps you motivated to never skip a meal.

Rebuilt from a static HTML prototype (kept in `legacy/`) into a full **Next.js + Supabase PWA**.

## Features

- **Auth** (email + password) with long-lived sessions; every user's data isolated by Postgres Row-Level Security.
- **Onboarding wizard** → a calculation backend (Mifflin-St Jeor → TDEE → lean-gain surplus → macros/water) computes your personal targets and a 30-day plan.
- **Today** — a gesture deck: swipe right = done, swipe left = snooze. Live "Fuel Score" + rings, streak, water, and a **local-time backlog** ("catch up") with a **Missed** option for overdue meals.
- **Plan** (30 days, set which day you're on), **Recipes** (searchable), **Progress** (weight & water charts, training split), **Profile** (targets, grocery ledger).
- **Full undo** — every action is a reversible event: an undo toaster + a **History** screen to reverse anything, anytime.
- **PWA** — installable to your home screen, offline shell, dark-first with a real light mode.

## Stack

Next.js 16 (App Router, RSC + Server Actions) · TypeScript · Tailwind v4 · Framer Motion +
@use-gesture + react-spring · Recharts · TanStack Query · Supabase (Postgres + Auth + RLS via
`@supabase/ssr`) · Vitest. Deploy on Vercel.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

### Database (run once, in the Supabase SQL Editor)

Dashboard → **SQL Editor** → New query, paste and Run each, in order:

1. `supabase/migrations/0001_init.sql` — tables + Row-Level Security
2. `supabase/migrations/0002_activity.sql` — the audit/undo history table
3. `supabase/seed.sql` — meal templates, recipes, grocery lists, workouts (regenerate with `npm run seed`)

**Recommended:** Authentication → Sign In / Providers → Email → turn **off** "Confirm email" for
instant signup on a personal app. (Google OAuth is optional — enable the provider to use it.)

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo (Next.js auto-detected).
3. **Environment Variables** — add the two from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. Then in Supabase → Authentication → **URL Configuration**, add your Vercel domain to the
   allowed redirect/site URLs.

That's it — the persisted-session cookie and installed PWA work off your production domain.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Calculation-engine unit tests (Vitest) |
| `npm run seed` | Regenerate `supabase/seed.sql` from `legacy/js/data.js` |
| `npm run icons` | Regenerate PWA icons |

## Project layout

- `app/` — App Router: `(auth)` login/signup, `(app)` gated tabs (today/plan/recipes/progress/profile/activity), `onboarding`, `manifest.ts`
- `actions/` — server actions (day, trackers, onboarding, plan, profile, activity/undo, auth)
- `components/` — UI primitives + feature components (today deck, charts, toaster, pwa)
- `lib/` — `calc.ts` (tested engine), `supabase/`, `audit.ts`, `plan-gen.ts`
- `supabase/` — SQL migrations + generated seed
