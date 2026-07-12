import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_complete) redirect("/today");

  return <OnboardingWizard defaultName={profile?.name ?? ""} />;
}
