/** Rent Split Calculator: split room rent + bundled rentals fairly between flatmates. */
export function splitCost(monthlyTotal: number, people: number): { perPerson: number; total: number; people: number } {
  const n = Math.max(1, Math.floor(people) || 1);
  return { perPerson: Math.round(monthlyTotal / n), total: monthlyTotal, people: n };
}
export function splitByShare(monthlyTotal: number, shares: number[]): number[] {
  const total = shares.reduce((a, b) => a + b, 0) || 1;
  return shares.map((s) => Math.round((monthlyTotal * s) / total));
}
