import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomBar } from "@/components/nav/bottom-bar";
import { ToastProvider } from "@/components/toast/toaster";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <ToastProvider>
      <div className="mx-auto min-h-screen w-full max-w-[440px] bg-canvas">
        {children}
        <BottomBar />
      </div>
    </ToastProvider>
  );
}
