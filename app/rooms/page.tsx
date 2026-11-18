"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RoomCard } from "@/components/Cards";
import { Filters, DEFAULT_FILTERS, type FilterState } from "@/components/Filters";
import { DetailModal, QUICK_MESSAGES } from "@/components/DetailModal";
import { BundleDrawer } from "@/components/BundleDrawer";
import { useListings, useSaved, useInterests, useBundle, useChecklist, useConversations, useChatMessages, useVisits, openConversation } from "@/lib/store";
import { DEMO_CITIES } from "@/lib/seed";
import { suggestedBundle, inr } from "@/lib/bundle";
import type { Room } from "@/lib/types";

function RoomsInner() {
  const params = useSearchParams();
  const { rooms, rentals, seedDemo, clearDemo, demoLoaded } = useListings();
  const [saved, setSaved] = useSaved();
  const [interests, setInterests] = useInterests();
  const [bundle, setBundle] = useBundle();
  const [, setChecklist] = useChecklist();
  const [convs, setConvs] = useConversations();
  const [chatMsgs, setChatMsgs] = useChatMessages();
  const [visits, setVisits] = useVisits();
  const [visitDate, setVisitDate] = useState("2026-12-02");
  const [visitTime, setVisitTime] = useState("11:00");
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, city: params.get("city") || "" });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Room | null>(null);
  const [interestFor, setInterestFor] = useState<Room | null>(null);
  const [msg, setMsg] = useState(QUICK_MESSAGES[0]);

  const list = useMemo(() => rooms
    .filter((r) => (!filters.city || r.city === filters.city) && r.rent <= filters.maxBudget && (!filters.furnishing || r.furnishing === filters.furnishing) && (!filters.verifiedOnly || r.verified) && (!filters.bhk || r.bhk === filters.bhk) && (!filters.gender || r.genderPref === filters.gender || r.genderPref === "any") && (!query || r.title.toLowerCase().includes(query.toLowerCase()) || r.locality.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => filters.sort === "price" ? a.rent - b.rent : filters.sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : filters.sort === "verified" ? Number(b.verified || false) - Number(a.verified || false) : a.rent - b.rent), [rooms, filters, query]);

  const addToBundle = (kind: "room" | "rental", id: string, title: string, monthly: number, deposit: number) => {
    if (bundle.some((b) => b.id === id)) return;
    setBundle([...bundle, { kind, id, title, monthly, deposit }]);
    setChecklist((c) => Array.from(new Set([...c, "bundle"])));
  };
  const sendInterest = () => {
    if (!interestFor) return;
    setInterests([...interests, { id: `i-${Date.now()}`, targetType: "room", targetId: interestFor.id, message: msg, createdAt: new Date().toISOString() }]);
    openConversation(convs, setConvs, chatMsgs, setChatMsgs, "room", interestFor.id, `${interestFor.title} — ${interestFor.ownerName}`, interestFor.ownerName, msg);
    setChecklist((c) => Array.from(new Set([...c, "interest", "room", "chat"])));
    setInterestFor(null);
  };
  const bookVisit = (room: Room) => {
    setVisits([...visits, { id: `v-${Date.now()}`, roomId: room.id, roomTitle: room.title, date: visitDate, time: visitTime, status: "requested", createdAt: new Date().toISOString() }]);
    setChecklist((c) => Array.from(new Set([...c, "visit"])));
  };
  const suggestion = suggestedBundle(rentals.map((r) => ({ id: r.id, title: r.title })));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="page-title">Broker-free rooms</h1><p className="text-sm text-ink-500">{list.length} rooms · ₹0 brokerage on every listing</p></div>
        <div className="flex gap-2">
          <a href="/list-room" className="btn-primary btn-sm">+ List a room</a>
          <button onClick={seedDemo} className="btn-secondary btn-sm">Load demo listings</button>
          {demoLoaded && <button onClick={clearDemo} className="btn-secondary btn-sm">Clear demo</button>}
        </div>
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by locality or title…" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm" />
      <Filters value={filters} onChange={setFilters} cities={DEMO_CITIES} showFurnishing />
      {suggestion.length === 2 && <p className="rounded-xl bg-brand-50 border border-brand-200 p-3 text-sm">💡 Smart suggestion: most movers add a bed + fridge to their bundle. Find them in <a href="/rentals" className="font-medium underline">Rentals</a>.</p>}
      {list.length === 0 ? (
        <div className="empty-state"><p className="font-semibold">No rooms match those filters yet.</p><p className="mt-1 text-sm text-ink-500">Try a different city or a higher budget — or load the demo listings.</p><button onClick={seedDemo} className="mt-4 btn-primary">Load demo listings</button></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((r) => (
            <RoomCard key={r.id} room={r} saved={saved.includes(r.id)} onToggleSave={() => setSaved(saved.includes(r.id) ? saved.filter((s) => s !== r.id) : [...saved, r.id])} onOpen={() => setSelected(r)} onBundle={() => addToBundle("room", r.id, r.title, r.rent, r.deposit)} onInterest={() => { setMsg(QUICK_MESSAGES[0]); setInterestFor(r); }} />
          ))}
        </div>
      )}
      {selected && (
        <DetailModal title={selected.title} onClose={() => setSelected(null)}>
          <p className="text-ink-600">{selected.locality}, {selected.city} · {selected.bhk} · {selected.furnishing} · Available {selected.availableFrom}</p>
          <p className="text-lg font-bold">{inr(selected.rent)}/mo · deposit {inr(selected.deposit)}</p>
          <p className="font-medium text-emerald-700">₹0 brokerage — you save {inr(selected.rent)}</p>
          <p>Gender: {selected.genderPref} · Food: {selected.foodPref} · Smoking: {selected.smokingAllowed ? "allowed" : "not allowed"} · Pets: {selected.petsAllowed ? "allowed" : "not allowed"}</p>
          <p>Amenities: {selected.amenities.join(", ")}</p>
          <p>Owner: {selected.ownerName} {selected.verified ? "· ✓ Verified" : ""}</p>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-sm font-semibold">Book a visit</p>
            <div className="mt-2 flex gap-2">
              <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="flex-1 rounded-lg border p-2 text-sm" />
              <input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} className="rounded-lg border p-2 text-sm" />
              <button onClick={() => { bookVisit(selected); setSelected(null); }} className="btn-primary btn-sm">Book visit</button>
            </div>
            <p className="mt-1 text-xs text-ink-500">Confirm / mark done from the Dashboard → Your visits.</p>
          </div>
          <button onClick={() => { addToBundle("room", selected.id, selected.title, selected.rent, selected.deposit); setSelected(null); }} className="w-full rounded-lg border px-4 py-2 font-medium">+ Add to move-in bundle</button>
          <button onClick={() => { setSelected(null); setInterestFor(selected); }} className="btn-block">Express interest</button>
        </DetailModal>
      )}
      {interestFor && (
        <DetailModal title={`Message the owner`} onClose={() => setInterestFor(null)}>
          <div className="flex flex-wrap gap-2">{QUICK_MESSAGES.map((m) => <button key={m} onClick={() => setMsg(m)} className={`rounded-full border px-3 py-1.5 text-xs ${msg === m ? "bg-brand-600 text-white border-brand-600" : "bg-white"}`}>{m}</button>)}</div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full rounded-lg border p-2" />
          <button onClick={sendInterest} className="btn-block">Send interest</button>
        </DetailModal>
      )}
      <BundleDrawer items={bundle} onRemove={(id) => setBundle(bundle.filter((b) => b.id !== id))} onClear={() => setBundle([])} />
    </div>
  );
}

export default function RoomsPage() {
  return <Suspense fallback={<p className="p-4 text-sm">Loading rooms…</p>}><RoomsInner /></Suspense>;
}
