"use client";
import type { RentalItem, Room, RoommateProfile } from "@/lib/types";
import { inr } from "@/lib/bundle";
import { isStale } from "@/lib/store";
import { CompatRing } from "./CompatRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Home, Sofa, Plug, Tv, ShoppingBasket, Package } from "lucide-react";
import { cn } from "@/lib/utils";

/** Listings older than 30 days are flagged stale — previously isStale() existed
 *  but was never shown anywhere, so the "30-day stale flag" claim was dead code. */
function StaleBadge({ createdAt }: { createdAt: string }) {
  if (!isStale(createdAt)) return null;
  return <Badge variant="warning">Stale · 30+ days</Badge>;
}

function VerifiedBadge() {
  return <Badge variant="success">✓ Verified</Badge>;
}

/** Stable gradient per listing id, so each card's visual stays the same across renders. */
function gradFor(id: string, kinds: string[]) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return kinds[h % kinds.length];
}

const AVATAR_GRADS = ["avatar-grad-0", "avatar-grad-1", "avatar-grad-2", "avatar-grad-3", "avatar-grad-4", "avatar-grad-5"];
const ROOM_GRADS = ["room-thumb-0", "room-thumb-1", "room-thumb-2", "room-thumb-3"];

const CATEGORY_ICON: Record<string, typeof Sofa> = {
  furniture: Sofa,
  appliance: Plug,
  electronics: Tv,
  daily: ShoppingBasket,
};

function SaveButton({ saved, onToggleSave, label }: { saved: boolean; onToggleSave: () => void; label: string }) {
  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      onClick={onToggleSave}
      aria-label={saved ? `Remove from saved` : `Save this ${label}`}
      aria-pressed={saved}
      className={cn(saved && "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100")}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} /> {saved ? "Saved" : "Save"}
    </Button>
  );
}

export function RoomCard({ room, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  room: Room; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  const thumb = gradFor(room.id, ROOM_GRADS);
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
      <button onClick={onOpen} className="block w-full text-left">
        <div className={cn("relative flex h-28 items-end justify-between p-4", thumb)}>
          <Badge variant="secondary" className="bg-white/90 shadow-sm">{room.bhk} · {room.furnishing}</Badge>
          <span className="flex gap-1.5">{room.verified && <VerifiedBadge />}<StaleBadge createdAt={room.createdAt} />{room.status && room.status !== "active" && <Badge variant="secondary" className="bg-white/90 capitalize">{room.status}</Badge>}</span>
          <Home className="absolute right-4 top-3 h-8 w-8 text-ink-900/20" aria-hidden="true" />
        </div>
        <CardContent className="p-5 pt-4">
          <h3 className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{room.title}</h3>
          <p className="mt-1 text-sm text-ink-500">{room.locality}, {room.city} · Available {room.availableFrom}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{inr(room.rent)}<span className="text-sm font-medium text-ink-400">/mo</span> <span className="text-xs font-normal text-ink-400">· deposit {inr(room.deposit)}</span></p>
          <p className="mt-1 text-xs font-semibold text-ok-700">₹0 brokerage — you save {inr(room.rent)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 4).map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
            {room.amenities.length > 4 && <Badge variant="secondary">+{room.amenities.length - 4} more</Badge>}
          </div>
        </CardContent>
      </button>
      <CardFooter className="border-t border-zinc-100 p-3">
        <Button onClick={onInterest} className="flex-1">Express interest</Button>
        <Button variant="outline" onClick={onBundle}>+ Bundle</Button>
        <SaveButton saved={saved} onToggleSave={onToggleSave} label="room" />
      </CardFooter>
    </Card>
  );
}

export function RoommateCard({ person, score, saved, onToggleSave, onOpen, onInterest }: {
  person: RoommateProfile; score: number; saved: boolean; onToggleSave: () => void; onOpen: () => void; onInterest: () => void;
}) {
  const avatar = gradFor(person.id, AVATAR_GRADS);
  return (
    <Card className="group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
      <CardContent className="p-5">
        <button onClick={onOpen} className="flex w-full items-start gap-4 text-left">
          <Avatar className={cn("h-16 w-16 rounded-2xl shadow-sm", avatar)}>
            <AvatarFallback className={cn("rounded-2xl bg-transparent text-2xl font-extrabold text-white", avatar)}>{person.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-ink-900 group-hover:text-brand-700">{person.name}, {person.age} {person.verified && <VerifiedBadge />} {isStale(person.createdAt ?? "") && <Badge variant="warning">Stale</Badge>}</h3>
            <p className="truncate text-sm text-ink-500">{person.occupation} · {person.city}</p>
            <p className="mt-0.5 text-sm font-semibold text-ink-800">Budget {inr(person.budgetMin)}–{inr(person.budgetMax)}<span className="font-normal text-ink-400">/mo</span></p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{person.food}</Badge>
              <Badge variant="secondary">{person.sleepTime} sleeper</Badge>
              <Badge variant="secondary">{person.wfh === "yes" ? "WFH" : "Office"}</Badge>
            </div>
          </div>
          <CompatRing score={score} size={76} />
        </button>
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600">{person.bio}</p>
      </CardContent>
      <CardFooter className="border-t border-zinc-100 p-3 pt-4">
        <Button onClick={onInterest} className="flex-1">Express interest</Button>
        <SaveButton saved={saved} onToggleSave={onToggleSave} label="flatmate" />
      </CardFooter>
    </Card>
  );
}

export function RentalCard({ item, saved, onToggleSave, onOpen, onBundle, onInterest }: {
  item: RentalItem; saved: boolean; onToggleSave: () => void; onOpen: () => void; onBundle: () => void; onInterest: () => void;
}) {
  const thumb = gradFor(item.id, ROOM_GRADS);
  const CategoryIcon = CATEGORY_ICON[item.category] ?? Package;
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
      <button onClick={onOpen} className="block w-full text-left">
        <div className={cn("relative flex h-24 items-end justify-between p-4", thumb)}>
          <Badge variant="secondary" className="bg-white/90 shadow-sm capitalize">{item.category} · {item.condition}</Badge>
          <span className="flex gap-1.5"><StaleBadge createdAt={item.createdAt} />{item.verified && <VerifiedBadge />}</span>
          <CategoryIcon className="absolute right-4 top-2 h-8 w-8 text-ink-900/20" aria-hidden="true" />
        </div>
        <CardContent className="p-5 pt-4">
          <h3 className="font-bold leading-snug text-ink-900 group-hover:text-brand-700">{item.title}</h3>
          <p className="mt-1 text-sm text-ink-500">{item.locality}, {item.city} · by {item.ownerName}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{inr(item.pricePerMonth)}<span className="text-sm font-medium text-ink-400">/mo</span> <span className="text-xs font-normal text-ink-400">· deposit {inr(item.deposit)}</span></p>
        </CardContent>
      </button>
      <CardFooter className="border-t border-zinc-100 p-3">
        <Button onClick={onInterest} className="flex-1">Book item</Button>
        <Button variant="outline" onClick={onBundle}>+ Bundle</Button>
        <SaveButton saved={saved} onToggleSave={onToggleSave} label="item" />
      </CardFooter>
    </Card>
  );
}
