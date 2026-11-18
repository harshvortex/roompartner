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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ShieldCheck } from "lucide-react";

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
        <div>
          <p className="eyebrow">Your home base</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Trust &amp; safety, your visits, rent-split and the production picture.</p>
        </div>
        <Button variant="outline" size="sm" onClick={seedDemo}>Load production demo (21 items)</Button>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [stats.listings, "live listings (demo)"],
          [stats.verified, "verified"],
          [inr(stats.brokerageSaved), "brokerage saved"],
          [stats.openReports, "open reports"],
        ].map(([v, l]) => (
          <Card key={l as string} className="p-4 text-center">
            <div className="text-2xl font-extrabold tracking-tight">{v}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{l}</div>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-600" /> Trust &amp; Safety Center</CardTitle>
            <CardDescription>How much others can trust your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{score} <span className="text-sm font-normal text-ink-500">/ 100 — {trustLabel(score)}</span></p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Trust score">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-500 transition-all" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-1 text-sm text-ink-600">Base 42 for a new profile · +30 phone verified · +20 profile complete = 92 max. This is a simulated score — not a government ID check. Phone OTP via Supabase Auth is wired (demo OTP in demo mode); real Aadhaar/KYC is still a future step.</p>
            <p className="mt-2 text-sm">Phone: {trust.phoneVerified ? `✓ Verified${trust.verifiedAt ? ` (${new Date(trust.verifiedAt).toLocaleDateString("en-IN")})` : ""}` : "Not verified yet"}</p>
            {!trust.phoneVerified && <Button onClick={verifyPhone} className="mt-3">Verify phone (simulated — no OTP sent)</Button>}
            <div className="mt-4 border-t pt-3">
              <h3 className="font-semibold">Report a listing</h3>
              <div className="mt-2 flex gap-2">
                <Input value={reportTarget} onChange={(e) => setReportTarget(e.target.value)} placeholder="Listing title or ID…" className="flex-1" />
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spam / broker listing">Spam / broker listing</SelectItem>
                    <SelectItem value="Fake photos">Fake photos</SelectItem>
                    <SelectItem value="Wrong price">Wrong price</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fileReport}>Report</Button>
              </div>
              <h3 className="mt-4 font-semibold">Moderation queue ({reports.length})</h3>
              {reports.length === 0 ? <p className="text-sm text-ink-500">No reports yet. Reports filed here go to the moderation queue.</p> : (
                <ul className="mt-2 divide-y text-sm">{reports.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{r.targetLabel} — {r.reason}</span><span className="flex items-center gap-2"><Badge variant={r.status === "open" ? "warning" : "success"}>{r.status}</Badge>{r.status === "open" && <Button variant="outline" size="sm" onClick={() => setReportStatus(r.id, "reviewed")}>Review</Button>}{r.status === "reviewed" && <Button variant="outline" size="sm" onClick={() => setReportStatus(r.id, "actioned")}>Take action</Button>}</span></li>
                ))}</ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rent Split Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-600">Bundle monthly total: <b>{inr(summary.monthlyTotal)}</b> ({summary.itemCount} items) · Deposits {inr(summary.depositTotal)} · First month {inr(summary.firstMonthCost)}</p>
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="split-people">Split between</Label>
              <Input id="split-people" type="number" min={1} max={6} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="w-24" />
            </div>
            <p className="mt-2 text-lg font-bold">{inr(splitResult.perPerson)} <span className="text-sm font-normal text-ink-500">per person / month</span></p>
            <Button onClick={saveBundle} disabled={!bundle.length} className="mt-3">Save this bundle (persistent)</Button>
            {savedBundles.length > 0 && <ul className="mt-3 divide-y text-sm">{savedBundles.map((b) => <li key={b.id} className="py-2">{b.name} · {b.items.length} items · saved {new Date(b.savedAt).toLocaleDateString("en-IN")}</li>)}</ul>}
            <div className="mt-4 border-t pt-3">
              <h3 className="font-semibold">Move-in Services</h3>
              <ul className="mt-2 space-y-2 text-sm">{MOVE_IN_SERVICES.map((s) => <li key={s.id} className="flex items-center justify-between gap-2"><span><b>{s.name}</b> — {s.detail} <span className="text-ink-500">({s.note})</span></span><span className="flex shrink-0 items-center gap-2"><b>from {inr(s.priceFrom)}</b>{serviceRequests.includes(s.id) ? <Badge variant="success">Requested (demo)</Badge> : <Button variant="outline" size="sm" onClick={() => requestService(s.id)}>Request</Button>}</span></li>)}</ul>
              <p className="mt-2 text-xs text-ink-500">Partner referrals — the platform does not operate these services itself. Requests are recorded in demo mode only; no partner is contacted and no payment is taken.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-brand-600" /> Your visits ({visits.length})</CardTitle>
          <CardDescription>Visits you booked — confirm them, then mark them done.</CardDescription>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p className="mt-2 font-semibold">No visits booked yet</p>
              <p className="mt-1 text-sm text-ink-500">Open any room, check its details and book a visit — it lands here.</p>
              <Button asChild className="mt-4"><Link href="/rooms">Browse rooms</Link></Button>
            </div>
          ) : (
            <ul className="divide-y text-sm">{visits.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{v.roomTitle} · {v.date} {v.time} · <b>{v.status}</b></span><span className="flex gap-2">{v.status === "requested" && <Button variant="outline" size="sm" onClick={() => confirmVisit(v.id)}>Confirm</Button>}{v.status === "confirmed" && <Button size="sm" onClick={() => doneVisit(v.id)}>Mark done</Button>}</span></li>
            ))}</ul>
          )}
          <p className="mt-3 text-sm text-ink-500">Visits are booked from a room&apos;s detail view — open any room in <Link href="/rooms" className="font-medium underline">Rooms</Link> and use “Book a visit”.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing — structure, not live billing</CardTitle>
          <CardDescription>What each plan costs, before any payment is taken.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="font-semibold">{PRICING.seekerPass.name}</p><p className="text-lg font-bold">₹{PRICING.seekerPass.price}{PRICING.seekerPass.period}</p><p className="text-xs text-ink-500">{PRICING.seekerPass.note}</p><RazorpayCheckout product="seekerPass" /></Card>
            <Card className="p-4"><p className="font-semibold">{PRICING.verification.name}</p><p className="text-lg font-bold">₹{PRICING.verification.price} {PRICING.verification.period}</p><p className="text-xs text-ink-500">{PRICING.verification.note}</p><RazorpayCheckout product="verification" /></Card>
            <Card className="p-4"><p className="font-semibold">{PRICING.ownerBoost.name}</p><p className="text-lg font-bold">₹{PRICING.ownerBoost.price}{PRICING.ownerBoost.period}</p><p className="text-xs text-ink-500">{PRICING.ownerBoost.note}</p><RazorpayCheckout product="ownerBoost" /></Card>
          </div>
          <p className="mt-2 text-xs text-ink-500">Razorpay TEST MODE ONLY — test card / demo simulation, no real charge. Live keys are refused by the server until business KYC is done. Never charge brokerage or a % of rent/deposit.</p>
          {purchases.length > 0 && <p className="mt-2 text-xs text-emerald-700">Purchases recorded (test/demo): {purchases.join(", ")}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Escrow <Badge variant="secondary" className="ml-1">demo only, no real money</Badge></CardTitle>
          <CardDescription>Created → Held → Released / Refunded (or Disputed). Real escrow needs a licensed escrow partner and KYC — this is a demo state machine only.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={createDemoEscrow} disabled={!rooms.length}>Create demo escrow for first room (deposit)</Button>
          {escrows.length === 0 ? <p className="mt-2 text-sm text-ink-500">No escrows yet.</p> : (
            <ul className="mt-3 divide-y text-sm">{escrows.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{e.roomTitle} · deposit {inr(e.amount)} · <b>{escrowLabel(e.status)}</b></span>
                <span className="flex gap-2">{nextActions(e.status).map((to) => <Button key={to} variant="outline" size="sm" onClick={() => moveEscrow(e.id, to)} className="capitalize">{to}</Button>)}</span>
              </li>
            ))}</ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated moderation — rule-based flags</CardTitle>
          <CardDescription>Listings are auto-flagged for banned phrases, suspicious prices and missing city. A flag does not delete a listing — it goes to the queue above for a human to review.</CardDescription>
        </CardHeader>
        <CardContent>
          {autoFlags.length === 0 ? <p className="text-sm text-ink-500">No auto-flags on the current listings.</p> : (
            <ul className="divide-y text-sm">{autoFlags.map((f, i) => (
              <li key={`${f.targetId}-${i}`} className="py-2"><b>{f.targetLabel}</b> — {f.reason} <Badge variant="warning">{f.severity}</Badge></li>
            ))}</ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production &amp; Hosting</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
            <li>Mobile-first, light design only — pinned to light so dark-mode phones never flip it black.</li>
            <li>Demo mode: seed data + localStorage, no keys needed. With Supabase keys, lists come from Postgres (see supabase/schema.sql).</li>
            <li>Deploy: push to GitHub → import in Vercel → set NEXT_PUBLIC_SUPABASE_URL / ANON_KEY → deploy. Cost ~$45/mo (Vercel Pro $20 + Supabase Pro $25) once you take real users; $0 on free tiers for a demo.</li>
            <li>v11 code is ready for: Supabase Auth (email magic link + password, Google + phone OTP), Razorpay test-mode checkout, Realtime chat, rule-based auto-moderation, demo escrow, Privacy &amp; Terms. Still NOT live: real payments (needs Razorpay KYC), real OTP (MSG91/DLT), Aadhaar/KYC (needs UIDAI approval), real listings. Those need accounts / approvals (days–weeks).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
