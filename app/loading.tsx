/** Route loading state — shown while a page segment loads, so navigation
 * never looks dead. Skeleton mirrors the listing-card grid. */
export default function LoadingPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-up" role="status" aria-live="polite">
      <div className="skeleton-shimmer h-9 w-64 rounded-xl" />
      <div className="skeleton-shimmer mt-2 h-4 w-96 max-w-full rounded-lg" />
      <div className="skeleton-shimmer mt-5 h-28 rounded-2xl" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
            <div className="skeleton-shimmer h-24 rounded-none" />
            <div className="space-y-2.5 p-5">
              <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
              <div className="skeleton-shimmer h-3 w-1/2 rounded-lg" />
              <div className="skeleton-shimmer h-6 w-1/3 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-500">Loading RoomPartner…</p>
    </div>
  );
}
