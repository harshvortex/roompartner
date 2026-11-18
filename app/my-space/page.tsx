"use client";
import Link from "next/link";
import { MoveInChecklist } from "@/components/MoveInChecklist";
import { BundleDrawer } from "@/components/BundleDrawer";
import { bundleSummary, inr } from "@/lib/bundle";
import { useListings, useSaved, useInterests, useBundle, useChecklist, useProfile, removeMyListing, setMyRoomStatus } from "@/lib/store";
import { DEMO_ROOMS, DEMO_RENTALS } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Mail, Package } from "lucide-react";

export default function MySpacePage() {
  const { roommates, rooms, rentals, setRooms, setRentals } = useListings();
  // Your own listings are the ones you created via /list-room or /list-item —
  // demo seed listings are not yours and cannot be paused or deleted here.
  const myRooms = rooms.filter((r) => !DEMO_ROOMS.some((d) => d.id === r.id));
  const myRentals = rentals.filter((r) => !DEMO_RENTALS.some((d) => d.id === r.id));
  const deleteRoom = (id: string) => { removeMyListing("room", id); setRooms(rooms.filter((r) => r.id !== id)); };
  const deleteRental = (id: string) => { removeMyListing("rental", id); setRentals(rentals.filter((r) => r.id !== id)); };
  const changeRoomStatus = (id: string, status: "active" | "paused" | "filled") => { setMyRoomStatus(id, status); setRooms(rooms.map((r) => (r.id === id ? { ...r, status } : r))); };
  const [saved, setSaved] = useSaved();
  const [interests] = useInterests();
  const [bundle, setBundle] = useBundle();
  const [checklist, setChecklist] = useChecklist();
  const [profile] = useProfile();
  const summary = bundleSummary(bundle);
  const all = [
    ...roommates.map((r) => ({ id: r.id, title: `${r.name}, ${r.age}`, sub: `${r.occupation} · ${r.city}`, href: "/flatmates" })),
    ...rooms.map((r) => ({ id: r.id, title: r.title, sub: `${r.locality}, ${r.city} · ${inr(r.rent)}/mo`, href: "/rooms" })),
    ...rentals.map((r) => ({ id: r.id, title: r.title, sub: `${r.locality}, ${r.city} · ${inr(r.pricePerMonth)}/mo`, href: "/rentals" })),
  ];
  const savedItems = all.filter((a) => saved.includes(a.id));
  const toggleChecklist = (id: string) => setChecklist(checklist.includes(id) ? checklist.filter((c) => c !== id) : [...checklist, id]);

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Your space</p>
        <h1 className="page-title">My Space</h1>
        <p className="page-sub">{profile.name ? `Welcome back, ${profile.name}.` : "Complete your profile to get personalised matches."} {profile.city ? `· ${profile.city} · budget ${inr(profile.budgetMin)}–${inr(profile.budgetMax)}` : ""}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <MoveInChecklist done={checklist} onToggle={toggleChecklist} />
        <Card>
          <CardHeader>
            <CardTitle>Move-in Bundle summary</CardTitle>
            <CardDescription>Everything you bundled for the move, in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            {bundle.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Package className="h-6 w-6 text-brand-600" /></div>
                <p className="mt-2 font-semibold">Nothing bundled yet</p>
                <p className="mt-1 text-sm text-ink-500">Add a room or rental with + Bundle and it shows up here.</p>
                <Button asChild className="mt-4"><Link href="/rooms">Browse rooms</Link></Button>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p>Items: {summary.itemCount} · Monthly: <b>{inr(summary.monthlyTotal)}</b></p>
                <p>Deposits: <b>{inr(summary.depositTotal)}</b> · First month: <b>{inr(summary.firstMonthCost)}</b></p>
                <p className="font-medium text-emerald-700">Brokerage saved: {inr(summary.brokerageSaved)}</p>
              </div>
            )}
            <div className="mt-3 flex gap-2"><Button asChild size="sm"><Link href="/rooms">Browse rooms</Link></Button><Button asChild variant="outline" size="sm"><Link href="/rentals">Browse rentals</Link></Button></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-brand-600" /> Saved shortlist ({savedItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {savedItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Heart className="h-6 w-6 text-brand-600" /></div>
              <p className="mt-2 font-semibold">Nothing saved yet</p>
              <p className="mt-1 text-sm text-ink-500">Tap ♡ Save on any flatmate, room or rental to keep it here.</p>
              <Button asChild className="mt-4"><Link href="/flatmates">Find flatmates</Link></Button>
            </div>
          ) : (
            <ul className="divide-y text-sm">{savedItems.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-2"><span><Link href={s.href} className="font-medium underline">{s.title}</Link> <span className="text-ink-500">— {s.sub}</span></span><Button variant="ghost" size="sm" onClick={() => setSaved(saved.filter((x) => x !== s.id))} className="text-xs text-red-600 hover:text-red-700">Remove</Button></li>
            ))}</ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-brand-600" /> My listings — manage the rooms &amp; items you posted</CardTitle>
        </CardHeader>
        <CardContent>
          {myRooms.length === 0 && myRentals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Home className="h-6 w-6 text-brand-600" /></div>
              <p className="mt-2 font-semibold">You have not posted anything yet</p>
              <p className="mt-1 text-sm text-ink-500">List a room or a rental item — both are ₹0 brokerage in demo mode.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button asChild><Link href="/list-room">List a room</Link></Button>
                <Button asChild variant="outline"><Link href="/list-item">List a rental item</Link></Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y text-sm">
              {myRooms.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><b>{r.title}</b> <span className="text-ink-500">— {r.locality}, {r.city} · {inr(r.rent)}/mo · <Badge variant="secondary" className="capitalize">{r.status || "active"}</Badge></span></span>
                  <span className="flex gap-2">
                    {r.status !== "paused" && <Button variant="outline" size="sm" onClick={() => changeRoomStatus(r.id, "paused")}>Pause</Button>}
                    {r.status === "paused" && <Button variant="outline" size="sm" onClick={() => changeRoomStatus(r.id, "active")}>Activate</Button>}
                    {r.status !== "filled" && <Button variant="outline" size="sm" onClick={() => changeRoomStatus(r.id, "filled")}>Mark filled</Button>}
                    <Button variant="destructive" size="sm" onClick={() => deleteRoom(r.id)}>Delete</Button>
                  </span>
                </li>
              ))}
              {myRentals.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><b>{r.title}</b> <span className="text-ink-500">— {r.locality}, {r.city} · {inr(r.pricePerMonth)}/mo</span></span>
                  <Button variant="destructive" size="sm" onClick={() => deleteRental(r.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-ink-500">Listing lifecycle in demo: active → paused → filled. Demo seed listings are managed by the demo, not here.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-brand-600" /> Interests timeline ({interests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Mail className="h-6 w-6 text-brand-600" /></div>
              <p className="mt-2 font-semibold">No interests sent yet</p>
              <p className="mt-1 text-sm text-ink-500">Express interest on a flatmate, room or rental and it will appear here.</p>
              <Button asChild className="mt-4"><Link href="/rooms">Browse rooms</Link></Button>
            </div>
          ) : (
            <ul className="divide-y text-sm">{interests.map((i) => (
              <li key={i.id} className="py-2"><Badge variant="secondary" className="capitalize">{i.targetType}</Badge> <span className="text-ink-600">{new Date(i.createdAt).toLocaleString("en-IN")}</span><p className="mt-1">“{i.message}”</p></li>
            ))}</ul>
          )}
        </CardContent>
      </Card>
      <BundleDrawer items={bundle} onRemove={(id) => setBundle(bundle.filter((b) => b.id !== id))} onClear={() => setBundle([])} />
    </div>
  );
}
