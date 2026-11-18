"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { RentalCard } from "@/components/Cards";
import { Filters, DEFAULT_FILTERS, type FilterState } from "@/components/Filters";
import { DetailModal, QUICK_MESSAGES } from "@/components/DetailModal";
import { BundleDrawer } from "@/components/BundleDrawer";
import { useListings, useSaved, useInterests, useBundle, useChecklist, useConversations, useChatMessages, openConversation } from "@/lib/store";
import { DEMO_CITIES } from "@/lib/seed";
import { inr } from "@/lib/bundle";
import type { RentalItem } from "@/lib/types";

export default function RentalsPage() {
  const { rentals, seedDemo, clearDemo, demoLoaded } = useListings();
  const [saved, setSaved] = useSaved();
  const [interests, setInterests] = useInterests();
  const [bundle, setBundle] = useBundle();
  const [, setChecklist] = useChecklist();
  const [convs, setConvs] = useConversations();
  const [chatMsgs, setChatMsgs] = useChatMessages();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RentalItem | null>(null);
  const [interestFor, setInterestFor] = useState<RentalItem | null>(null);
  const [msg, setMsg] = useState(QUICK_MESSAGES[0]);
  const [dates, setDates] = useState({ start: "2026-12-01", end: "2027-06-01" });

  const list = useMemo(() => rentals
    .filter((r) => (!filters.city || r.city === filters.city) && r.pricePerMonth <= filters.maxBudget && (!filters.category || r.category === filters.category) && (!filters.verifiedOnly || r.verified) && (!query || r.title.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => filters.sort === "price" ? a.pricePerMonth - b.pricePerMonth : filters.sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : a.pricePerMonth - b.pricePerMonth), [rentals, filters, query]);

  const addToBundle = (item: RentalItem) => {
    if (bundle.some((b) => b.id === item.id)) return;
    setBundle([...bundle, { kind: "rental", id: item.id, title: item.title, monthly: item.pricePerMonth, deposit: item.deposit }]);
    setChecklist((c) => Array.from(new Set([...c, "bundle"])));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="page-title">Rent household items</h1><p className="text-sm text-ink-500">{list.length} items · from neighbours, by the month</p></div>
        <div className="flex gap-2">
          <Button asChild size="sm"><a href="/list-item">+ List an item</a></Button>
          <Button variant="outline" size="sm" onClick={seedDemo}>Load demo listings</Button>
          {demoLoaded && <Button variant="outline" size="sm" onClick={clearDemo}>Clear demo</Button>}
        </div>
      </div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bed, fridge, washing machine…" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm" />
      <Filters value={filters} onChange={setFilters} cities={DEMO_CITIES} showCategory showBhkGender={false} />
      {list.length === 0 ? (
        <div className="empty-state"><p className="font-semibold">No items match those filters yet.</p><Button className="mt-4" onClick={seedDemo}>Load demo listings</Button></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((r) => (
            <RentalCard key={r.id} item={r} saved={saved.includes(r.id)} onToggleSave={() => setSaved(saved.includes(r.id) ? saved.filter((s) => s !== r.id) : [...saved, r.id])} onOpen={() => setSelected(r)} onBundle={() => addToBundle(r)} onInterest={() => { setMsg(QUICK_MESSAGES[0]); setInterestFor(r); }} />
          ))}
        </div>
      )}
      {selected && (
        <DetailModal title={selected.title} onClose={() => setSelected(null)}>
          <p className="text-ink-600">{selected.locality}, {selected.city} · {selected.category} · {selected.condition}</p>
          <p className="text-lg font-bold">{inr(selected.pricePerMonth)}/mo · deposit {inr(selected.deposit)}</p>
          <p>Owner: {selected.ownerName}</p>
          <label className="field-label">Rental dates
            <span className="mt-1 flex gap-2"><Input type="date" value={dates.start} onChange={(e) => setDates({ ...dates, start: e.target.value })} className="rounded-lg border p-2 text-sm" /><Input type="date" value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} className="rounded-lg border p-2 text-sm" /></span>
          </label>
          <Button variant="outline" onClick={() => { addToBundle(selected); setSelected(null); }} className="w-full">+ Add to move-in bundle</Button>
          <Button className="w-full" onClick={() => { setSelected(null); setInterestFor(selected); }}>Book this item</Button>
        </DetailModal>
      )}
      {interestFor && (
        <DetailModal title={`Book ${interestFor.title}`} onClose={() => setInterestFor(null)}>
          <p className="text-ink-600">{inr(interestFor.pricePerMonth)}/mo · deposit {inr(interestFor.deposit)} · {dates.start} → {dates.end}</p>
          <div className="flex flex-wrap gap-2">{QUICK_MESSAGES.map((m) => <Button key={m} variant={msg === m ? "default" : "outline"} size="sm" onClick={() => setMsg(m)} className="rounded-full">{m}</Button>)}</div>
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full rounded-lg border p-2" />
          <Button className="w-full" onClick={() => { setInterests([...interests, { id: `i-${Date.now()}`, targetType: "rental", targetId: interestFor.id, message: msg, createdAt: new Date().toISOString() }]); openConversation(convs, setConvs, chatMsgs, setChatMsgs, "rental", interestFor.id, `${interestFor.title} — ${interestFor.ownerName}`, interestFor.ownerName, msg); setChecklist((c) => Array.from(new Set([...c, "interest", "chat"]))); setInterestFor(null); }}>Send booking request — opens a chat</Button>
          <p className="text-xs text-ink-500">Pay on pickup / UPI on confirmation in the MVP — live Razorpay comes after KYC.</p>
        </DetailModal>
      )}
      <BundleDrawer items={bundle} onRemove={(id) => setBundle(bundle.filter((b) => b.id !== id))} onClear={() => setBundle([])} />
    </div>
  );
}
