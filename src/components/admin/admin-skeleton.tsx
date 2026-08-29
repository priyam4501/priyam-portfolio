// Shown while the admin session check resolves. Deliberately generic —
// no sidebar nav labels, no topbar, nothing that hints at the admin UI
// structure. Just an unbranded loading state.
export function AdminSkeleton() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-label="Checking access"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4 px-6">
        <div className="size-8 rounded-full border-2 border-border border-t-accent motion-safe:animate-spin" />
        <div className="h-3 w-40 animate-pulse rounded bg-surface" />
        <div className="h-3 w-24 animate-pulse rounded bg-surface" />
        <span className="sr-only">Checking access…</span>
      </div>
    </div>
  );
}
