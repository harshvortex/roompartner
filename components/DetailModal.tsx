"use client";
import type { ReactNode } from "react";

export function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold leading-snug">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg border px-2 py-1 text-sm">✕</button>
        </div>
        <div className="mt-3 space-y-3 text-sm">{children}</div>
      </div>
    </div>
  );
}

export const QUICK_MESSAGES = ["Hi! Is this still available?", "Hi! I’d love to see the place this weekend.", "Hi! My budget and timings match — can we chat?"];
