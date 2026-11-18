"use client";
export const CHECKLIST_STEPS = [
  { id: "profile", label: "Complete your match profile" },
  { id: "match", label: "Find a roommate with 70%+ match" },
  { id: "room", label: "Shortlist a broker-free room" },
  { id: "bundle", label: "Build your move-in bundle" },
  { id: "interest", label: "Send your first interest" },
  { id: "chat", label: "Chat with your match" },
  { id: "visit", label: "Visit the place and confirm" },
  { id: "verify", label: "Verify your profile (trust score 42 → 92)" },
];

export function MoveInChecklist({ done, onToggle }: { done: string[]; onToggle: (id: string) => void }) {
  const pct = Math.round((done.length / CHECKLIST_STEPS.length) * 100);
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2">
        <span className="section-title">Move-in Journey</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">{pct}% done</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      <ul className="mt-4 space-y-1">
        {CHECKLIST_STEPS.map((s) => {
          const isDone = done.includes(s.id);
          return (
            <li key={s.id}>
              <button onClick={() => onToggle(s.id)} aria-pressed={isDone} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-surface">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${isDone ? "border-brand-600 bg-brand-600 text-white" : "border-zinc-300 text-transparent"}`}>✓</span>
                <span className={isDone ? "text-ink-400 line-through" : "font-medium text-ink-800"}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
