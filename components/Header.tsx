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

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700" aria-label="RoomPartner — home">🏠 RoomPartner</Link>
        <nav aria-label="Primary" className="hidden gap-1 sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${path === l.href ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg border px-3 py-1.5 text-sm font-medium">Sign in</Link>
          <Link href="/onboarding" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white">Complete profile</Link>
        </div>
      </div>
      <nav aria-label="Primary mobile" className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${path === l.href ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}
