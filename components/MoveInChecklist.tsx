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
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex justify-between text-sm font-semibold"><span>Move-in Journey</span><span>{pct}%</span></div>
      <div className="mt-2 h-2 rounded bg-gray-100"><div className="h-2 rounded bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
      <ul className="mt-3 space-y-2">
        {CHECKLIST_STEPS.map((s) => (
          <li key={s.id}>
            <button onClick={() => onToggle(s.id)} className="flex w-full items-center gap-2 text-left text-sm">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${done.includes(s.id) ? "bg-emerald-600 text-white border-emerald-600" : "text-gray-400"}`}>{done.includes(s.id) ? "✓" : ""}</span>
              <span className={done.includes(s.id) ? "line-through text-gray-400" : ""}>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
