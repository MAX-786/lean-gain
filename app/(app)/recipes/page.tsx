import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/screen-header";
import { RecipesClient, type Recipe } from "@/components/recipes/recipes-client";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, name, category, kcal, protein, prep_min, ingredients, steps")
    .order("category")
    .order("name");

  const recipes = (data ?? []) as Recipe[];

  return (
    <>
      <ScreenHeader title="Recipes" sub={`${recipes.length} easy high-calorie meals`} />
      <RecipesClient recipes={recipes} />
    </>
  );
}
