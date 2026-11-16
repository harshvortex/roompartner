"use client";
import type { BundleItem } from "@/lib/types";
import { bundleSummary, inr } from "@/lib/bundle";

export function BundleDrawer({ items, onRemove, onClear }: { items: BundleItem[]; onRemove: (id: string) => void; onClear: () => void }) {
  if (items.length === 0) return null;
  const s = bundleSummary(items);
  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Move-in Bundle · {s.itemCount} item{s.itemCount > 1 ? "s" : ""}</h3>
        <button onClick={onClear} className="text-xs text-gray-500 underline">Clear</button>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.title}</span><span className="shrink-0">{inr(i.monthly)}/mo <button onClick={() => onRemove(i.id)} aria-label="Remove" className="text-red-600">✕</button></span></li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-gray-50 p-2"><div className="text-xs text-gray-500">Monthly</div><div className="font-bold">{inr(s.monthlyTotal)}</div></div>
        <div className="rounded-lg bg-gray-50 p-2"><div className="text-xs text-gray-500">Deposits</div><div className="font-bold">{inr(s.depositTotal)}</div></div>
        <div className="rounded-lg bg-emerald-50 p-2"><div className="text-xs text-emerald-700">Brokerage saved</div><div className="font-bold text-emerald-700">{inr(s.brokerageSaved)}</div></div>
      </div>
      <p className="mt-2 text-center text-sm font-semibold">First-month cost: {inr(s.firstMonthCost)}</p>
    </div>
  );
}
