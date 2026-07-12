// Reads the legacy static content and emits supabase/seed.sql.
// Run: node scripts/generate-seed.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const src = fs.readFileSync("legacy/js/data.js", "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  src +
    "\n;globalThis.__OUT__ = { MEAL_TEMPLATES, RECIPES, GROCERY_LISTS, WORKOUT_PLAN, HABIT_ITEMS };",
  ctx
);
const { MEAL_TEMPLATES, RECIPES, GROCERY_LISTS, WORKOUT_PLAN, HABIT_ITEMS } = ctx.__OUT__;

const s = (v) => (v == null ? "null" : "'" + String(v).replace(/'/g, "''") + "'");
const j = (v) => "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
const n = (v) => (v == null ? "null" : Number(v));

const out = [];
out.push("-- ============================================================");
out.push("-- Lean Gain — seed data (generated from legacy content).");
out.push("-- Run AFTER 0001_init.sql. Safe to re-run (idempotent upserts).");
out.push("-- ============================================================\n");

// ---------- meal_templates + template_meals ----------
out.push("-- meal templates");
MEAL_TEMPLATES.forEach((t, ti) => {
  out.push(
    `insert into public.meal_templates (id, total_kcal, total_protein, sort) values ` +
      `(${s(t.id)}, ${n(t.totalKcal)}, ${n(t.totalProtein)}, ${ti}) ` +
      `on conflict (id) do update set total_kcal = excluded.total_kcal, total_protein = excluded.total_protein, sort = excluded.sort;`
  );
});
out.push("\n-- template meals");
MEAL_TEMPLATES.forEach((t) => {
  t.meals.forEach((m, slot) => {
    out.push(
      `insert into public.template_meals (template_id, slot, time_label, meal_label, items, kcal, protein) values ` +
        `(${s(t.id)}, ${slot}, ${s(m.time)}, ${s(m.label)}, ${s(m.items)}, ${n(m.kcal)}, ${n(m.protein)}) ` +
        `on conflict (template_id, slot) do update set time_label = excluded.time_label, meal_label = excluded.meal_label, items = excluded.items, kcal = excluded.kcal, protein = excluded.protein;`
    );
  });
});

// ---------- recipes ----------
out.push("\n-- recipes");
RECIPES.forEach((r) => {
  out.push(
    `insert into public.recipes (id, name, category, kcal, protein, prep_min, ingredients, steps) values ` +
      `(${s(r.id)}, ${s(r.name)}, ${s(r.category)}, ${n(r.kcal)}, ${n(r.protein)}, ${n(r.prepMin)}, ${j(r.ingredients)}, ${j(r.steps)}) ` +
      `on conflict (id) do update set name = excluded.name, category = excluded.category, kcal = excluded.kcal, protein = excluded.protein, prep_min = excluded.prep_min, ingredients = excluded.ingredients, steps = excluded.steps;`
  );
});

// ---------- grocery_template_items (delete + insert; no inbound FKs) ----------
out.push("\n-- grocery template items");
out.push("delete from public.grocery_template_items;");
let gsort = 0;
GROCERY_LISTS.forEach((w) => {
  w.categories.forEach((cat) => {
    cat.items.forEach((it) => {
      out.push(
        `insert into public.grocery_template_items (week, category, item, qty, price_inr, sort) values ` +
          `(${n(w.week)}, ${s(cat.name)}, ${s(it.item)}, ${s(it.qty)}, ${n(it.price)}, ${gsort++});`
      );
    });
  });
});

// ---------- workout_days + workout_exercises ----------
out.push("\n-- workout days");
const dayId = (d) => d.toLowerCase();
WORKOUT_PLAN.forEach((d, i) => {
  out.push(
    `insert into public.workout_days (id, day_name, focus, sort) values ` +
      `(${s(dayId(d.day))}, ${s(d.day)}, ${s(d.focus)}, ${i}) ` +
      `on conflict (id) do update set day_name = excluded.day_name, focus = excluded.focus, sort = excluded.sort;`
  );
});
out.push("\n-- workout exercises");
out.push("delete from public.workout_exercises;");
WORKOUT_PLAN.forEach((d) => {
  d.exercises.forEach((ex, i) => {
    out.push(
      `insert into public.workout_exercises (workout_day_id, name, sets, reps, sort) values ` +
        `(${s(dayId(d.day))}, ${s(ex.name)}, ${s(ex.sets)}, ${s(ex.reps)}, ${i});`
    );
  });
});

// ---------- habit_definitions ----------
out.push("\n-- habit definitions");
HABIT_ITEMS.forEach((h, i) => {
  out.push(
    `insert into public.habit_definitions (key, label, sort) values ` +
      `(${s(h.key)}, ${s(h.label)}, ${i}) ` +
      `on conflict (key) do update set label = excluded.label, sort = excluded.sort;`
  );
});

const outPath = path.join("supabase", "seed.sql");
fs.mkdirSync("supabase", { recursive: true });
fs.writeFileSync(outPath, out.join("\n") + "\n");
console.log(
  `Wrote ${outPath}: ${MEAL_TEMPLATES.length} templates, ` +
    `${MEAL_TEMPLATES.reduce((a, t) => a + t.meals.length, 0)} meals, ` +
    `${RECIPES.length} recipes, ${WORKOUT_PLAN.length} workout days, ` +
    `${HABIT_ITEMS.length} habits.`
);
