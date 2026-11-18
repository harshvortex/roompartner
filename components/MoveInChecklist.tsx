"use client";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Move-in Journey</CardTitle>
        <Badge variant="secondary" className="bg-brand-50 text-brand-700">{pct}% done</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        <ul className="mt-4 space-y-1">
          {CHECKLIST_STEPS.map((s) => {
            const isDone = done.includes(s.id);
            return (
              <li key={s.id}>
                <button onClick={() => onToggle(s.id)} aria-pressed={isDone} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-surface">
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition", isDone ? "border-primary bg-primary text-primary-foreground" : "border-zinc-300 text-transparent")}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={isDone ? "text-ink-400 line-through" : "font-medium text-ink-800"}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
