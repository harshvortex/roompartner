"use client";
import type { RentalItem, Room, RoommateProfile } from "@/lib/types";
import { inr } from "@/lib/bundle";
import { isStale } from "@/lib/store";
import { CompatRing } from "./CompatRing";

/** Listings older than 30 days are flagged stale — previously isStale() existed
 *  but was never shown anywhere, so the "30-day stale flag" claim was dead code. */
function StaleBadge({ createdAt }: { createdAt: string }) {
  if (!isStale(createdAt)) return null;
  return <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Stale · 30+ days</span>;
}

export function RoomCard({ room, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  room: Room; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <button onClick={onOpen} className="text-left w-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{room.title}</h3>
          <span className="flex shrink-0 gap-1">{room.verified && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Verified</span>}<StaleBadge createdAt={room.createdAt} />{room.status && room.status !== "active" && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">{room.status}</span>}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{room.locality}, {room.city} · {room.bhk} · {room.furnishing}</p>
        <p className="mt-2 text-lg font-bold">{inr(room.rent)}<span className="text-sm font-normal text-gray-500">/mo</span> <span className="text-xs font-normal text-gray-400">· deposit {inr(room.deposit)}</span></p>
        <p className="mt-1 text-xs text-emerald-700 font-medium">₹0 brokerage — you save {inr(room.rent)}</p>
        <p className="mt-2 text-xs text-gray-500">{room.amenities.slice(0, 4).join(" · ")}{room.amenities.length > 4 ? " …" : ""}</p>
      </button>
      <div className="mt-3 flex gap-2">
        <button onClick={onInterest} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Express interest</button>
        <button onClick={onBundle} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">+ Bundle</button>
        <button onClick={onToggleSave} aria-label="Save" className="rounded-lg border px-3 py-2 text-sm">{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}

export function RoommateCard({ person, score, saved, onToggleSave, onOpen, onInterest }: {
  person: RoommateProfile; score: number; saved: boolean; onToggleSave: () => void; onOpen: () => void; onInterest: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <button onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">{person.name[0]}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{person.name}, {person.age} {person.verified && <span className="text-emerald-600 text-xs">✓ Verified</span>} {isStale(person.createdAt ?? "") && <span className="text-amber-700 text-xs">· Stale</span>}</h3>
          <p className="text-sm text-gray-500 truncate">{person.occupation} · {person.city}</p>
          <p className="text-xs text-gray-500">Budget {inr(person.budgetMin)}–{inr(person.budgetMax)} · {person.food} · {person.sleepTime} sleeper</p>
        </div>
        <CompatRing score={score} />
      </button>
      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{person.bio}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onInterest} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Express interest</button>
        <button onClick={onToggleSave} aria-label="Save" className="rounded-lg border px-3 py-2 text-sm">{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}

export function RentalCard({ item, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  item: RentalItem; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <button onClick={onOpen} className="text-left w-full">
        <span className="flex flex-wrap gap-1"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">{item.category} · {item.condition}</span><StaleBadge createdAt={item.createdAt} />{item.verified && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Verified</span>}</span>
        <h3 className="mt-2 font-semibold leading-snug">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{item.locality}, {item.city} · by {item.ownerName}</p>
        <p className="mt-2 text-lg font-bold">{inr(item.pricePerMonth)}<span className="text-sm font-normal text-gray-500">/mo</span> <span className="text-xs font-normal text-gray-400">· deposit {inr(item.deposit)}</span></p>
      </button>
      <div className="mt-3 flex gap-2">
        <button onClick={onInterest} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Book item</button>
        <button onClick={onBundle} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">+ Bundle</button>
        <button onClick={onToggleSave} aria-label="Save" className="rounded-lg border px-3 py-2 text-sm">{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}
