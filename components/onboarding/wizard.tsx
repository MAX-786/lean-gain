"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { computeTargets, type StatsInput } from "@/lib/calc";
import { saveOnboarding } from "@/actions/onboarding";
import { Flame, Zap, Droplet, ArrowLeft } from "lucide-react";

interface Form extends StatsInput {
  name: string;
  targetMinKg: number;
  targetMaxKg: number;
  timelineWeeks: number;
}

const DEFAULTS: Form = {
  name: "",
  sex: "male",
  age: 24,
  heightCm: 180,
  weightKg: 57,
  goal: "lean_gain",
  targetMinKg: 61,
  targetMaxKg: 63,
  timelineWeeks: 11,
  activity: "moderate",
  trainingDays: 5,
  appetite: "small",
  mealsPerDay: 7,
  wakeTime: "07:00",
  sleepTime: "22:00",
  fastMetabolism: true,
};

const STEPS = ["You", "Body", "Goal", "Training", "Rhythm", "Plan"];

function Seg<T extends string | number>({
  options,
  value,
  onChange,
  cols = 3,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div className={cn("grid gap-2", cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-11 rounded-md border px-2 text-[13px] font-medium transition-colors",
            value === o.value
              ? "border-fuel/50 bg-fuel/12 text-fuel"
              : "border-line bg-surface-2 text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OnboardingWizard({ defaultName }: { defaultName?: string }) {
  const [step, setStep] = React.useState(0);
  const [f, setF] = React.useState<Form>({ ...DEFAULTS, name: defaultName ?? "" });
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const num = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, (e.target.value === "" ? 0 : Number(e.target.value)) as Form[typeof k]);

  const targets = React.useMemo(() => computeTargets(f), [f]);
  const last = step === STEPS.length - 1;

  async function submit() {
    setPending(true);
    setError(null);
    const d = new Date();
    const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      await saveOnboarding(f, localToday, tz);
      // saveOnboarding redirects on success; nothing more to do here.
    } catch (e) {
      // A Next redirect throws a control-flow signal we must not swallow.
      if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT"))
        throw e;
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPending(false);
    }
  }

  const canNext =
    (step === 0 && f.name.trim().length > 0) ||
    (step > 0 && step < STEPS.length - 1) ||
    false;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 py-8">
      {/* progress */}
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="text-muted hover:text-ink">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span className="size-5" />
        )}
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-fuel" : "bg-surface-3")}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-dim">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <div className="flex-1 space-y-5">
        {step === 0 && (
          <>
            <StepTitle title="What should we call you?" sub="Your plan is private to your account." />
            <Field label="Name">
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your Name" autoFocus />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="A bit about your body" sub="This powers your calorie & protein math." />
            <Field label="Sex (for BMR)">
              <Seg
                cols={2}
                value={f.sex}
                onChange={(v) => set("sex", v)}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Age"><Input type="number" value={f.age} onChange={num("age")} /></Field>
              <Field label="Height cm"><Input type="number" value={f.heightCm} onChange={num("heightCm")} /></Field>
              <Field label="Weight kg"><Input type="number" step="0.1" value={f.weightKg} onChange={num("weightKg")} /></Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="What's the goal?" sub="Lean gain keeps the surplus moderate so the belly stays lean." />
            <Seg
              cols={3}
              value={f.goal}
              onChange={(v) => set("goal", v)}
              options={[
                { label: "Lean gain", value: "lean_gain" },
                { label: "Maintain", value: "maintain" },
                { label: "Recomp", value: "recomp" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target min kg"><Input type="number" step="0.5" value={f.targetMinKg} onChange={num("targetMinKg")} /></Field>
              <Field label="Target max kg"><Input type="number" step="0.5" value={f.targetMaxKg} onChange={num("targetMaxKg")} /></Field>
            </div>
            <Field label="Timeline (weeks)"><Input type="number" value={f.timelineWeeks} onChange={num("timelineWeeks")} /></Field>
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title="How active are you?" sub="Training days push your calorie target up." />
            <Field label="Activity level">
              <Seg
                cols={2}
                value={f.activity}
                onChange={(v) => set("activity", v)}
                options={[
                  { label: "Sedentary", value: "sedentary" },
                  { label: "Light", value: "light" },
                  { label: "Moderate", value: "moderate" },
                  { label: "Active", value: "active" },
                  { label: "Very active", value: "very_active" },
                ]}
              />
            </Field>
            <Field label="Training days / week">
              <Seg
                cols={4}
                value={f.trainingDays ?? 5}
                onChange={(v) => set("trainingDays", v)}
                options={[3, 4, 5, 6].map((n) => ({ label: String(n), value: n }))}
              />
            </Field>
            <Field label="Appetite" hint="Small appetite → smaller, more frequent, calorie-dense meals.">
              <Seg
                cols={3}
                value={f.appetite ?? "small"}
                onChange={(v) => set("appetite", v)}
                options={[
                  { label: "Small", value: "small" },
                  { label: "Medium", value: "medium" },
                  { label: "Large", value: "large" },
                ]}
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="Your daily rhythm" sub="We time your meal cards to your real hours." />
            <Field label="Meals per day">
              <Seg
                cols={3}
                value={f.mealsPerDay ?? 7}
                onChange={(v) => set("mealsPerDay", v)}
                options={[5, 6, 7].map((n) => ({ label: String(n), value: n }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wake time"><Input type="time" value={f.wakeTime} onChange={(e) => set("wakeTime", e.target.value)} /></Field>
              <Field label="Sleep time"><Input type="time" value={f.sleepTime} onChange={(e) => set("sleepTime", e.target.value)} /></Field>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <StepTitle title="Your plan is ready" sub={`${targets.mealsPerDay} small meals a day to hit your numbers.`} />
            <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
              <div className="flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-ink">{targets.calories}</span>
                <span className="mb-1 text-sm text-dim">kcal / day</span>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                BMR {targets.bmr} · TDEE {targets.tdee} · target range {targets.caloriesMin}–{targets.caloriesMax}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat icon={<Zap className="size-4 text-fuel" />} label="Protein" value={`${targets.proteinG}g`} />
                <Stat icon={<Flame className="size-4 text-heat" />} label="Carbs / Fat" value={`${targets.carbsG} / ${targets.fatG}g`} />
                <Stat icon={<Droplet className="size-4 text-amber" />} label="Water" value={`${targets.waterL}L`} />
              </div>
            </div>
            {error && <p className="text-[13px] text-danger">{error}</p>}
          </>
        )}
      </div>

      <div className="pt-6">
        {last ? (
          <Button size="lg" className="w-full" onClick={submit} disabled={pending}>
            {pending ? "Building your plan…" : "Start my plan"}
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 p-2.5 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <div className="tnum font-display text-sm font-semibold text-ink">{value}</div>
      <div className="eyebrow mt-0.5">{label}</div>
    </div>
  );
}
