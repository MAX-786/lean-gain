"use client";

import * as React from "react";
import { Download, Share, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [standalone, setStandalone] = React.useState(false);

  React.useEffect(() => {
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || installed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 shadow-card">
        <span className="grid size-9 place-items-center rounded-full bg-fuel/12 text-fuel">
          <Check className="size-4" strokeWidth={2.5} />
        </span>
        <p className="text-[14px] font-semibold text-ink">Installed — enjoy the app!</p>
      </div>
    );
  }

  if (deferred) {
    return (
      <button
        onClick={async () => {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") setInstalled(true);
          setDeferred(null);
        }}
        className="flex w-full items-center gap-3 rounded-lg border border-fuel/30 bg-surface px-4 py-3.5 text-left shadow-glow"
      >
        <span className="grid size-9 place-items-center rounded-full bg-fuel/12 text-fuel">
          <Download className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">Install Lean Gain</p>
          <p className="text-[12px] text-dim">Add it to your home screen — feels like a native app</p>
        </div>
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 shadow-card">
        <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-strain">
          <Share className="size-4" />
        </span>
        <p className="text-[13px] text-muted">
          Install: tap <span className="font-semibold text-ink">Share</span> →{" "}
          <span className="font-semibold text-ink">Add to Home Screen</span>
        </p>
      </div>
    );
  }

  return null;
}
