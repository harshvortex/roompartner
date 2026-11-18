"use client";
import Link from "next/link";
import { MoveInChecklist } from "@/components/MoveInChecklist";
import { BundleDrawer } from "@/components/BundleDrawer";
import { bundleSummary, inr } from "@/lib/bundle";
import { useListings, useSaved, useInterests, useBundle, useChecklist, useProfile, removeMyListing, setMyRoomStatus } from "@/lib/store";
import { DEMO_ROOMS, DEMO_RENTALS } from "@/lib/seed";

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
      <h1 className="page-title">My Space</h1>
      <p className="text-sm text-ink-500">{profile.name ? `Welcome back, ${profile.name}.` : "Complete your profile to get personalised matches."} {profile.city ? `· ${profile.city} · budget ${inr(profile.budgetMin)}–${inr(profile.budgetMax)}` : ""}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <MoveInChecklist done={checklist} onToggle={toggleChecklist} />
        <div className="card">
          <h2 className="font-bold">Move-in Bundle summary</h2>
          {bundle.length === 0 ? <p className="mt-2 text-sm text-ink-500">Nothing bundled yet. Add a room or rental with + Bundle.</p> : (
            <div className="mt-2 space-y-1 text-sm">
              <p>Items: {summary.itemCount} · Monthly: <b>{inr(summary.monthlyTotal)}</b></p>
              <p>Deposits: <b>{inr(summary.depositTotal)}</b> · First month: <b>{inr(summary.firstMonthCost)}</b></p>
              <p className="text-emerald-700 font-medium">Brokerage saved: {inr(summary.brokerageSaved)}</p>
            </div>
          )}
          <div className="mt-3 flex gap-2"><Link href="/rooms" className="btn-primary btn-sm">Browse rooms</Link><Link href="/rentals" className="btn-secondary btn-sm">Browse rentals</Link></div>
        </div>
      </div>
      <section className="card">
        <h2 className="font-bold">Saved shortlist ({savedItems.length})</h2>
        {savedItems.length === 0 ? <p className="mt-2 text-sm text-ink-500">Tap ♡ Save on any flatmate, room or rental to keep it here.</p> : (
          <ul className="mt-2 divide-y text-sm">{savedItems.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 py-2"><span><Link href={s.href} className="font-medium underline">{s.title}</Link> <span className="text-ink-500">— {s.sub}</span></span><button onClick={() => setSaved(saved.filter((x) => x !== s.id))} className="text-xs text-red-600">Remove</button></li>
          ))}</ul>
        )}
      </section>
      <section className="card">
        <h2 className="font-bold">My listings — manage the rooms &amp; items you posted</h2>
        {myRooms.length === 0 && myRentals.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">You have not posted anything yet. <Link href="/list-room" className="font-medium underline">List a room</Link> or <Link href="/list-item" className="font-medium underline">list a rental item</Link> — both are ₹0 brokerage in demo mode.</p>
        ) : (
          <ul className="mt-2 divide-y text-sm">
            {myRooms.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><b>{r.title}</b> <span className="text-ink-500">— {r.locality}, {r.city} · {inr(r.rent)}/mo · <span className="capitalize">{r.status || "active"}</span></span></span>
                <span className="flex gap-2">
                  {r.status !== "paused" && <button onClick={() => changeRoomStatus(r.id, "paused")} className="btn-secondary btn-sm">Pause</button>}
                  {r.status === "paused" && <button onClick={() => changeRoomStatus(r.id, "active")} className="btn-secondary btn-sm">Activate</button>}
                  {r.status !== "filled" && <button onClick={() => changeRoomStatus(r.id, "filled")} className="btn-secondary btn-sm">Mark filled</button>}
                  <button onClick={() => deleteRoom(r.id)} className="btn-danger btn-sm">Delete</button>
                </span>
              </li>
            ))}
            {myRentals.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><b>{r.title}</b> <span className="text-ink-500">— {r.locality}, {r.city} · {inr(r.pricePerMonth)}/mo</span></span>
                <button onClick={() => deleteRental(r.id)} className="btn-danger btn-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-ink-500">Listing lifecycle in demo: active → paused → filled. Demo seed listings are managed by the demo, not here.</p>
      </section>
      <section className="card">
        <h2 className="font-bold">Interests timeline ({interests.length})</h2>
        {interests.length === 0 ? <p className="mt-2 text-sm text-ink-500">No interests sent yet. Express interest on a flatmate, room or rental and it will appear here.</p> : (
          <ul className="mt-2 divide-y text-sm">{interests.map((i) => (
            <li key={i.id} className="py-2"><span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs capitalize">{i.targetType}</span> <span className="text-ink-600">{new Date(i.createdAt).toLocaleString("en-IN")}</span><p className="mt-1">“{i.message}”</p></li>
          ))}</ul>
        )}
      </section>
      <BundleDrawer items={bundle} onRemove={(id) => setBundle(bundle.filter((b) => b.id !== id))} onClear={() => setBundle([])} />
    </div>
  );
}
