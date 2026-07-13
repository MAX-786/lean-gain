"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Undo2, X } from "lucide-react";
import { undoEvent } from "@/actions/activity";

interface ToastItem {
  id: number;
  message: string;
  undoEventId?: string | null;
}

const ToastCtx = React.createContext<{
  toast: (t: { message: string; undoEventId?: string | null }) => void;
}>({ toast: () => {} });

export const useToast = () => React.useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const qc = useQueryClient();

  const dismiss = React.useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: { message: string; undoEventId?: string | null }) => {
      const id = ++idRef.current;
      setToasts((ts) => [...ts.slice(-2), { id, ...t }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss]
  );

  async function doUndo(t: ToastItem) {
    dismiss(t.id);
    if (!t.undoEventId) return;
    const res = await undoEvent(t.undoEventId);
    // Undo can touch any domain — refresh everything from the server.
    qc.invalidateQueries();
    if (res.ok) toast({ message: "Undone" });
  }

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[100] flex w-[min(92vw,340px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 shadow-sheet"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-fuel/15 text-fuel">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span className="flex-1 text-[13px] text-ink">{t.message}</span>
            {t.undoEventId && (
              <button
                onClick={() => doUndo(t)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[12px] font-semibold text-fuel"
              >
                <Undo2 className="size-3.5" /> Undo
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="shrink-0 text-dim hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
