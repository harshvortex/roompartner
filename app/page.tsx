import Link from "next/link";
import { DEMO_RENTALS, DEMO_ROOMMATES, DEMO_ROOMS, DEMO_CITIES, DEMO_SQUADS, DEMO_VERIFIED_COUNT, DEMO_BROKERAGE_SAVED } from "@/lib/seed";
import { inr } from "@/lib/bundle";

export default function Home() {
  const avgRent = Math.round(DEMO_ROOMS.reduce((s, r) => s + r.rent, 0) / DEMO_ROOMS.length);
  const brokerageSaved = DEMO_BROKERAGE_SAVED;
  const totalListings = DEMO_ROOMMATES.length + DEMO_ROOMS.length + DEMO_RENTALS.length + DEMO_SQUADS.length;
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-emerald-700 p-6 text-white sm:p-10">
        <p className="text-sm font-medium text-emerald-100">No broker · No brokerage · Move in furnished</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">Find the right roommate.<br />Find the right room.<br />Furnish it on rent.</h1>
        <p className="mt-3 max-w-xl text-emerald-100">Match on budget, food, sleep and cleanliness — not just location. Then add the bed, fridge and washing machine to your move-in bundle.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/flatmates" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700">Find flatmates →</Link>
          <Link href="/rooms" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold">Browse rooms</Link>
          <Link href="/rentals" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold">Rent items</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-3"><div className="text-xl font-bold sm:text-2xl">{totalListings}</div><div className="text-xs text-emerald-100">live listings (demo)</div></div>
          <div className="rounded-2xl bg-white/10 p-3"><div className="text-xl font-bold sm:text-2xl">{DEMO_VERIFIED_COUNT}</div><div className="text-xs text-emerald-100">verified</div></div>
          <div className="rounded-2xl bg-white/10 p-3"><div className="text-xl font-bold sm:text-2xl">{inr(avgRent)}</div><div className="text-xs text-emerald-100">avg room rent/mo</div></div>
          <div className="rounded-2xl bg-white/10 p-3"><div className="text-xl font-bold sm:text-2xl">{inr(brokerageSaved)}</div><div className="text-xs text-emerald-100">brokerage saved in demo</div></div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Popular cities</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_CITIES.map((c) => (
            <Link key={c} href={`/rooms?city=${encodeURIComponent(c)}`} className="rounded-full border bg-white px-4 py-2 text-sm font-medium hover:border-emerald-500 hover:text-emerald-700">{c}</Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-bold">Final — what is included</h2>
        <p className="mt-1 text-sm text-gray-600">Chat after interest, Squad Mode, phone verification with trust score 42 → 92, visit scheduling, report &amp; moderation, listing lifecycle with 30-day stale flags, persistent bundles, rent-split calculator, and move-in services. See <Link href="/dashboard" className="font-medium underline">Dashboard</Link> for the Trust &amp; Safety Center and the Production &amp; Hosting panel.</p>
        <p className="mt-2 text-xs text-gray-500">Pricing shown in-app (Seeker Pass ₹99/month, no auto-renew · Verification ₹99 one-off · Owner boost ₹199–299/7 days) is a structure, not live billing — no payment gateway is wired in this build.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/flatmates" className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md"><div className="text-2xl">👥</div><h3 className="mt-2 font-bold">Compatible flatmates</h3><p className="mt-1 text-sm text-gray-600">% match scores with a breakdown — budget, food, sleep, cleanliness, guests and WFH.</p></Link>
        <Link href="/rooms" className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md"><div className="text-2xl">🏠</div><h3 className="mt-2 font-bold">Broker-free rooms</h3><p className="mt-1 text-sm text-gray-600">Direct from owners and tenants. ₹0 brokerage, verified listings, no spam calls.</p></Link>
        <Link href="/rentals" className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md"><div className="text-2xl">🛋️</div><h3 className="mt-2 font-bold">Rent household items</h3><p className="mt-1 text-sm text-gray-600">Beds, fridges, washing machines and daily needs — rented from neighbours, by the month.</p></Link>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-bold">How it works</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>Complete your match profile (2 minutes) — budget, food, sleep, cleanliness.</li>
          <li>See flatmates ranked by compatibility, and rooms in your city and budget.</li>
          <li>Build a move-in bundle: room + furniture + appliances, with the full first-month cost.</li>
          <li>Send an interest — it opens a real chat thread — visit, verify (trust 42 → 92), and move in — with ₹0 brokerage.</li>
          <li>Team up in Squad Mode, split the rent, and add move-in services (agreement, cleaning, movers).</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/onboarding" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Complete your profile</Link>
          <Link href="/squads" className="rounded-lg border px-4 py-2 text-sm font-medium">Squad Mode</Link>
          <Link href="/chats" className="rounded-lg border px-4 py-2 text-sm font-medium">Chats</Link>
          <Link href="/dashboard" className="rounded-lg border px-4 py-2 text-sm font-medium">Dashboard</Link>
        </div>
      </section>
    </div>
  );
}
