"use client";
import type { ReactNode } from "react";

export function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[92vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-3xl bg-white shadow-pop sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-zinc-100 bg-white/95 px-5 pb-3 pt-5 backdrop-blur">
          <h2 className="text-lg font-extrabold leading-snug tracking-tight text-ink-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-600 transition hover:bg-zinc-200 hover:text-ink-900">✕</button>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm">{children}</div>
      </div>
    </div>
  );
}

export const QUICK_MESSAGES = ["Hi! Is this still available?", "Hi! I’d love to see the place this weekend.", "Hi! My budget and timings match — can we chat?"];
