import type { BundleItem } from "./types";

export interface BundleSummary {
  monthlyTotal: number;
  depositTotal: number;
  firstMonthCost: number;
  brokerageSaved: number;
  itemCount: number;
}

/** Move-in Bundle calculator: room rent + rental items, deposits, and brokerage saved (1 month's rent, since no broker). */
export function bundleSummary(items: BundleItem[]): BundleSummary {
  const monthlyTotal = items.reduce((s, i) => s + i.monthly, 0);
  const depositTotal = items.reduce((s, i) => s + i.deposit, 0);
  const room = items.find((i) => i.kind === "room");
  return {
    monthlyTotal,
    depositTotal,
    firstMonthCost: monthlyTotal + depositTotal,
    brokerageSaved: room ? room.monthly : 0, // no broker = one month's rent saved
    itemCount: items.length,
  };
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Smart suggestion: a bed + fridge is the most common first move-in combo. */
export function suggestedBundle(rentals: { id: string; title: string }[]): string[] {
  const bed = rentals.find((r) => /bed/i.test(r.title));
  const fridge = rentals.find((r) => /fridge|refrigerator/i.test(r.title));
  return [bed?.id, fridge?.id].filter(Boolean) as string[];
}
