"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecipes, qk } from "@/lib/queries";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenSkeleton } from "@/components/screen-skeleton";
import { RecipesClient } from "@/components/recipes/recipes-client";

export default function RecipesPage() {
  // Recipes are shared + immutable → cache aggressively.
  const { data } = useQuery({ queryKey: qk.recipes, queryFn: fetchRecipes, staleTime: 1000 * 60 * 60 });

  return (
    <>
      <ScreenHeader title="Recipes" sub={data ? `${data.length} easy high-calorie meals` : " "} />
      {data ? <RecipesClient recipes={data} /> : <ScreenSkeleton />}
    </>
  );
}
