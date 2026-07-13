"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchActivity, qk } from "@/lib/queries";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenSkeleton } from "@/components/screen-skeleton";
import { ActivityList } from "@/components/activity/activity-list";

export default function ActivityPage() {
  const { data } = useQuery({ queryKey: qk.activity, queryFn: fetchActivity });

  return (
    <>
      <ScreenHeader title="History" sub="Undo anything — your data, your call" />
      <main className="px-4 pb-32">
        {data?.tableMissing && (
          <div className="mt-4 rounded-lg border border-amber/40 bg-surface p-4 text-[13px] text-amber shadow-card">
            Run <span className="font-mono">supabase/migrations/0002_activity.sql</span> to enable history.
          </div>
        )}
        <div className="mt-3">{data ? <ActivityList events={data.events} /> : <ScreenSkeleton />}</div>
      </main>
    </>
  );
}
