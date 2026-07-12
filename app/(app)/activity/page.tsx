import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/screen-header";
import { ActivityList, type ActivityEvent } from "@/components/activity/activity-list";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("activity_events")
    .select("id, kind, summary, created_at, undone, reversible")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(150);

  const events = (error ? [] : data ?? []) as ActivityEvent[];

  return (
    <>
      <ScreenHeader title="History" sub="Undo anything — your data, your call" />
      <main className="px-4 pb-32">
        {error && (
          <div className="mt-4 rounded-lg border border-amber/40 bg-surface p-4 text-[13px] text-amber shadow-card">
            Run <span className="font-mono">supabase/migrations/0002_activity.sql</span> to enable history.
          </div>
        )}
        <div className="mt-3">
          <ActivityList events={events} />
        </div>
      </main>
    </>
  );
}
