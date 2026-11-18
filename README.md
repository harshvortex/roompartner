# RoomPartner v11 — shadcn/ui design system

Find a compatible room partner and a broker-free room, plus rent daily-needed household items. ₹0 brokerage.

## What changed in v11 (2026-11-18) — shadcn/ui, the popular UI library

The app now uses **shadcn/ui** (the most popular UI library for Next.js + Tailwind) instead of hand-rolled button/card/input classes, because the old look still felt computer-generated. Same indigo brand (#4F46E5), same light-only palette, same routes, flows, copy, demo data, compatibility weights and pricing — this is a UI migration only; no auth or security logic changed.

- **Installed (npm, all from the registry — nothing vendored):** `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`, `sonner`, and Radix primitives `@radix-ui/react-slot`, `react-label`, `react-avatar`, `react-dialog`, `react-tabs`, `react-select`, `react-switch`. Plus the standard shadcn/ui setup: `lib/utils.ts` (`cn()` helper), CSS-variable theme tokens in `app/globals.css` pinned to the indigo brand, and `tailwind.config.ts` extended with the shadcn colour/radius tokens.
- **New components in `components/ui/`:** Button, Input, Textarea, Label, Card (+ Header/Content/Footer/Title/Description), Badge, Avatar, Dialog, Tabs, Select, Switch, Skeleton, Sonner (Toaster, mounted in the root layout). One intentional deviation from stock shadcn/ui: **Badge renders a `<span>` instead of a `<div>`** — the app nests badges inside `<p>`/`<h3>`/`<span>` elements, and a `<div>` there caused a React hydration error (#418); a span renders identically and is valid everywhere.
- **Screens migrated:** Header + mobile bottom nav (shadcn Button + lucide icons), home hero/search/featured cards, flatmates/rooms/rentals cards and filters (Radix Select + Switch for "Verified only", Button pill toggles), login page (Radix Tabs for Magic link / Email + password and Sign in / Create account, Card + Input + Label + Avatar), dashboard (Card sections, Badge statuses, Select for report reason), My Space, chats (Avatar + Card + Badge), list-room/list-item/onboarding forms (Card + Label + Input + Select), squads, DetailModal → Radix Dialog, BundleDrawer, MoveInChecklist, RazorpayCheckout, error/404 pages, privacy/terms. The two budget **range sliders stay native `<input type="range">`** (shadcn's Slider was not in the requested set) and keep their styled look.
- **Light only, still pinned:** zero `dark:` variants, zero `prefers-color-scheme`, no dark-mode CSS variables defined — the shadcn token layer is light-only. The old amber `accent` colour scale was removed from `tailwind.config.ts` because it collided with shadcn's `accent` token (it was unused — only `accent-brand-600` appears, which is the brand scale).
- **Fixes found during migration:** `lucide-react` in this install has no `Chrome` icon (brand icons removed) — the Google sign-in button now uses `Globe`. The onboarding rewrite initially dropped the `useProfile` import — restored; the build caught both.
- **Tests** — `npm test` still 24/24 (no new tests: the migration changes presentation, not the tested lib logic). **Version** — `package.json` and `/api/health` report 11.0.0.

## What changed in v10 (2026-11-18) — real email auth + security hardening

- **Real email auth (works today, no external provider needed)** — `/login` now has an Email section alongside Google and Phone: (a) magic link — enter your email, Supabase sends a sign-in link, the page shows a "check your inbox" state; (b) email + password — create an account (with a "check your inbox to confirm your email" state) or sign in. Email format and password length (min 8) are validated client-side, and Supabase's own error messages are shown honestly. Sessions live in SSR cookies via `@supabase/ssr`; `localStorage` `rp-auth-user` is only a display label in live mode and stays the demo user only in demo mode. Sign-out clears both.
- **Auth callback fixed for both flows** — `app/auth/callback/route.ts` now handles PKCE `code` exchange (OAuth + newer email links) AND `token_hash` + `type` email links (signup / magiclink / recovery), and the `?next=` target is validated to same-site relative paths only (`lib/auth.ts` `safeRedirectPath`), so a crafted link can never bounce a user to an outside site.
- **Server-side route protection** — `middleware.ts` refreshes the Supabase session on every matched request and protects `/dashboard`, `/my-space`, `/chats`, `/list-room`, `/list-item`: a visitor with no valid session is redirected to `/login?next=<original path>`. In demo mode (no Supabase env vars) the guard does not apply — pages load exactly as before, so nobody is locked out of the demo.
- **Auth callback rate limit** — `/auth/callback` is limited to 10 attempts/min/IP (429 + `Retry-After`) to slow brute-force code guessing. API rate limits unchanged (payments 10/min, other APIs 60/min).
- **Payments are bound to the signed-in user** — `app/api/payments/create-order` now requires a valid Supabase session (SSR cookies or a Bearer token) when Supabase is configured and takes the user id from that session, never from the request body; unauthenticated requests get 401 in live mode. Demo mode behaviour is unchanged.
- **Security headers audited (v10)** — CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy and Cross-Origin-Opener-Policy in `next.config.ts` were checked against what the app actually loads (Supabase `*.supabase.co`, Razorpay checkout). Nothing was missing; the only change is `worker-src 'self'` added to the CSP. Permissions-Policy deliberately does not restrict `payment=()` (Razorpay checkout uses the Payment Request API in some flows).
- **Login page polished** — the three sign-in methods (Google, Email, Phone) are clean stacked cards in the v9 design system, with clear "check your inbox", error and signed-in states. Dashboard, My Space, chats and the list-room/list-item forms got a consistency pass (spacing, section headings, intentional empty states, primary/secondary buttons) — no route, flow or data changed.
- **Tests** — `npm test` now covers the new email/password validation, safe redirect paths and the callback limiter (see "Tests" below). **Version** — `package.json` and `/api/health` report 10.0.0. No new dependencies.

## SECURITY — what is enforced, and what is NOT real yet

Enforced in this build:
- **Supabase RLS** on all 17 tables (verified in the live project: profiles, rooms, rentals, interests, saved, bookings, conversations, messages, squads, visits, reports, bundles, payments, escrows, moderation flags) — the anon key alone cannot read or write another user's rows.
- **Server-side session guard** — protected pages redirect to `/login` when there is no valid Supabase session (live mode only); the session is refreshed in middleware so it does not silently expire.
- **Session-bound payments** — payment orders are created for the authenticated user id from the session, never from a client-supplied id.
- **Rate limits** — payments 10/min/IP, other APIs 60/min/IP, auth callback 10/min/IP (in-memory per instance; use Upstash Redis / Vercel KV for a strict global limit).
- **Payment verification** — Razorpay HMAC signature compared in constant time; amounts looked up server-side; live keys refused (403); no upstream error body ever returned to the client.
- **Security headers** — CSP (incl. `frame-ancestors 'none'`), HSTS, `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, COOP (see `next.config.ts`).
- **Validation** — all form input validated server-side where it matters (age, budgets, rent, deposits) with human-readable errors; API bodies capped at 4 KB.

NOT real yet — do not mistake these for live features:
- **Google sign-in** needs the Google provider enabled in Supabase (Auth → Providers → Google) with a Google Cloud OAuth client. Until then it fails honestly and email works instead.
- **Phone OTP (real SMS)** needs a phone provider in Supabase (MSG91 + TRAI DLT, ~10 days). Until then, live phone OTP fails with an honest message.
- **Payments are test-mode only** — no Razorpay live keys, no real charges; live keys are refused by the server until business KYC is complete.
- **Aadhaar/KYC not implemented** — the trust score (42 → 92) is simulated; real verification needs UIDAI approval.
- **Escrow is a demo state machine** — no real money moves; real escrow needs a licensed escrow partner.
- **Demo data only** — the 21 listings are seeded demo data; seed real listings before inviting users.

## What changed in v9 (2026-11-18) — UI/UX redesign

- **Design system** — `tailwind.config.ts` + `app/globals.css` now define a warm, modern light palette (deep indigo/violet primary, warm amber accent, soft `#F7F7FB` surfaces, white cards), rounded-2xl cards with soft layered shadows, a clear type hierarchy, focus-visible states and smooth hover transitions. Emerald is kept only for semantic success/verified states. **Light design only, as before** — no dark-mode styles, no `prefers-color-scheme: dark`, no `dark:` variants.
- **Home page** — striking indigo hero with a working city search (GET to `/rooms`), trust strip with the demo figures, four-step "How it works", an explained compatibility-weights preview (Budget 25 / Food 15 / Sleep 15 / Cleanliness 15 / Smoking 10 / Guests 10 / WFH 10), featured flatmates, rooms and rentals from the real demo data, and popular cities.
- **Header + mobile nav** — gradient logo mark, pill navigation with active states, "Find my match" CTA, and a thumb-friendly mobile bottom nav (Home, Flatmates, Rooms, Rentals, My Space) with safe-area padding.
- **Cards** — gradient photo areas with initials/category art, verified badges, a more prominent compatibility ring with a match label, prominent pricing, amenity pills and consistent primary/secondary buttons.
- **Filters** — sort is now chips/pills instead of a select, budget slider shows a live value pill, all selects/inputs share one styled base.
- **Everywhere else** — one button set (`.btn-primary/.btn-secondary/.btn-ghost/.btn-danger`), one card style, consistent empty states, shimmer loading skeletons, sticky modal headers, and a polished bundle drawer. All routes, flows, demo data, weights, pricing, demo OTP and demo-only copy are unchanged from v8; all v8 hardening (headers, rate limiting, HMAC verify, validation, SEO, `/api/health`) is intact.
- **Version** — `package.json` and `/api/health` report 9.0.0. Tests unchanged (21/21); no new dependencies.

## What changed in v8 (2026-11-17) — production hardening

- **Security headers** — CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy, HSTS, Cross-Origin-Opener-Policy in `next.config.ts` (`middleware.ts` rate-limits API routes; headers are set once, in `next.config.ts`).
- **Rate limiting** — payments 10/min/IP, other APIs 60/min/IP, with `X-RateLimit-*` headers and 429 + `Retry-After`. In-memory per instance — for a strict global limit use Upstash Redis / Vercel KV. `/api/health` is never rate-limited.
- **Payment routes hardened** — request body capped at 4 KB, product whitelist only, amounts always looked up server-side from the product id (never from the client), malformed test keys rejected, live keys still refused (403), HMAC signature compared in constant time (`crypto.timingSafeEqual` in `lib/payments.ts`), structured JSON logging with secrets redacted, and no upstream error body ever returned to the client.
- **Error handling** — `app/error.tsx` (global error boundary, no stack traces), `app/not-found.tsx` (404), `app/loading.tsx` (loading states). API errors are `{ error, code }` only.
- **SEO/metadata** — per-site title/description/OG/Twitter/JSON-LD in `app/layout.tsx`, `metadataBase` + canonical, `app/sitemap.ts` (14 routes), `app/robots.ts` (API/auth/chat/dashboard disallowed), `public/favicon.svg`.
- **Health + observability** — `GET /api/health` returns `{ status, version, mode, uptimeSeconds, timestamp, checks: { supabase, razorpay } }` with no secrets; `lib/logger.ts` logs one JSON line per event with secret-like keys redacted.
- **Validation** — `lib/validate.ts` wired into onboarding (age 18–70, budget ₹500–₹2,00,000), list-a-room (rent ₹500–₹2,00,000, deposit ≤ 12× rent) and list-an-item (₹50–₹50,000), with human-readable `role="alert"` errors.
- **Accessibility** — `:focus-visible` outline, skip-to-content link, `aria-label`/`aria-current` on navigation, icon-only buttons already labelled. No `<img>` tags exist in the app, so there is nothing to optimise with `next/image`.
- **Data safety verified** — no secrets in code (grep-checked), `.env.example` complete, seed data labelled demo, localStorage keys namespaced `rp-*`, Supabase RLS verified on all 17 tables (`payments`, `escrows`, `moderation_flags` included).
- **Tests** — `npm test` now 21 tests (was 15): validation, rate limiting (incl. window reset), timing-safe signature, health payload.

## What changed in v7 (2026-11-17)

Find a compatible room partner and a broker-free room, plus rent daily-needed household items. ₹0 brokerage.

This is the **v7** codebase (built from Final v6.0.0) — a fresh, ownable Next.js project. It is **not** the MVP-only zip: it adds chat, Squad Mode, verification, visit scheduling, report/moderation, rent-split, move-in services, advanced filters and a dashboard on top of everything in the MVP.

## What changed in v7 (2026-11-17)

Code-complete, not live. All six remaining items are implemented env-gated, with a demo fallback and no real money / no live calls without keys:
- **Supabase Auth** — Google sign-in + phone OTP (`/login`, `/auth/callback`, `lib/auth.ts`, `lib/auth-server.ts`). Live when Supabase keys are set; demo mode shows the demo OTP on screen and never sends an SMS.
- **Razorpay checkout, TEST MODE ONLY** — Seeker Pass ₹99, Verification ₹99, Owner boost ₹199 (`components/RazorpayCheckout.tsx`, `app/api/payments/create-order`, `app/api/payments/verify`). Server verifies the HMAC-SHA256 signature. Live keys (`rzp_live_*`) are refused by the server. No keys → demo order + simulated test payment, clearly labelled.
- **Supabase Realtime two-way chat** — `lib/realtime.ts` subscribes per conversation to the `messages` table; `/chats` writes to Supabase when configured and shows a live badge. Demo mode keeps localStorage + the labelled “[Demo reply]”.
- **Automated moderation** — rule-based auto-flags (`lib/moderation.ts`: banned phrases, suspicious prices, duplicate phones, missing city) shown on the Dashboard; a flag never deletes a listing — it goes to the queue for human review (open → reviewed → actioned).
- **Deposit escrow, demo only** — state machine created → held → released / refunded / disputed (`lib/escrow.ts`, Dashboard section). No real money moves; real escrow needs a licensed escrow partner.
- **Privacy Policy + Terms** — `/privacy` and `/terms` routes, linked from the footer and the sign-in page.
- **Schema + env** — new `payments`, `escrows`, `moderation_flags` tables with RLS in `supabase/schema.sql`; `.env.example` now lists every env var needed to go live.
- **Tests** — `npm test` now 15 tests (was 10): auth, payments, moderation, escrow, Realtime channel naming.

## What changed in the Final build (2026-11-17)

An audit of the v5 zip found and fixed these — everything below now works end-to-end in demo mode:
- **Compatibility weights corrected** to the synopsis: cleanliness 10→15, guests 5→10, pets removed as a scored factor (7 factors, sum 100). The code previously scored pets and used different weights from the synopsis.
- **Filters fixed:** BHK/gender controls were shown on Flatmates and Rentals but ignored there; they now only appear on Rooms. Rentals now honours the verified-only filter.
- **Rentals booking now opens a chat thread**, like rooms/flatmates (it used to only record an interest).
- **“Clear demo” now persists** across pages/reloads (it used to re-seed on every page mount). User listings are de-duplicated against demo ids.
- **Stale flags are now shown** on cards (the `isStale()` helper existed but was never used). Seed roommates now have listing dates.
- **Move-in Journey checklist can now reach 100%:** verifying the phone ticks the “verify” step (it never did before).
- **Moderation queue works:** reports can be moved open → reviewed → actioned (there was no way to change a report’s status).
- **Move-in services can be requested** in demo mode (they were display-only).
- **“List a room / List an item” pages are now reachable** from Rooms/Rentals (they were orphan routes with no link).
- **Dashboard verified count is now computed** from the live lists (it was a hard-coded 11).
- **Chat now demonstrates a reply:** a clearly-labelled “[Demo reply]” arrives once per thread (demo only — no real person). One-way chat was a dead end in the demo.
- **My Space → My listings:** pause / activate / mark filled / delete your own rooms and rentals (the listing lifecycle had no UI).
- **Supabase schema now enables RLS for real** with policies on every table (v5 only described RLS in comments). Duplicate `status` alter removed.
- **Added `vercel.json`, and unit tests** (`npm test`, 10 tests: scoring, bundle, rent-split, trust score, stale flag).
- **Counts corrected:** 11 page routes (not 12 — the 12th build entry is the auto-generated `_not-found` page), 41 files in the v5 zip.

## What is in v5 vs MVP

**Everything from the MVP**
- Editable compatibility profile (budget, city, food, smoking, sleep, cleanliness, guests, WFH) with a weighted 0–100 match score and breakdown — budget 25, food 15, sleep 15, cleanliness 15, smoking 10, guests 10, work/WFH 10 (7 factors, sum 100; pets is shown as information, not scored). See `lib/compatibility.ts`.
- Broker-free rooms with ₹0 brokerage saved, rental items catalogue, search/filter/sort, save + interest with quick messages.
- Move-in Bundle builder + calculator (monthly total, deposits, first-month cost, brokerage saved), Move-in Journey checklist — now **8 steps**.
- My Space — saved shortlist, bundle summary, interests timeline.

**New in v5**
- **Verified system** — phone verification (simulated) and trust score **42 → 92**. See `lib/verification.ts`.
- **In-app Chat** — sending an interest opens a real thread; Chats tab with composer (`/chats`).
- **Visit scheduling** — book a visit from a room, confirm / mark done from the Dashboard.
- **Squad Mode** — create/join 2–3 person groups hunting a 2/3BHK together (`/squads`). 3 demo squads.
- **Report & moderation queue** — file a report from the Dashboard; open/reviewed/actioned states.
- **Listing lifecycle** — active / paused / filled, views, and 30-day stale flags (listings older than 30 days are flagged stale).
- **Persistent move-in bundles** — saved bundles survive reloads (localStorage in demo, `saved_bundles` table with Supabase).
- **Rent Split Calculator** — split the bundle monthly total between 2–6 people.
- **Move-in Services** — rental agreement (₹499 + stamp duty), deep cleaning, pest control, packers & movers (partner referrals, not operated in-app).
- **Advanced filters** — verified-only, BHK, gender preference, verified-first sort.
- **Live production stats bar** — listings, verified, brokerage saved (₹61,500 on demo data).
- **Dashboard** (`/dashboard`) — Trust & Safety Center + Production & Hosting panel.
- **Demo data: 21 items** — 6 roommates, 4 rooms, 8 rentals, 3 squads, 11 verified.

## Light design only — the black-screen fix

This build is **pinned to light**: `color-scheme: light`, `html, body { background: #FFFBF5 }`, no dark-mode overrides anywhere. The v4 bug was that phones in dark mode flipped the background to near-black (#0C0A09) while cards and text were designed only for the light palette, so the whole page read as black. Do not re-add a dark theme without redesigning every surface for it.

## Run it (demo mode, no keys needed)

```bash
npm install
npm run dev
# open http://localhost:3000
```

Demo mode runs fully with seed data (`lib/seed.ts`) and localStorage. No account, no keys, no secrets. Tap “Load production demo (21 items)” on the Dashboard, or “Load demo listings” on any list page.

## Production build

```bash
npm run build
npm start
```

## Supabase setup (when you are ready for real users)

1. Create a project at https://supabase.com, copy the project URL and anon key.
2. `cp .env.example .env.local` and fill it in.
3. In the Supabase SQL Editor, run `supabase/schema.sql`. It creates the MVP tables plus v5 tables: `conversations`, `messages`, `squads`, `squad_members`, `visits`, `reports`, `saved_bundles`, with indexes and RLS notes.
4. Restart `npm run dev`. When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, lists are fetched from Supabase, sign-in works via Supabase Auth (`/login`, email magic link + email/password + Google + phone OTP), and chat uses Supabase Realtime; profile/bundle/saved stay in localStorage in demo mode.
5. **Auth redirect URLs (required for email + Google sign-in to land back in the app):** in Supabase → Auth → URL Configuration, set Site URL to `https://roompartner-one.vercel.app` and add these Redirect URLs: `https://roompartner-one.vercel.app/auth/callback` and `https://roompartner-one.vercel.app/auth/callback?next=/dashboard` (plus `http://localhost:3000/auth/callback` for local dev). Without these, Supabase refuses to redirect after sign-in.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or import the repo in the Vercel dashboard and set the same two Supabase env vars (leave them unset for demo mode). Real-user cost is ~$45/month (Vercel Pro $20 + Supabase Pro $25); $0 on free tiers for a demo.

## Honest limits — what this build is NOT (yet)

- **No live payments.** Razorpay checkout code is wired, but TEST MODE ONLY. A live charge needs Razorpay business KYC first; the server refuses `rzp_live_*` keys. Never charge brokerage or a % of rent/deposit.
- **No real OTP / KYC.** Phone OTP code is wired through Supabase Auth, but a real SMS needs a phone provider configured in the Supabase project (MSG91 + TRAI DLT registration, ~10 days). Real Aadhaar/ID verification needs UIDAI approval and a privacy/legal review — the trust score stays simulated (42 → 92).
- **No real escrow money.** The escrow flow is a demo state machine; real escrow needs a licensed escrow partner.
- **Demo data only.** The 21 listings are clearly-labelled demo data. Seed real listings before inviting users.
- **No live deployment.** Needs Harsh's Vercel + Supabase accounts (see below).
- Next.js 15.5.29; `npm audit` could not be run from this sandbox (registry audit endpoint returns 403 `policy_denied` — the sandbox blocks the audit POST), so run `npm audit` and `npm audit fix` on your own machine before a production deploy. No advisories were fixed in v8 for that reason; the dependency set is unchanged from v7 (and unchanged again in v9 and v10) (Next 15.5.29, React 19, Supabase JS 2.45.4).

## Going live — exact env vars needed

| Step | What Harsh needs | Env vars / setup |
|---|---|---|
| Vercel deploy | Vercel account, import repo | — |
| Supabase project | Supabase account + project | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; run `supabase/schema.sql`; Database → Replication → enable `messages` for Realtime |
| Email auth (works today) | Nothing extra — Supabase built-in | Auth → URL Configuration: Site URL `https://roompartner-one.vercel.app`; Redirect URLs `https://roompartner-one.vercel.app/auth/callback` and `https://roompartner-one.vercel.app/auth/callback?next=/dashboard` |
| Google sign-in | Google Cloud OAuth client | Enable Google provider in Supabase Auth with the OAuth client ID/secret |
| Phone OTP (real SMS) | MSG91 account + TRAI DLT registration (~10 days) | Enable Phone provider in Supabase Auth with the SMS provider |
| Razorpay test | Razorpay account, test keys | `RAZORPAY_KEY_ID` (`rzp_test_*`), `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| Razorpay live | Razorpay business KYC complete | Live keys — only after KYC; server currently refuses them |
| Aadhaar/KYC | UIDAI approval + privacy/legal review | Not in this build — trust score stays simulated |
| App URL | Your domain / Vercel URL | `NEXT_PUBLIC_APP_URL` (Google OAuth redirect) |

## Project structure

```
app/            landing, /flatmates, /rooms, /rentals, /squads, /chats, /dashboard,
                /my-space, /onboarding, /list-room, /list-item
components/     CompatRing, Filters (verified/BHK/gender), Cards, DetailModal,
                BundleDrawer, MoveInChecklist (8 steps), Header
lib/            types, compatibility (scoring), bundle (calculator), rentSplit,
                verification (trust 42→92), services, pricing, seed (21 demo items),
                supabase (client, null in demo mode), store (localStorage + Supabase fetch)
tests/          unit.test.cjs (10 tests) + scripts/run-tests.mjs (`npm test`)
vercel.json     Vercel deploy config (framework: nextjs)
supabase/       schema.sql (MVP + v5 tables)
```

## Live

Production: https://roompartner-one.vercel.app — deployed from `main` on GitHub (harshvortex/roompartner).
