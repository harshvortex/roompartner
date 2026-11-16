"use client";
import { useEffect, useState } from "react";
import type { BundleItem, ChatMessage, Conversation, Interest, MyProfile, RentalItem, Report, Room, RoommateProfile, SavedBundle, Squad, Visit } from "./types";
import { DEMO_RENTALS, DEMO_ROOMMATES, DEMO_ROOMS, DEMO_SQUADS } from "./seed";
import { getSupabase } from "./supabase";

export const DEFAULT_PROFILE: MyProfile = {
  name: "", age: 24, gender: "female", occupation: "", city: "", budgetMin: 8000, budgetMax: 12000,
  moveInDate: "2026-12-01", food: "veg", smoking: "no", alcohol: "no", sleepTime: "23:00",
  wakeTime: "07:00", cleanliness: 4, workHours: "9-6", wfh: "yes", pets: "no", guestsOk: "yes",
  languages: ["English"], bio: "", phoneVerified: false,
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked */ }
}

export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue] as const;
}

/** Demo-mode store: seed data + localStorage. When Supabase is configured, lists are
 *  fetched from Supabase first and localStorage is used only for profile/bundle/saved.
 *  FIX (final): "Clear demo" used to be session-only — navigating to another page
 *  re-mounted this hook and re-seeded the demo. The demo on/off choice is now
 *  persisted in localStorage ("rp-demo-loaded"), and user-created listings are
 *  de-duplicated against the demo ids so a listing can never appear twice. */
export function useListings() {
  const demoOn = () => load<boolean>("rp-demo-loaded", true);
  const merge = <T extends { id: string }>(mine: T[], demo: T[]) => {
    const ids = new Set(mine.map((m) => m.id));
    return [...mine, ...demo.filter((d) => !ids.has(d.id))];
  };
  const [roommates, setRoommates] = useState<RoommateProfile[]>(() => merge(load<RoommateProfile[]>("rp-my-roommates", []), demoOn() ? DEMO_ROOMMATES : []));
  const [rooms, setRooms] = useState<Room[]>(() => merge(load<Room[]>("rp-my-rooms", []), demoOn() ? DEMO_ROOMS : []));
  const [rentals, setRentals] = useState<RentalItem[]>(() => merge(load<RentalItem[]>("rp-my-rentals", []), demoOn() ? DEMO_RENTALS : []));
  const [demoLoaded, setDemoLoaded] = useState<boolean>(() => demoOn());

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    (async () => {
      const [rm, ro, re] = await Promise.all([
        sb.from("roommate_profiles").select("*"),
        sb.from("rooms").select("*"),
        sb.from("rental_items").select("*"),
      ]);
      if (rm.data?.length) setRoommates(rm.data as unknown as RoommateProfile[]);
      if (ro.data?.length) setRooms(ro.data as unknown as Room[]);
      if (re.data?.length) setRentals(re.data as unknown as RentalItem[]);
    })();
  }, []);

  const seedDemo = () => {
    save("rp-demo-loaded", true);
    setRoommates(merge(load<RoommateProfile[]>("rp-my-roommates", []), DEMO_ROOMMATES));
    setRooms(merge(load<Room[]>("rp-my-rooms", []), DEMO_ROOMS));
    setRentals(merge(load<RentalItem[]>("rp-my-rentals", []), DEMO_RENTALS));
    setDemoLoaded(true);
  };
  const clearDemo = () => {
    save("rp-demo-loaded", false);
    setRoommates(load<RoommateProfile[]>("rp-my-roommates", []));
    setRooms(load<Room[]>("rp-my-rooms", []));
    setRentals(load<RentalItem[]>("rp-my-rentals", []));
    setDemoLoaded(false);
  };
  return { roommates, rooms, rentals, demoLoaded, seedDemo, clearDemo, setRoommates, setRooms, setRentals };
}

export function useProfile() {
  return useLocal<MyProfile>("rp-my-profile", DEFAULT_PROFILE);
}
export function useSaved() {
  return useLocal<string[]>("rp-saved", []);
}
export function useInterests() {
  return useLocal<Interest[]>("rp-interests", []);
}
export function useBundle() {
  return useLocal<BundleItem[]>("rp-bundle", []);
}
export function useChecklist() {
  return useLocal<string[]>("rp-checklist", []);
}

// ---- v5 stores, carried into Final (localStorage in demo mode) ----
export function useConversations() { return useLocal<Conversation[]>("rp-conversations", []); }
export function useChatMessages() { return useLocal<ChatMessage[]>("rp-messages", []); }
export function useSquads() { return useLocal<Squad[]>("rp-squads", [...DEMO_SQUADS]); }
export function useVisits() { return useLocal<Visit[]>("rp-visits", []); }
export function useReports() { return useLocal<Report[]>("rp-reports", []); }
export function useSavedBundles() { return useLocal<SavedBundle[]>("rp-saved-bundles", []); }
export function useTrust() { return useLocal<{ phoneVerified: boolean; verifiedAt: string | null }>("rp-trust", { phoneVerified: false, verifiedAt: null }); }
// Move-in service requests (demo): partner referrals the user asked for, stored locally.
export function useServiceRequests() { return useLocal<string[]>("rp-service-requests", []); }
// ---- v7 stores (localStorage in demo mode) ----
export function useEscrows() { return useLocal<import("./types").Escrow[]>("rp-escrows", []); }
export function usePurchases() { return useLocal<string[]>("rp-purchases", []); }

/** Remove one of the user's own listings (created via /list-room or /list-item)
 *  from localStorage. Demo seed listings cannot be deleted this way. */
export function removeMyListing(kind: "room" | "rental", id: string) {
  const key = kind === "room" ? "rp-my-rooms" : "rp-my-rentals";
  const existing = load<unknown[]>(key, []);
  save(key, existing.filter((x) => (x as { id: string }).id !== id));
}

/** Change the status of one of the user's own rooms (active / paused / filled). */
export function setMyRoomStatus(id: string, status: "active" | "paused" | "filled") {
  const existing = load<Room[]>("rp-my-rooms", []);
  save("rp-my-rooms", existing.map((r) => (r.id === id ? { ...r, status } : r)));
}

/** Open (or create) a chat thread for an interest. Returns the conversation id. */
export function openConversation(
  convs: Conversation[], setConvs: (c: Conversation[]) => void,
  msgs: ChatMessage[], setMsgs: (m: ChatMessage[]) => void,
  targetType: "room" | "roommate" | "rental", targetId: string, title: string, otherName: string, firstMessage: string,
): string {
  const existing = convs.find((c) => c.targetType === targetType && c.targetId === targetId);
  if (existing) return existing.id;
  const id = `c-${Date.now()}`;
  const conv: Conversation = { id, title, targetType, targetId, otherName, createdAt: new Date().toISOString() };
  setConvs([...convs, conv]);
  setMsgs([...msgs, { id: `m-${Date.now()}`, conversationId: id, sender: "me", body: firstMessage, createdAt: new Date().toISOString() }]);
  return id;
}

/** A listing is stale if it is older than 30 days — the simple fix most platforms skip. */
export function isStale(createdAt: string, days = 30): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}
