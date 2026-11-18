/** 404 page — every unknown route lands here, never on a blank page. */
export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl empty-state shadow-sm">
      <h1 className="text-xl font-extrabold tracking-tight">Page not found (404)</h1>
      <p className="mt-2 text-sm text-ink-600">
        That page does not exist on RoomPartner. It may have been moved, or the link may be wrong.
      </p>
      <a href="/" className="mt-4 inline-block btn-primary">
        Go home →
      </a>
    </div>
  );
}
