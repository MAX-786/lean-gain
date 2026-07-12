import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/today");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuel to-strain text-lg font-bold text-[#04120c]">
          LG
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">Lean Gain</h1>
        <p className="mt-1 text-[15px] text-muted">Small meals. Real gains.</p>
      </div>
      {children}
    </div>
  );
}
