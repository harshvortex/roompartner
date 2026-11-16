"use client";
import type { ScoreBreakdown } from "@/lib/compatibility";

export function CompatRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#0e9f6e" : score >= 70 ? "#65a30d" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}%</div>
    </div>
  );
}

// 7 scored factors, matching lib/compatibility.ts and the synopsis (sum = 100).
// Pets is profile information only and is not scored.
const LABELS: [keyof ScoreBreakdown, string][] = [
  ["budget", "Budget"], ["food", "Food"], ["smoking", "Smoking"], ["sleep", "Sleep"],
  ["cleanliness", "Cleanliness"], ["work", "Work / WFH"], ["guests", "Guests"],
];
const MAX: Record<keyof ScoreBreakdown, number> = { budget: 25, food: 15, smoking: 10, sleep: 15, cleanliness: 15, work: 10, guests: 10 };

export function BreakdownBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="space-y-2">
      {LABELS.map(([key, label]) => (
        <div key={key}>
          <div className="flex justify-between text-xs text-gray-600"><span>{label}</span><span>{breakdown[key]}/{MAX[key]}</span></div>
          <div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-emerald-500" style={{ width: `${(breakdown[key] / MAX[key]) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
