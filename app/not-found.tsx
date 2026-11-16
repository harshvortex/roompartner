/** 404 page — every unknown route lands here, never on a blank page. */
export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold">Page not found (404)</h1>
      <p className="mt-2 text-sm text-gray-600">
        That page does not exist on RoomPartner. It may have been moved, or the link may be wrong.
      </p>
      <a href="/" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
        Go home →
      </a>
    </div>
  );
}
