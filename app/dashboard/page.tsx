"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useListings, useProfile, useTrust, useReports, useVisits, useBundle, useSavedBundles, useChecklist, useServiceRequests, useEscrows, usePurchases } from "@/lib/store";
import { trustScore, trustLabel } from "@/lib/verification";
import { MOVE_IN_SERVICES } from "@/lib/services";
import { PRICING } from "@/lib/pricing";
import { DEMO_BROKERAGE_SAVED } from "@/lib/seed";
import { bundleSummary, inr } from "@/lib/bundle";
import { splitCost as split } from "@/lib/rentSplit";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { autoFlagAll } from "@/lib/moderation";
import { createEscrow, transitionEscrow, nextActions, escrowLabel, type EscrowStatus } from "@/lib/escrow";

export default function DashboardPage() {
  const { roommates, rooms, rentals, seedDemo } = useListings();
  const [profile] = useProfile();
  const [trust, setTrust] = useTrust();
  const [reports, setReports] = useReports();
  const [visits, setVisits] = useVisits();
  const [bundle] = useBundle();
  const [savedBundles, setSavedBundles] = useSavedBundles();
  const [, setChecklist] = useChecklist();
  const [serviceRequests, setServiceRequests] = useServiceRequests();
  const [escrows, setEscrows] = useEscrows();
  const [purchases] = usePurchases();
  const [people, setPeople] = useState(2);
  // v7: automated moderation — rule-based flags over the live listings.
  const autoFlags = useMemo(() => autoFlagAll([
    ...rooms.map((r) => ({ id: r.id, title: r.title, type: "room" as const, text: `${r.title} ${r.locality}`, rent: r.rent, deposit: r.deposit, city: r.city, ownerName: r.ownerName })),
    ...rentals.map((r) => ({ id: r.id, title: r.title, type: "rental" as const, text: r.title, rent: r.pricePerMonth, deposit: r.deposit, city: r.city, ownerName: r.ownerName })),
    ...roommates.map((r) => ({ id: r.id, title: r.name || "Roommate", type: "roommate" as const, text: `${r.name || ""} ${r.bio || ""}`, rent: r.budgetMax, deposit: 0, city: r.city })),
  ]), [rooms, rentals, roommates]);
  const moveEscrow = (id: string, to: EscrowStatus) => setEscrows(escrows.map((e) => (e.id === id ? transitionEscrow(e, to) : e)));
  const createDemoEscrow = () => {
    const room = rooms[0];
    if (!room) return;
    setEscrows([...escrows, createEscrow(room.id, room.title, room.deposit)]);
  };
  const [reportTarget, setReportTarget] = useState("");
  const [reportReason, setReportReason] = useState("Spam / broker listing");
  const profileComplete = Boolean(profile.name && profile.city && profile.occupation);
  const score = trustScore({ phoneVerified: trust.phoneVerified, profileComplete });
  const summary = bundleSummary(bundle);
  const splitResult = split(summary.monthlyTotal || 0, people);
  // FIX: the verified count was a hard-coded demo constant (11) even after the
  // user added listings or cleared the demo. Count it from the live lists.
  const stats = useMemo(() => ({
    listings: roommates.length + rooms.length + rentals.length,
    verified: [...roommates, ...rooms, ...rentals].filter((x) => (x as { verified?: boolean }).verified).length,
    brokerageSaved: DEMO_BROKERAGE_SAVED,
    openReports: reports.filter((r) => r.status === "open").length,
  }), [roommates, rooms, rentals, reports]);

  const verifyPhone = () => {
    // SIMULATED in v5: no real OTP is sent. Real OTP needs MSG91 + TRAI DLT (~10 days).
    setTrust({ phoneVerified: true, verifiedAt: new Date().toISOString() });
    // FIX: the "verify" step of the Move-in Journey checklist was never ticked
    // anywhere, so the checklist could never reach 100%.
    setChecklist((c) => Array.from(new Set([...c, "verify"])));
  };
  const setReportStatus = (id: string, status: "reviewed" | "actioned") =>
    setReports(reports.map((r) => (r.id === id ? { ...r, status } : r)));
  const requestService = (id: string) => {
    if (!serviceRequests.includes(id)) setServiceRequests([...serviceRequests, id]);
  };
  const fileReport = () => {
    if (!reportTarget.trim()) return;
    setReports([...reports, { id: `rep-${Date.now()}`, targetType: "room", targetId: reportTarget.trim(), targetLabel: reportTarget.trim(), reason: reportReason, status: "open", createdAt: new Date().toISOString() }]);
    setReportTarget("");
  };
  const saveBundle = () => {
    if (!bundle.length) return;
    setSavedBundles([...savedBundles, { id: `sb-${Date.now()}`, name: `Bundle ${savedBundles.length + 1} — ${inr(summary.monthlyTotal)}/mo`, items: bundle, savedAt: new Date().toISOString() }]);
  };
  const confirmVisit = (id: string) => setVisits(visits.map((v) => v.id === id ? { ...v, status: "confirmed" } : v));
  const doneVisit = (id: string) => setVisits(visits.map((v) => v.id === id ? { ...v, status: "done" } : v));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="page-title">Dashboard</h1><p className="text-sm text-ink-500">Trust &amp; safety, your visits, rent-split and the production picture.</p></div>
        <button onClick={seedDemo} className="btn-secondary btn-sm">Load production demo (21 items)</button>
      </div>

      <section className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-center shadow-card"><div className="text-xl font-bold">{stats.listings}</div><div className="text-xs text-ink-500">live listings (demo)</div></div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-center shadow-card"><div className="text-xl font-bold">{stats.verified}</div><div className="text-xs text-ink-500">verified</div></div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-center shadow-card"><div className="text-xl font-bold">{inr(stats.brokerageSaved)}</div><div className="text-xs text-ink-500">brokerage saved</div></div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-center shadow-card"><div className="text-xl font-bold">{stats.openReports}</div><div className="text-xs text-ink-500">open reports</div></div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-bold">Trust &amp; Safety Center</h2>
          <p className="mt-2 text-3xl font-bold">{score} <span className="text-sm font-normal text-ink-500">/ 100 — {trustLabel(score)}</span></p>
          <p className="mt-1 text-sm text-ink-600">Base 42 for a new profile · +30 phone verified · +20 profile complete = 92 max. This is a simulated score — not a government ID check. Phone OTP via Supabase Auth is wired (demo OTP in demo mode); real Aadhaar/KYC is still a future step.</p>
          <p className="mt-2 text-sm">Phone: {trust.phoneVerified ? `✓ Verified${trust.verifiedAt ? ` (${new Date(trust.verifiedAt).toLocaleDateString("en-IN")})` : ""}` : "Not verified yet"}</p>
          {!trust.phoneVerified && <button onClick={verifyPhone} className="mt-3 btn-primary">Verify phone (simulated — no OTP sent)</button>}
          <div className="mt-4 border-t pt-3">
            <h3 className="font-semibold">Report a listing</h3>
            <div className="mt-2 flex gap-2">
              <input value={reportTarget} onChange={(e) => setReportTarget(e.target.value)} placeholder="Listing title or ID…" className="flex-1 rounded-lg border p-2 text-sm" />
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="rounded-lg border p-2 text-sm"><option>Spam / broker listing</option><option>Fake photos</option><option>Wrong price</option><option>Harassment</option><option>Other</option></select>
              <button onClick={fileReport} className="btn-secondary btn-sm">Report</button>
            </div>
            <h3 className="mt-4 font-semibold">Moderation queue ({reports.length})</h3>
            {reports.length === 0 ? <p className="text-sm text-ink-500">No reports yet. Reports filed here go to the moderation queue.</p> : (
              <ul className="mt-2 divide-y text-sm">{reports.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{r.targetLabel} — {r.reason}</span><span className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "open" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{r.status}</span>{r.status === "open" && <button onClick={() => setReportStatus(r.id, "reviewed")} className="btn-secondary btn-sm">Review</button>}{r.status === "reviewed" && <button onClick={() => setReportStatus(r.id, "actioned")} className="btn-secondary btn-sm">Take action</button>}</span></li>
              ))}</ul>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="font-bold">Rent Split Calculator</h2>
          <p className="mt-1 text-sm text-ink-600">Bundle monthly total: <b>{inr(summary.monthlyTotal)}</b> ({summary.itemCount} items) · Deposits {inr(summary.depositTotal)} · First month {inr(summary.firstMonthCost)}</p>
          <label className="mt-3 field-label">Split between
            <input type="number" min={1} max={6} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="mt-1 w-24 rounded-lg border p-2 text-sm" />
          </label>
          <p className="mt-2 text-lg font-bold">{inr(splitResult.perPerson)} <span className="text-sm font-normal text-ink-500">per person / month</span></p>
          <button onClick={saveBundle} disabled={!bundle.length} className="mt-3 btn-primary disabled:bg-zinc-300">Save this bundle (persistent)</button>
          {savedBundles.length > 0 && <ul className="mt-3 divide-y text-sm">{savedBundles.map((b) => <li key={b.id} className="py-2">{b.name} · {b.items.length} items · saved {new Date(b.savedAt).toLocaleDateString("en-IN")}</li>)}</ul>}
          <div className="mt-4 border-t pt-3">
            <h3 className="font-semibold">Move-in Services</h3>
            <ul className="mt-2 space-y-2 text-sm">{MOVE_IN_SERVICES.map((s) => <li key={s.id} className="flex items-center justify-between gap-2"><span><b>{s.name}</b> — {s.detail} <span className="text-ink-500">({s.note})</span></span><span className="flex shrink-0 items-center gap-2"><b>from {inr(s.priceFrom)}</b>{serviceRequests.includes(s.id) ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Requested (demo)</span> : <button onClick={() => requestService(s.id)} className="btn-secondary btn-sm">Request</button>}</span></li>)}</ul>
            <p className="mt-2 text-xs text-ink-500">Partner referrals — the platform does not operate these services itself. Requests are recorded in demo mode only; no partner is contacted and no payment is taken.</p>
          </div>
        </section>
      </div>

      <section className="card">
        <h2 className="font-bold">Your visits ({visits.length})</h2>
        {visits.length === 0 ? <p className="mt-2 text-sm text-ink-500">No visits booked yet. Book a visit from a room&apos;s detail view in the live app — in this codebase, visits are created from the Rooms page flow and confirmed here.</p> : (
          <ul className="mt-2 divide-y text-sm">{visits.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{v.roomTitle} · {v.date} {v.time} · <b>{v.status}</b></span><span className="flex gap-2">{v.status === "requested" && <button onClick={() => confirmVisit(v.id)} className="btn-secondary btn-sm">Confirm</button>}{v.status === "confirmed" && <button onClick={() => doneVisit(v.id)} className="btn-primary btn-sm">Mark done</button>}</span></li>
          ))}</ul>
        )}
        <p className="mt-3 text-sm text-ink-500">Book a visit: open any room in <Link href="/rooms" className="font-medium underline">Rooms</Link>, open its details and use “Book a visit” — the visit lands here, where you confirm it and mark it done.</p>
      </section>

      <section className="card">
        <h2 className="font-bold">Pricing — structure, not live billing</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-3"><p className="font-semibold">{PRICING.seekerPass.name}</p><p className="text-lg font-bold">₹{PRICING.seekerPass.price}{PRICING.seekerPass.period}</p><p className="text-xs text-ink-500">{PRICING.seekerPass.note}</p><RazorpayCheckout product="seekerPass" /></div>
          <div className="rounded-xl border p-3"><p className="font-semibold">{PRICING.verification.name}</p><p className="text-lg font-bold">₹{PRICING.verification.price} {PRICING.verification.period}</p><p className="text-xs text-ink-500">{PRICING.verification.note}</p><RazorpayCheckout product="verification" /></div>
          <div className="rounded-xl border p-3"><p className="font-semibold">{PRICING.ownerBoost.name}</p><p className="text-lg font-bold">₹{PRICING.ownerBoost.price}{PRICING.ownerBoost.period}</p><p className="text-xs text-ink-500">{PRICING.ownerBoost.note}</p><RazorpayCheckout product="ownerBoost" /></div>
        </div>
        <p className="mt-2 text-xs text-ink-500">Razorpay TEST MODE ONLY — test card / demo simulation, no real charge. Live keys are refused by the server until business KYC is done. Never charge brokerage or a % of rent/deposit.</p>
        {purchases.length > 0 && <p className="mt-2 text-xs text-emerald-700">Purchases recorded (test/demo): {purchases.join(", ")}</p>}
      </section>

      <section className="card">
        <h2 className="font-bold">Deposit Escrow — demo only, no real money</h2>
        <p className="mt-1 text-sm text-ink-600">Created → Held → Released / Refunded (or Disputed). Real escrow needs a licensed escrow partner and KYC — this is a demo state machine only.</p>
        <button onClick={createDemoEscrow} disabled={!rooms.length} className="mt-3 btn-primary disabled:bg-zinc-300">Create demo escrow for first room (deposit)</button>
        {escrows.length === 0 ? <p className="mt-2 text-sm text-ink-500">No escrows yet.</p> : (
          <ul className="mt-3 divide-y text-sm">{escrows.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>{e.roomTitle} · deposit {inr(e.amount)} · <b>{escrowLabel(e.status)}</b></span>
              <span className="flex gap-2">{nextActions(e.status).map((to) => <button key={to} onClick={() => moveEscrow(e.id, to)} className="btn-secondary btn-sm capitalize">{to}</button>)}</span>
            </li>
          ))}</ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-bold">Automated moderation — rule-based flags</h2>
        <p className="mt-1 text-sm text-ink-600">Listings are auto-flagged for banned phrases, suspicious prices and missing city. A flag does not delete a listing — it goes to the queue above for a human to review.</p>
        {autoFlags.length === 0 ? <p className="mt-2 text-sm text-ink-500">No auto-flags on the current listings.</p> : (
          <ul className="mt-3 divide-y text-sm">{autoFlags.map((f, i) => (
            <li key={`${f.targetId}-${i}`} className="py-2"><b>{f.targetLabel}</b> — {f.reason} <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{f.severity}</span></li>
          ))}</ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-bold">Production &amp; Hosting</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Mobile-first, light design only — pinned to light so dark-mode phones never flip it black.</li>
          <li>Demo mode: seed data + localStorage, no keys needed. With Supabase keys, lists come from Postgres (see supabase/schema.sql).</li>
          <li>Deploy: push to GitHub → import in Vercel → set NEXT_PUBLIC_SUPABASE_URL / ANON_KEY → deploy. Cost ~$45/mo (Vercel Pro $20 + Supabase Pro $25) once you take real users; $0 on free tiers for a demo.</li>
          <li>v9 code is ready for: Supabase Auth (Google + phone OTP), Razorpay test-mode checkout, Realtime chat, rule-based auto-moderation, demo escrow, Privacy &amp; Terms. Still NOT live: real payments (needs Razorpay KYC), real OTP (MSG91/DLT), Aadhaar/KYC (needs UIDAI approval), real listings. Those need accounts / approvals (days–weeks).</li>
        </ul>
      </section>
    </div>
  );
}
