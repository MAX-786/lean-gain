import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline — Lean Gain" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
        <WifiOff className="size-7" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">You&apos;re offline</h1>
      <p className="text-[15px] text-muted">
        Your plan and today&apos;s meals need a connection to sync. Reconnect and it&apos;ll pick up
        right where you left off.
      </p>
    </div>
  );
}
