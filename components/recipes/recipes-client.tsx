"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { Search, Flame, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recipe {
  id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number;
  prep_min: number;
  ingredients: string[];
  steps: string[];
}

export function RecipesClient({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const [open, setOpen] = React.useState<Recipe | null>(null);

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(recipes.map((r) => r.category)))],
    [recipes]
  );

  const filtered = recipes.filter((r) => {
    const okCat = cat === "All" || r.category === cat;
    const okQ = !query || r.name.toLowerCase().includes(query.toLowerCase());
    return okCat && okQ;
  });

  return (
    <main className="px-4 pb-32">
      <div className="sticky top-[64px] z-20 -mx-4 bg-canvas/85 px-4 pb-2 pt-1 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes…"
            className="h-11 w-full rounded-full border border-line bg-surface-2 pl-10 pr-4 text-[15px] text-ink placeholder:text-dim outline-none focus:border-fuel/60"
          />
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                c === cat ? "border-fuel/50 bg-fuel/12 text-fuel" : "border-line bg-surface-2 text-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setOpen(r)}
            className="flex flex-col rounded-lg border border-line bg-surface p-3 text-left shadow-card transition-transform active:scale-[0.98]"
          >
            <span className="mb-1 self-start rounded-full bg-strain/15 px-2 py-0.5 text-[10px] font-semibold text-strain">
              {r.category}
            </span>
            <span className="font-display text-[15px] font-semibold leading-tight text-ink">{r.name}</span>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1 text-heat">
                <Flame className="size-3" /> {r.kcal}
              </span>
              <span className="inline-flex items-center gap-1 text-fuel">
                <Zap className="size-3" /> {r.protein}g
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {r.prep_min}m
              </span>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-[14px] text-muted">No recipes match your search.</p>
      )}

      <Drawer.Root open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] max-w-[440px] flex-col rounded-t-[28px] border-t border-line bg-surface outline-none">
            <div className="mx-auto mb-2 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-surface-3" />
            {open && (
              <div className="no-scrollbar overflow-y-auto px-5 pb-10">
                <span className="inline-block rounded-full bg-strain/15 px-2 py-0.5 text-[11px] font-semibold text-strain">
                  {open.category}
                </span>
                <Drawer.Title className="mt-2 font-display text-2xl font-bold text-ink">
                  {open.name}
                </Drawer.Title>
                <div className="mt-2 flex gap-4 text-[13px]">
                  <span className="inline-flex items-center gap-1 text-heat">
                    <Flame className="size-4" /> {open.kcal} kcal
                  </span>
                  <span className="inline-flex items-center gap-1 text-fuel">
                    <Zap className="size-4" /> {open.protein}g
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Clock className="size-4" /> {open.prep_min} min
                  </span>
                </div>

                <h4 className="eyebrow mt-5">Ingredients</h4>
                <ul className="mt-2 space-y-1.5">
                  {open.ingredients.map((i, idx) => (
                    <li key={idx} className="flex gap-2 text-[14px] text-ink">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fuel" />
                      {i}
                    </li>
                  ))}
                </ul>

                <h4 className="eyebrow mt-5">Steps</h4>
                <ol className="mt-2 space-y-2.5">
                  {open.steps.map((s, idx) => (
                    <li key={idx} className="flex gap-3 text-[14px] text-ink">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-[12px] text-fuel">
                        {idx + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </main>
  );
}
