"use client";

/** Global error boundary — a failed page render shows this instead of a
 * blank screen or a stack trace. The error detail is logged server-side;
 * nothing technical is shown to the user. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm" role="alert">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">
        RoomPartner hit an unexpected error. Your saved data is still in your browser — try again, or go back home.
      </p>
      {error?.digest ? <p className="mt-2 text-xs text-gray-400">Reference: {error.digest}</p> : null}
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={reset} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Try again
        </button>
        <a href="/" className="rounded-lg border px-4 py-2 text-sm font-medium">
          Go home
        </a>
      </div>
    </div>
  );
}
