"use client";
import type { BundleItem } from "@/lib/types";
import { bundleSummary, inr } from "@/lib/bundle";

export function BundleDrawer({ items, onRemove, onClear }: { items: BundleItem[]; onRemove: (id: string) => void; onClear: () => void }) {
  if (items.length === 0) return null;
  const s = bundleSummary(items);
  return (
    <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-slide-up rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-pop sm:bottom-6 lg:bottom-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-extrabold tracking-tight text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-base" aria-hidden="true">🧳</span>
          Move-in Bundle · {s.itemCount} item{s.itemCount > 1 ? "s" : ""}
        </h3>
        <button onClick={onClear} className="text-xs font-medium text-ink-400 underline hover:text-ink-700">Clear</button>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between gap-2"><span className="truncate text-ink-700">{i.title}</span><span className="shrink-0 font-semibold">{inr(i.monthly)}/mo <button onClick={() => onRemove(i.id)} aria-label={`Remove ${i.title} from bundle`} className="ml-1 rounded-full bg-red-50 px-1.5 py-0.5 text-red-600 hover:bg-red-100">✕</button></span></li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-surface-muted p-2"><div className="text-xs text-ink-400">Monthly</div><div className="font-extrabold">{inr(s.monthlyTotal)}</div></div>
        <div className="rounded-xl bg-surface-muted p-2"><div className="text-xs text-ink-400">Deposits</div><div className="font-extrabold">{inr(s.depositTotal)}</div></div>
        <div className="rounded-xl bg-ok-50 p-2"><div className="text-xs text-ok-700">Brokerage saved</div><div className="font-extrabold text-ok-700">{inr(s.brokerageSaved)}</div></div>
      </div>
      <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-center text-sm font-bold text-brand-700">First-month cost: {inr(s.firstMonthCost)}</p>
    </div>
  );
}
