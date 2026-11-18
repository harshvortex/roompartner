"use client";
import type { ScoreBreakdown } from "@/lib/compatibility";

export function CompatRing({ score, size = 76, tone = "dark" }: { score: number; size?: number; tone?: "dark" | "light" }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#059669" : score >= 70 ? "#4F46E5" : score >= 50 ? "#D97706" : "#DC2626";
  const label = score >= 85 ? "Great match" : score >= 70 ? "Good match" : score >= 50 ? "Okay match" : "Low match";
  const track = tone === "light" ? "rgba(255,255,255,0.25)" : "#EFEFF5";
  const numClass = tone === "light" ? "text-base font-extrabold text-white" : "text-base font-extrabold text-ink-900";
  const labelColor = tone === "light" ? "#FDE68A" : color;
  return (
    <div className="relative shrink-0 text-center" style={{ width: size }} title={`${score}% match — ${label}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke={track} strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={tone === "light" && score >= 70 ? "#FDE68A" : color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className={numClass}>{score}%</span>
        </div>
      </div>
      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color: labelColor }}>{label}</span>
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
    <div className="space-y-2.5">
      {LABELS.map(([key, label]) => (
        <div key={key}>
          <div className="flex justify-between text-xs font-medium text-ink-600"><span>{label}</span><span className="font-bold text-ink-800">{breakdown[key]}<span className="font-normal text-ink-400">/{MAX[key]}</span></span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all" style={{ width: `${(breakdown[key] / MAX[key]) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
