export function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="safe-top sticky top-0 z-30 bg-canvas/85 px-4 pb-3 pt-4 backdrop-blur-xl">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      {sub && <p className="text-[13px] text-muted">{sub}</p>}
    </header>
  );
}

export function ComingSoon({ note }: { note: string }) {
  return (
    <main className="px-4 pb-32">
      <div className="mt-4 rounded-lg border border-dashed border-line bg-surface p-6 text-center text-[14px] text-muted shadow-card">
        {note}
      </div>
    </main>
  );
}
