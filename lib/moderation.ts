/** Automated moderation — rule-based, no ML, no external API.
 * Runs over listings (rooms, rentals, roommate profiles) and returns flags
 * with a reason. A flag does NOT delete or hide a listing by itself: it
 * lands in the moderation queue (Dashboard) for a human to review, then
 * open → reviewed → actioned. */

export interface ModerationFlag {
  targetId: string;
  targetLabel: string;
  targetType: "room" | "roommate" | "rental";
  reason: string;
  severity: "low" | "medium" | "high";
}

export const BANNED_WORDS = [
  "broker", "brokerage", "commission", "advance payment", "pay advance",
  "send money first", "fake", "guaranteed allotment", "pay before visit",
];

export function bannedWordIn(text: string): string | null {
  const lower = (text || "").toLowerCase();
  for (const w of BANNED_WORDS) if (lower.includes(w)) return w;
  return null;
}

export function isSuspiciousPrice(rent: number, deposit: number): string | null {
  if (!rent || rent <= 0) return "no rent/price set";
  if (rent < 1000) return `rent ₹${rent} is suspiciously low`;
  if (rent > 200000) return `rent ₹${rent} is suspiciously high`;
  if (deposit > 12 * rent) return `deposit ₹${deposit} is more than 12× the rent`;
  return null;
}

export interface Flaggable {
  id: string;
  title: string;
  type: "room" | "roommate" | "rental";
  text: string; // title + bio/description, for banned-word scan
  rent: number;
  deposit: number;
  city: string;
  phone?: string;
  ownerName?: string;
}

/** Flag one listing. `seenPhones` maps phone → count, for duplicate-phone detection. */
export function autoFlagListing(item: Flaggable, seenPhones: Record<string, number>): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  const base = { targetId: item.id, targetLabel: item.title, targetType: item.type } as const;
  const banned = bannedWordIn(item.text);
  if (banned) flags.push({ ...base, reason: `banned phrase: "${banned}"`, severity: "high" });
  const price = isSuspiciousPrice(item.rent, item.deposit);
  if (price) flags.push({ ...base, reason: price, severity: "medium" });
  if (!item.city) flags.push({ ...base, reason: "no city set", severity: "low" });
  if (item.phone && (seenPhones[item.phone] || 0) > 1)
    flags.push({ ...base, reason: `phone ${item.phone} used on ${seenPhones[item.phone]} listings`, severity: "medium" });
  return flags;
}

export function autoFlagAll(items: Flaggable[]): ModerationFlag[] {
  const seenPhones: Record<string, number> = {};
  for (const it of items) if (it.phone) seenPhones[it.phone] = (seenPhones[it.phone] || 0) + 1;
  return items.flatMap((it) => autoFlagListing(it, seenPhones));
}
