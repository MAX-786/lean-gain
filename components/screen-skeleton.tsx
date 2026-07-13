export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <main className="space-y-3 px-4 pb-32">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-line bg-surface/60"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </main>
  );
}
