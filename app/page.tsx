import Link from "next/link";
import { DEMO_RENTALS, DEMO_ROOMMATES, DEMO_ROOMS, DEMO_CITIES, DEMO_SQUADS, DEMO_VERIFIED_COUNT, DEMO_BROKERAGE_SAVED } from "@/lib/seed";
import { inr } from "@/lib/bundle";
import { CompatRing } from "@/components/CompatRing";

// Compatibility weights — the 7 scored factors, matching lib/compatibility.ts
// and the synopsis (sum = 100). Pets is profile information only, not scored.
const WEIGHTS: [string, number][] = [
  ["Budget", 25], ["Food", 15], ["Sleep", 15], ["Cleanliness", 15],
  ["Smoking", 10], ["Guests", 10], ["Work / WFH", 10],
];

const STEPS = [
  { n: "1", icon: "📝", title: "Complete your profile", text: "Budget, food, sleep, cleanliness — 2 minutes, nothing shared until you send an interest." },
  { n: "2", icon: "🎯", title: "See your matches", text: "Flatmates ranked by compatibility, rooms in your city and budget — no broker in between." },
  { n: "3", icon: "🧳", title: "Build a move-in bundle", text: "Room + bed + fridge + washing machine, with the full first-month cost up front." },
  { n: "4", icon: "🔑", title: "Visit, verify, move in", text: "Send an interest, chat, book a visit, verify (trust 42 → 92) — with ₹0 brokerage." },
];

