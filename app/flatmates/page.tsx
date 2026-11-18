"use client";
import { useMemo, useState } from "react";
import { RoommateCard } from "@/components/Cards";
import { Filters, DEFAULT_FILTERS, type FilterState } from "@/components/Filters";
import { CompatRing, BreakdownBars } from "@/components/CompatRing";
import { DetailModal, QUICK_MESSAGES } from "@/components/DetailModal";
import { compatibilityScore, matchLabel } from "@/lib/compatibility";
import { useListings, useProfile, useSaved, useInterests, useChecklist, useConversations, useChatMessages, openConversation } from "@/lib/store";
import { DEMO_CITIES } from "@/lib/seed";
import type { RoommateProfile } from "@/lib/types";
import { inr } from "@/lib/bundle";

export default function FlatmatesPage() {
  const { roommates, seedDemo, clearDemo, demoLoaded } = useListings();
  const [profile] = useProfile();
  const [saved, setSaved] = useSaved();
  const [interests, setInterests] = useInterests();
  const [, setChecklist] = useChecklist();
  const [convs, setConvs] = useConversations();
  const [chatMsgs, setChatMsgs] = useChatMessages();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RoommateProfile | null>(null);
  const [interestFor, setInterestFor] = useState<RoommateProfile | null>(null);
  const [msg, setMsg] = useState(QUICK_MESSAGES[0]);

  const scored = useMemo(() => roommates
    .filter((p) => (!filters.city || p.city === filters.city) && p.budgetMax <= filters.maxBudget + 5000 && (!filters.verifiedOnly || p.verified) && (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.city.toLowerCase().includes(query.toLowerCase())))
    .map((p) => ({ p, result: compatibilityScore(profile, p) }))
    .sort((a, b) => filters.sort === "verified" ? Number(b.p.verified || false) - Number(a.p.verified || false) : filters.sort === "price" ? a.p.budgetMax - b.p.budgetMax : b.result.score - a.result.score), [roommates, filters, query, profile]);

  const toggleSave = (id: string) => setSaved(saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]);
  const sendInterest = () => {
    if (!interestFor) return;
    setInterests([...interests, { id: `i-${Date.now()}`, targetType: "roommate", targetId: interestFor.id, message: msg, createdAt: new Date().toISOString() }]);
    openConversation(convs, setConvs, chatMsgs, setChatMsgs, "roommate", interestFor.id, `${interestFor.name} — flatmate match`, interestFor.name, msg);
    setChecklist((c) => Array.from(new Set([...c, "interest", "match", "chat"])));
    setInterestFor(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="page-title">Compatible flatmates</h1><p className="text-sm text-ink-500">{scored.length} people · ranked by your profile</p></div>
        <div className="flex gap-2">
          <button onClick={seedDemo} className="btn-secondary btn-sm">Load demo listings</button>
          {demoLoaded && <button onClick={clearDemo} className="btn-secondary btn-sm">Clear demo</button>}
        </div>
      </div>
      {!profile.name && <p className="callout-amber">Complete your match profile to get real scores — <a href="/onboarding" className="font-medium underline">complete profile →</a></p>}
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or city…" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm" />
      <Filters value={filters} onChange={setFilters} cities={DEMO_CITIES} showBhkGender={false} />
      {scored.length === 0 ? (
        <div className="empty-state"><p className="font-semibold">No flatmates match those filters yet.</p><p className="mt-1 text-sm text-ink-500">Try widening the budget or clearing the city filter — or load the demo listings.</p><button onClick={seedDemo} className="mt-4 btn-primary">Load demo listings</button></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {scored.map(({ p, result }) => (
            <RoommateCard key={p.id} person={p} score={result.score} saved={saved.includes(p.id)} onToggleSave={() => toggleSave(p.id)} onOpen={() => setSelected(p)} onInterest={() => { setMsg(QUICK_MESSAGES[0]); setInterestFor(p); }} />
          ))}
        </div>
      )}
      {selected && (
        <DetailModal title={`${selected.name}, ${selected.age}`} onClose={() => setSelected(null)}>
          {(() => { const r = compatibilityScore(profile, selected); return (<>
            <div className="flex items-center gap-4"><CompatRing score={r.score} /><div><p className="font-bold">{r.score}% — {matchLabel(r.score)}</p><p className="text-ink-500">{selected.occupation} · {selected.city}</p><p className="text-ink-500">Budget {inr(selected.budgetMin)}–{inr(selected.budgetMax)} · moves {selected.moveInDate}</p></div></div>
            <BreakdownBars breakdown={r.breakdown} />
            {r.notes.length > 0 && <p className="text-ink-600">{r.notes.join(" · ")}</p>}
            <p>{selected.bio}</p>
            <p className="text-ink-600">Food: {selected.food} · Smoking: {selected.smoking} · Sleep {selected.sleepTime}–{selected.wakeTime} · Cleanliness {selected.cleanliness}/5 · WFH: {selected.wfh} · Pets: {selected.pets} · Guests: {selected.guestsOk} · {selected.languages.join(", ")}</p>
            <p>{selected.phoneVerified ? "✓ Phone verified" : "Phone not verified yet"}</p>
            <button onClick={() => { setSelected(null); setInterestFor(selected); }} className="btn-block">Express interest</button>
          </>); })()}
        </DetailModal>
      )}
      {interestFor && (
        <DetailModal title={`Message ${interestFor.name}`} onClose={() => setInterestFor(null)}>
          <div className="flex flex-wrap gap-2">{QUICK_MESSAGES.map((m) => <button key={m} onClick={() => setMsg(m)} className={`rounded-full border px-3 py-1.5 text-xs ${msg === m ? "bg-brand-600 text-white border-brand-600" : "bg-white"}`}>{m}</button>)}</div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full rounded-lg border p-2" />
          <button onClick={sendInterest} className="btn-block">Send interest — opens a chat</button>
          <p className="text-xs text-ink-500">Your phone number stays hidden until you both agree to chat. Find the thread in <a href="/chats" className="underline">Chats</a>.</p>
        </DetailModal>
      )}
    </div>
  );
}
