"use client";

import Link from "next/link";
import { LogOut, History, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, qk } from "@/lib/queries";
import { signOut } from "@/actions/auth";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenSkeleton } from "@/components/screen-skeleton";
import { Button } from "@/components/ui/button";
import { GroceryLedger } from "@/components/profile/grocery-ledger";
import { NameEditor } from "@/components/profile/name-editor";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function ProfilePage() {
  const { data } = useQuery({ queryKey: qk.profile, queryFn: fetchProfile });

  return (
    <>
      <ScreenHeader title="Profile" />
      {!data ? (
        <ScreenSkeleton />
      ) : (
        <main className="space-y-3 px-4 pb-32">
          <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <NameEditor name={data.profile?.name ?? ""} email={data.email} />
            {data.profile && (
              <p className="mt-3 text-[13px] text-muted">
                {data.profile.sex} · {data.profile.age} yrs · {data.profile.height_cm} cm · target{" "}
                {data.profile.target_min_kg}–{data.profile.target_max_kg} kg in {data.profile.timeline_weeks} wks
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

          {data.targets && (
            <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
              <p className="eyebrow mb-3">Your daily targets</p>
              <div className="grid grid-cols-2 gap-3 text-[14px]">
                <Row label="Calories" value={`${data.targets.calories} kcal`} />
                <Row label="Protein" value={`${data.targets.protein_g} g`} />
                <Row label="Carbs" value={`${data.targets.carbs_g} g`} />
                <Row label="Fat" value={`${data.targets.fat_g} g`} />
                <Row label="Water" value={`${data.targets.water_l} L`} />
                <Row label="BMR / TDEE" value={`${data.targets.bmr} / ${data.targets.tdee}`} />
              </div>
            </div>
          )}

          {data.weeks.length > 0 && <GroceryLedger weeks={data.weeks} initialChecks={data.checks} />}

          <form action={signOut}>
            <Button variant="surface" size="lg" className="w-full">
              <LogOut className="size-4" /> Sign out
            </Button>
          </form>
        </main>
      )}
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
