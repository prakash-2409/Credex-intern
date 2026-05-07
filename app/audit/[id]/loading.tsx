export default function AuditLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8" aria-live="polite" aria-busy="true">
      <div className="h-36 animate-pulse rounded-[1.75rem] border border-border bg-surface" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="h-80 animate-pulse rounded-[1.75rem] border border-border bg-surface" />
        <div className="h-80 animate-pulse rounded-[1.75rem] border border-border bg-surface" />
      </div>
      <div className="h-52 animate-pulse rounded-[1.75rem] border border-border bg-surface" />
    </div>
  );
}
