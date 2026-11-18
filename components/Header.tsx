"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/flatmates", label: "Flatmates" },
  { href: "/rooms", label: "Rooms" },
  { href: "/rentals", label: "Rentals" },
  { href: "/squads", label: "Squads" },
  { href: "/chats", label: "Chats" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-space", label: "My Space" },
];

/** Thumb-friendly bottom nav (mobile only): the five most-used destinations. */
const BOTTOM_LINKS = [
  { href: "/", label: "Home", icon: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" },
  { href: "/flatmates", label: "Flatmates", icon: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM22 19v-1a4 4 0 0 0-3-3.87M15 3.13a3 3 0 0 1 0 5.75" },
  { href: "/rooms", label: "Rooms", icon: "M3 11l9-8 9 8M5 10v10h14V10M9 20v-6h6v6" },
  { href: "/rentals", label: "Rentals", icon: "M21 8v13H3V8M1 3h22v5H1zM10 12h4" },
  { href: "/my-space", label: "My Space", icon: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RoomPartner — home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-ink-900">RoomPartner</span>
            <span className="block text-[11px] font-semibold text-brand-600">₹0 brokerage · broker-free</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`rounded-full px-3 py-2 text-sm font-semibold transition ${path === l.href ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100" : "text-ink-600 hover:bg-zinc-100 hover:text-ink-900"}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary btn-sm hidden sm:inline-flex">Sign in</Link>
          <Link href="/onboarding" className="btn-primary btn-sm sm:!px-4 sm:!py-2.5 sm:!text-sm">Find my match</Link>
        </div>
      </div>
      <nav aria-label="Primary mobile" className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 lg:hidden">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${path === l.href ? "bg-brand-600 text-white shadow-sm" : "bg-surface-muted text-ink-600"}`}>{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}

export function MobileBottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-pop backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {BOTTOM_LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition ${active ? "text-brand-600" : "text-ink-400 hover:text-ink-700"}`}>
              <NavIcon d={l.icon} />
              {l.label}
              <span className={`h-1 w-6 rounded-full ${active ? "bg-brand-600" : "bg-transparent"}`} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
