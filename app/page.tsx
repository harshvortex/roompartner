import Link from "next/link";
import { DEMO_RENTALS, DEMO_ROOMMATES, DEMO_ROOMS, DEMO_CITIES, DEMO_SQUADS, DEMO_VERIFIED_COUNT, DEMO_BROKERAGE_SAVED } from "@/lib/seed";
import { inr } from "@/lib/bundle";
import { CompatRing } from "@/components/CompatRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";

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
          <Badge variant="secondary" className="gap-2 border-0 bg-white/15 text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" /> No broker · No brokerage · Move in furnished
          </Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Find the right roommate.<br />Find the right room.<br /><span className="gradient-text">Furnish it on rent.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
            Match on budget, food, sleep and cleanliness — not just location. Then add the bed, fridge and washing machine to your move-in bundle.
          </p>
          <form action="/rooms" method="get" className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-pop sm:flex-row sm:items-center sm:rounded-full">
            <label className="sr-only" htmlFor="hero-city">City</label>
            <Input id="hero-city" name="city" list="hero-cities" placeholder="Which city? Try Bengaluru…" className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0" autoComplete="off" />
            <datalist id="hero-cities">{DEMO_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            <Button type="submit" className="rounded-full sm:px-6"><Search className="h-4 w-4" /> Search rooms</Button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild className="rounded-full bg-white px-5 py-2.5 text-brand-700 shadow-sm hover:bg-brand-50">
              <Link href="/flatmates">Find flatmates <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/50 bg-transparent px-5 py-2.5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/rooms">Browse rooms</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/50 bg-transparent px-5 py-2.5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/rentals">Rent items</Link>
            </Button>
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
            <Card key={s.n} className="relative p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
              <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700" aria-hidden="true">{s.n}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-100 text-2xl" aria-hidden="true">{s.icon}</div>
              <h3 className="mt-3 font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Compatibility preview ---- */}
      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
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
          <Button asChild className="mt-6">
            <Link href="/onboarding">Complete your profile <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </Card>
        <Card className="flex flex-col justify-between border-0 bg-gradient-to-br from-brand-600 to-violet-600 p-5 text-white lg:col-span-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Why broker-free matters</p>
            <p className="mt-2 text-3xl font-extrabold leading-tight">₹61,500</p>
            <p className="mt-1 text-sm text-indigo-100">of brokerage saved across the demo listings — one month&apos;s rent on every room, kept by the people moving in.</p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <CompatRing score={92} size={76} tone="light" />
            <p className="text-sm text-indigo-100">Verified profiles climb from a trust score of 42 to 92 — phone verified, profile complete. Simulated in demo; real Aadhaar/KYC is a future step.</p>
          </div>
        </Card>
      </section>

      {/* ---- Featured flatmates ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Flatmates</p><h2 className="section-title mt-1 text-2xl">People looking right now</h2></div>
          <Button asChild variant="outline" size="sm">
            <Link href="/flatmates">See all flatmates <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {featuredRoommates.map((p, i) => (
            <Link key={p.id} href="/flatmates">
              <Card className="group h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white avatar-grad-${i % 6}`} aria-hidden="true">{p.name[0]}</div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-900 group-hover:text-brand-700">{p.name}, {p.age} {p.verified && <Badge variant="success">✓ Verified</Badge>}</p>
                    <p className="truncate text-sm text-ink-500">{p.occupation} · {p.city}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{p.bio}</p>
                <p className="mt-3 text-sm font-bold text-ink-900">{inr(p.budgetMin)}–{inr(p.budgetMax)}<span className="font-medium text-ink-400">/mo</span> <span className="font-normal text-ink-400">· {p.food} · {p.sleepTime} sleeper</span></p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Featured rooms ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Rooms</p><h2 className="section-title mt-1 text-2xl">Broker-free rooms, direct from owners</h2></div>
          <Button asChild variant="outline" size="sm">
            <Link href="/rooms">See all rooms <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {featuredRooms.map((r, i) => (
            <Link key={r.id} href="/rooms">
              <Card className="group h-full overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
                <div className={`flex h-24 items-end p-4 room-thumb-${i % 4}`}>
                  <Badge variant="secondary" className="bg-white/90 shadow-sm">{r.bhk} · {r.furnishing}</Badge>
                </div>
                <CardContent className="p-5 pt-4">
                  <p className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{r.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{r.locality}, {r.city}</p>
                  <p className="mt-3 text-xl font-extrabold text-ink-900">{inr(r.rent)}<span className="text-sm font-medium text-ink-400">/mo</span></p>
                  <p className="mt-0.5 text-xs font-semibold text-ok-700">₹0 brokerage — save {inr(r.rent)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Rentals teaser ---- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Rentals</p><h2 className="section-title mt-1 text-2xl">Furnish it on rent, by the month</h2></div>
          <Button asChild variant="outline" size="sm">
            <Link href="/rentals">See all rentals <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featuredRentals.map((r) => (
            <Link key={r.id} href="/rentals">
              <Card className="group h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
                <p className="text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-700">{r.title}</p>
                <p className="mt-1 text-xs text-ink-500">{r.locality}, {r.city}</p>
                <p className="mt-3 text-lg font-extrabold text-ink-900">{inr(r.pricePerMonth)}<span className="text-xs font-medium text-ink-400">/mo</span></p>
                <Badge variant="secondary" className="mt-2 capitalize">{r.category} · {r.condition}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Cities ---- */}
      <section>
        <p className="eyebrow">Popular cities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_CITIES.map((c) => (
            <Button key={c} asChild variant="outline" className="rounded-full px-4 py-2 text-sm">
              <Link href={`/rooms?city=${encodeURIComponent(c)}`}>{c} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          ))}
        </div>
      </section>

      {/* ---- Everything included ---- */}
      <section>
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Everything included</CardTitle>
            <CardDescription className="mt-2 leading-relaxed">Chat after interest, Squad Mode, phone verification with trust score 42 → 92, visit scheduling, report &amp; moderation, listing lifecycle with 30-day stale flags, persistent bundles, rent-split calculator, and move-in services. See <Link href="/dashboard" className="font-semibold text-brand-700 underline">Dashboard</Link> for the Trust &amp; Safety Center and the Production &amp; Hosting panel.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <p className="mt-2 text-xs leading-relaxed text-ink-400">Pricing shown in-app (Seeker Pass ₹99/month, no auto-renew · Verification ₹99 one-off · Owner boost ₹199–299/7 days) is a structure, not live billing — no payment gateway is wired in this build.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button asChild><Link href="/onboarding">Complete your profile</Link></Button>
              <Button asChild variant="outline"><Link href="/squads">Squad Mode</Link></Button>
              <Button asChild variant="outline"><Link href="/chats">Chats</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
