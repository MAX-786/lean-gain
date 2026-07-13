"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X } from "lucide-react";
import { useToast } from "@/components/toast/toaster";
import { updateName } from "@/actions/profile";
import { Input } from "@/components/ui/input";

export function NameEditor({ name, email }: { name: string; email: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(name);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setValue(name), [name]);

  async function save() {
    if (!value.trim()) return;
    setBusy(true);
    const res = await updateName(value.trim());
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["today"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
    setBusy(false);
    setEditing(false);
    toast({ message: res.summary, undoEventId: res.eventId });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-10 flex-1" autoFocus />
        <button onClick={save} disabled={busy} className="grid size-10 place-items-center rounded-md bg-fuel text-[#04120c]">
          <Check className="size-5" strokeWidth={2.5} />
        </button>
        <button onClick={() => { setEditing(false); setValue(name); }} className="grid size-10 place-items-center rounded-md border border-line bg-surface-2 text-muted">
          <X className="size-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-semibold text-ink">{name || "You"}</p>
        <p className="truncate text-[13px] text-muted">{email}</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-muted hover:text-ink"
        title="Edit name"
      >
        <Pencil className="size-4" />
      </button>
    </div>
  );
}
