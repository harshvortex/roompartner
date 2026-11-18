"use client";
import type { RentalItem, Room, RoommateProfile } from "@/lib/types";
import { inr } from "@/lib/bundle";
import { isStale } from "@/lib/store";
import { CompatRing } from "./CompatRing";

/** Listings older than 30 days are flagged stale — previously isStale() existed
 *  but was never shown anywhere, so the "30-day stale flag" claim was dead code. */
function StaleBadge({ createdAt }: { createdAt: string }) {
  if (!isStale(createdAt)) return null;
  return <span className="badge-stale">Stale · 30+ days</span>;
}

function VerifiedBadge() {
  return <span className="badge-verified">✓ Verified</span>;
}

/** Stable gradient per listing id, so each card's visual stays the same across renders. */
function gradFor(id: string, kinds: string[]) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return kinds[h % kinds.length];
}

const AVATAR_GRADS = ["avatar-grad-0", "avatar-grad-1", "avatar-grad-2", "avatar-grad-3", "avatar-grad-4", "avatar-grad-5"];
const ROOM_GRADS = ["room-thumb-0", "room-thumb-1", "room-thumb-2", "room-thumb-3"];

const CATEGORY_ICON: Record<string, string> = {
  furniture: "🛋️",
  appliance: "🔌",
  electronics: "📺",
  daily: "🧺",
};

export function RoomCard({ room, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  room: Room; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  const thumb = gradFor(room.id, ROOM_GRADS);
  return (
    <article className="card-hover group overflow-hidden p-0">
      <button onClick={onOpen} className="block w-full text-left">
        <div className={`relative flex h-28 items-end justify-between p-4 ${thumb}`}>
          <span className="pill bg-white/90 shadow-sm">{room.bhk} · {room.furnishing}</span>
          <span className="flex gap-1.5">{room.verified && <VerifiedBadge />}<StaleBadge createdAt={room.createdAt} />{room.status && room.status !== "active" && <span className="pill capitalize bg-white/90">{room.status}</span>}</span>
          <span className="absolute right-4 top-3 text-3xl opacity-25" aria-hidden="true">🏠</span>
        </div>
        <div className="p-5 pt-4">
          <h3 className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{room.title}</h3>
          <p className="mt-1 text-sm text-ink-500">{room.locality}, {room.city} · Available {room.availableFrom}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{inr(room.rent)}<span className="text-sm font-medium text-ink-400">/mo</span> <span className="text-xs font-normal text-ink-400">· deposit {inr(room.deposit)}</span></p>
          <p className="mt-1 text-xs font-semibold text-ok-700">₹0 brokerage — you save {inr(room.rent)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 4).map((a) => <span key={a} className="pill">{a}</span>)}
            {room.amenities.length > 4 && <span className="pill">+{room.amenities.length - 4} more</span>}
          </div>
        </div>
      </button>
      <div className="flex gap-2 border-t border-zinc-100 p-3">
        <button onClick={onInterest} className="btn-primary flex-1">Express interest</button>
        <button onClick={onBundle} className="btn-secondary">+ Bundle</button>
        <button onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save this room"} aria-pressed={saved} className={`btn-secondary ${saved ? "!border-brand-200 !bg-brand-50 !text-brand-700" : ""}`}>{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}

export function RoommateCard({ person, score, saved, onToggleSave, onOpen, onInterest }: {
  person: RoommateProfile; score: number; saved: boolean; onToggleSave: () => void; onOpen: () => void; onInterest: () => void;
}) {
  const avatar = gradFor(person.id, AVATAR_GRADS);
  return (
    <article className="card-hover group relative overflow-hidden">
      <button onClick={onOpen} className="flex w-full items-start gap-4 text-left">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-sm ${avatar}`} aria-hidden="true">{person.name[0]}</div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-ink-900 group-hover:text-brand-700">{person.name}, {person.age} {person.verified && <VerifiedBadge />} {isStale(person.createdAt ?? "") && <span className="badge-stale">Stale</span>}</h3>
          <p className="truncate text-sm text-ink-500">{person.occupation} · {person.city}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-800">Budget {inr(person.budgetMin)}–{inr(person.budgetMax)}<span className="font-normal text-ink-400">/mo</span></p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="pill">{person.food}</span>
            <span className="pill">{person.sleepTime} sleeper</span>
            <span className="pill">{person.wfh === "yes" ? "WFH" : "Office"}</span>
          </div>
        </div>
        <CompatRing score={score} size={76} />
      </button>
      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600">{person.bio}</p>
      <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-4">
        <button onClick={onInterest} className="btn-primary flex-1">Express interest</button>
        <button onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save this flatmate"} aria-pressed={saved} className={`btn-secondary ${saved ? "!border-brand-200 !bg-brand-50 !text-brand-700" : ""}`}>{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}

export function RentalCard({ item, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  item: RentalItem; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  const thumb = gradFor(item.id, ROOM_GRADS);
  return (
    <article className="card-hover group overflow-hidden p-0">
      <button onClick={onOpen} className="block w-full text-left">
        <div className={`relative flex h-24 items-end justify-between p-4 ${thumb}`}>
          <span className="pill bg-white/90 shadow-sm capitalize">{item.category} · {item.condition}</span>
          <span className="flex gap-1.5"><StaleBadge createdAt={item.createdAt} />{item.verified && <VerifiedBadge />}</span>
          <span className="absolute right-4 top-2 text-3xl opacity-25" aria-hidden="true">{CATEGORY_ICON[item.category] ?? "📦"}</span>
        </div>
        <div className="p-5 pt-4">
          <h3 className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{item.title}</h3>
          <p className="mt-1 text-sm text-ink-500">{item.locality}, {item.city} · by {item.ownerName}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{inr(item.pricePerMonth)}<span className="text-sm font-medium text-ink-400">/mo</span> <span className="text-xs font-normal text-ink-400">· deposit {inr(item.deposit)}</span></p>
        </div>
      </button>
      <div className="flex gap-2 border-t border-zinc-100 p-3">
        <button onClick={onInterest} className="btn-primary flex-1">Book item</button>
        <button onClick={onBundle} className="btn-secondary">+ Bundle</button>
        <button onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save this item"} aria-pressed={saved} className={`btn-secondary ${saved ? "!border-brand-200 !bg-brand-50 !text-brand-700" : ""}`}>{saved ? "♥ Saved" : "♡ Save"}</button>
      </div>
    </article>
  );
}