export default function Home() {
  const avgRent = Math.round(DEMO_ROOMS.reduce((s, r) => s + r.rent, 0) / DEMO_ROOMS.length);
  const brokerageSaved = DEMO_BROKERAGE_SAVED;
  const totalListings = DEMO_ROOMMATES.length + DEMO_ROOMS.length + DEMO_RENTALS.length + DEMO_SQUADS.length;
  const featuredRoommates = DEMO_ROOMMATES.slice(0, 3);
  const featuredRooms = DEMO_ROOMS.slice(0, 3);
  const featuredRentals = DEMO_RENTALS.slice(0, 4);
  return (
    <div className="space-y-10 sm:space-y-14">
      {/* ---- Hero ---- */}
      <section className="hero-gradient relative overflow-hidden rounded-[2rem] px-6 py-10 text-white shadow-lift sm:px-12 sm:py-14">
        <div className="hero-glow pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full" aria-hidden="true" />
        <div className="hero-glow pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full" aria-hidden="true" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" /> No broker · No brokerage · Move in furnished
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Find the right roommate.<br />Find the right room.<br /><span className="gradient-text">Furnish it on rent.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
            Match on budget, food, sleep and cleanliness — not just location. Then add the bed, fridge and washing machine to your move-in bundle.
          </p>
          <form action="/rooms" method="get" className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-pop sm:flex-row sm:items-center sm:rounded-full">
            <label className="sr-only" htmlFor="hero-city">City</label>
            <input id="hero-city" name="city" list="hero-cities" placeholder="Which city? Try Bengaluru…" className="!border-0 !bg-transparent !shadow-none !ring-0 flex-1 !py-2.5" autoComplete="off" />
            <datalist id="hero-cities">{DEMO_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            <button type="submit" className="btn-primary !rounded-full sm:!px-6">Search rooms →</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/flatmates" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50">Find flatmates →</Link>
            <Link href="/rooms" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">Browse rooms</Link>
            <Link href="/rentals" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">Rent items</Link>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [totalListings, "live listings (demo)"],
              [DEMO_VERIFIED_COUNT, "verified"],
              [inr(avgRent), "avg room rent/mo"],
              [inr(brokerageSaved), "brokerage saved in demo"],
            ].map(([v, l]) => (
              <div key={l as string} className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-xl font-extrabold sm:text-2xl">{v}</div>
                <div className="mt-0.5 text-xs text-indigo-100">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section>
        <p className="eyebrow">How it works</p>
        <h2 className="section-title mt-1 text-2xl">From profile to keys in four steps</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card-hover relative">
              <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700" aria-hidden="true">{s.n}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-100 text-2xl" aria-hidden="true">{s.icon}</div>
              <h3 className="mt-3 font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Compatibility preview ---- */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <p className="eyebrow">Compatibility, explained</p>
          <h2 className="section-title mt-1">A score you can actually read</h2>
          <p className="section-sub">Seven factors, weighted to 100. No black box — every match shows its breakdown.</p>
          <div className="mt-5 space-y-3">
            {WEIGHTS.map(([label, w]) => (
              <div key={label}>
                <div className="flex justify-between text-sm"><span className="font-medium text-ink-700">{label}</span><span className="font-bold text-ink-900">{w} pts</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" style={{ width: `${w * 4}%` }} /></div>
              </div>
            ))}
          </div>
          <Link href="/onboarding" className="btn-primary mt-6">Complete your profile →</Link>
        </div>
        <div className="card flex flex-col justify-between bg-gradient-to-br from-brand-600 to-violet-600 !border-0 text-white lg:col-span-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Why broker-free matters</p>
            <p className="mt-2 text-3xl font-extrabold leading-tight">₹61,500</p>
            <p className="mt-1 text-sm text-indigo-100">of brokerage saved across the demo listings — one month&apos;s rent on every room, kept by the people moving in.</p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <CompatRing score={92} size={76} tone="light" />
            <p className="text-sm text-indigo-100">Verified profiles climb from a trust score of 42 to 92 — phone verified, profile complete. Simulated in demo; real Aadhaar/KYC is a future step.</p>
          </div>
        </div>
      </section>

      {/* ---- Featured flatmates ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Flatmates</p><h2 className="section-title mt-1 text-2xl">People looking right now</h2></div>
          <Link href="/flatmates" className="btn-secondary btn-sm">See all flatmates →</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {featuredRoommates.map((p, i) => (
            <Link key={p.id} href="/flatmates" className="card-hover group">
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white avatar-grad-${i % 6}`} aria-hidden="true">{p.name[0]}</div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-900 group-hover:text-brand-700">{p.name}, {p.age} {p.verified && <span className="badge-verified">✓ Verified</span>}</p>
                  <p className="truncate text-sm text-ink-500">{p.occupation} · {p.city}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{p.bio}</p>
              <p className="mt-3 text-sm font-bold text-ink-900">{inr(p.budgetMin)}–{inr(p.budgetMax)}<span className="font-medium text-ink-400">/mo</span> <span className="font-normal text-ink-400">· {p.food} · {p.sleepTime} sleeper</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Featured rooms ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Rooms</p><h2 className="section-title mt-1 text-2xl">Broker-free rooms, direct from owners</h2></div>
          <Link href="/rooms" className="btn-secondary btn-sm">See all rooms →</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {featuredRooms.map((r, i) => (
            <Link key={r.id} href="/rooms" className="card-hover group overflow-hidden p-0">
              <div className={`flex h-24 items-end p-4 room-thumb-${i % 4}`}>
                <span className="pill bg-white/90 shadow-sm">{r.bhk} · {r.furnishing}</span>
              </div>
              <div className="p-5 pt-4">
                <p className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{r.title}</p>
                <p className="mt-1 text-sm text-ink-500">{r.locality}, {r.city}</p>
                <p className="mt-3 text-xl font-extrabold text-ink-900">{inr(r.rent)}<span className="text-sm font-medium text-ink-400">/mo</span></p>
                <p className="mt-0.5 text-xs font-semibold text-ok-700">₹0 brokerage — save {inr(r.rent)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Rentals teaser ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Rentals</p><h2 className="section-title mt-1 text-2xl">Furnish it on rent, by the month</h2></div>
          <Link href="/rentals" className="btn-secondary btn-sm">See all rentals →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featuredRentals.map((r) => (
            <Link key={r.id} href="/rentals" className="card-hover group">
              <p className="text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-700">{r.title}</p>
              <p className="mt-1 text-xs text-ink-500">{r.locality}, {r.city}</p>
              <p className="mt-3 text-lg font-extrabold text-ink-900">{inr(r.pricePerMonth)}<span className="text-xs font-medium text-ink-400">/mo</span></p>
              <span className="pill mt-2 capitalize">{r.category} · {r.condition}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Cities ---- */}
      <section>
        <p className="eyebrow">Popular cities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_CITIES.map((c) => (
            <Link key={c} href={`/rooms?city=${encodeURIComponent(c)}`} className="chip !px-4 !py-2 !text-sm">{c} →</Link>
          ))}
        </div>
      </section>

      {/* ---- Everything included ---- */}
      <section className="card">
        <h2 className="section-title">Everything included</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">Chat after interest, Squad Mode, phone verification with trust score 42 → 92, visit scheduling, report &amp; moderation, listing lifecycle with 30-day stale flags, persistent bundles, rent-split calculator, and move-in services. See <Link href="/dashboard" className="font-semibold text-brand-700 underline">Dashboard</Link> for the Trust &amp; Safety Center and the Production &amp; Hosting panel.</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-400">Pricing shown in-app (Seeker Pass ₹99/month, no auto-renew · Verification ₹99 one-off · Owner boost ₹199–299/7 days) is a structure, not live billing — no payment gateway is wired in this build.</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/onboarding" className="btn-primary">Complete your profile</Link>
          <Link href="/squads" className="btn-secondary">Squad Mode</Link>
          <Link href="/chats" className="btn-secondary">Chats</Link>
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </section>
    </div>
  );
}
