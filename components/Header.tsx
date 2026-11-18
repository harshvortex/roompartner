"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, DoorOpen, Package, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  { href: "/", label: "Home", Icon: Home },
  { href: "/flatmates", label: "Flatmates", Icon: Users },
  { href: "/rooms", label: "Rooms", Icon: DoorOpen },
  { href: "/rentals", label: "Rentals", Icon: Package },
  { href: "/my-space", label: "My Space", Icon: User },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RoomPartner — home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm" aria-hidden="true">
            <Home className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-ink-900">RoomPartner</span>
            <span className="block text-[11px] font-semibold text-brand-600">₹0 brokerage · broker-free</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold transition",
                path === l.href ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100" : "text-ink-600 hover:bg-zinc-100 hover:text-ink-900",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="sm:h-11 sm:px-4 sm:py-2.5 sm:text-sm">
            <Link href="/onboarding">
              <Search className="h-4 w-4" /> Find my match
            </Link>
          </Button>
        </div>
      </div>
      <nav aria-label="Primary mobile" className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 lg:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={path === l.href ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition",
              path === l.href ? "bg-brand-600 text-white shadow-sm" : "bg-surface-muted text-ink-600",
            )}
          >
            {l.label}
          </Link>
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
        {BOTTOM_LINKS.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[60px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition",
                active ? "text-brand-600" : "text-ink-400 hover:text-ink-700",
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
              {label}
              <span className={cn("h-1 w-6 rounded-full", active ? "bg-brand-600" : "bg-transparent")} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
