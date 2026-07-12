import Link from "next/link";
import { LogOut, History, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { GroceryLedger, type GroceryWeek } from "@/components/profile/grocery-ledger";
import { NameEditor } from "@/components/profile/name-editor";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: t }, { data: groceries }, { data: checks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, sex, age, height_cm, target_min_kg, target_max_kg, timeline_weeks, meals_per_day")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("user_targets")
      .select("calories, protein_g, fat_g, carbs_g, water_l, bmr, tdee")
      .eq("user_id", user!.id)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("grocery_template_items")
      .select("week, category, item, qty, price_inr, sort")
      .order("week")
      .order("sort"),
    supabase.from("grocery_checks").select("week, item_key, checked").eq("user_id", user!.id),
  ]);

  // group groceries into weeks → categories → items
  const weekMap = new Map<number, GroceryWeek>();
  for (const g of groceries ?? []) {
    let wk = weekMap.get(g.week);
    if (!wk) {
      wk = { week: g.week, categories: [] };
      weekMap.set(g.week, wk);
    }
    let cat = wk.categories.find((c) => c.name === g.category);
    if (!cat) {
      cat = { name: g.category, items: [] };
      wk.categories.push(cat);
    }
    cat.items.push({ key: `${g.category}:${g.item}`, item: g.item, qty: g.qty, price: g.price_inr });
  }
  const weeks = Array.from(weekMap.values()).sort((a, b) => a.week - b.week);

  const initialChecks: Record<string, boolean> = {};
  for (const c of checks ?? []) initialChecks[`${c.week}::${c.item_key}`] = c.checked;

  return (
    <>
      <ScreenHeader title="Profile" />
      <main className="space-y-3 px-4 pb-32">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
          <NameEditor name={profile?.name ?? ""} email={user?.email ?? ""} />
          {profile && (
            <p className="mt-3 text-[13px] text-muted">
              {profile.sex} · {profile.age} yrs · {profile.height_cm} cm · target {profile.target_min_kg}–
              {profile.target_max_kg} kg in {profile.timeline_weeks} wks
            </p>
          )}
        </div>

        <Link
          href="/activity"
          className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 shadow-card"
        >
          <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-strain">
            <History className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-ink">History &amp; undo</p>
            <p className="text-[12px] text-dim">Reverse any past action, anytime</p>
          </div>
          <ChevronRight className="size-4 text-dim" />
        </Link>

        <InstallPrompt />

        {t && (
          <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <p className="eyebrow mb-3">Your daily targets</p>
            <div className="grid grid-cols-2 gap-3 text-[14px]">
              <Row label="Calories" value={`${t.calories} kcal`} />
              <Row label="Protein" value={`${t.protein_g} g`} />
              <Row label="Carbs" value={`${t.carbs_g} g`} />
              <Row label="Fat" value={`${t.fat_g} g`} />
              <Row label="Water" value={`${t.water_l} L`} />
              <Row label="BMR / TDEE" value={`${t.bmr} / ${t.tdee}`} />
            </div>
          </div>
        )}

        {weeks.length > 0 && <GroceryLedger weeks={weeks} initialChecks={initialChecks} />}

        <form action={signOut}>
          <Button variant="surface" size="lg" className="w-full">
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 p-3">
      <div className="eyebrow">{label}</div>
      <div className="tnum mt-1 font-display font-semibold text-ink">{value}</div>
    </div>
  );
}
