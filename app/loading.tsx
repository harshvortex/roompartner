/** Route loading state — shown while a page segment loads, so navigation
 * never looks dead. */
export default function LoadingPage() {
  return (
    <div className="mx-auto max-w-6xl" role="status" aria-live="polite">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border bg-white" />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">Loading RoomPartner…</p>
    </div>
  );
}
