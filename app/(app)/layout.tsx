import { BottomBar } from "@/components/nav/bottom-bar";
import { ToastProvider } from "@/components/toast/toaster";

/* Static shell — no per-navigation data fetch. Auth + onboarding gating is
   handled once in middleware, so client navigation between tabs is instant. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="mx-auto min-h-screen w-full max-w-[440px] bg-canvas">
        {children}
        <BottomBar />
      </div>
    </ToastProvider>
  );
}
