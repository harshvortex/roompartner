export type Food = "veg" | "non-veg" | "flexible";
export type YesNo = "yes" | "no";

export interface MyProfile {
  id?: string;
  name: string;
  age: number;
  gender: "female" | "male" | "other";
  occupation: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  food: Food;
  smoking: YesNo;
  alcohol: YesNo;
  sleepTime: string; // "23:00"
  wakeTime: string;
  cleanliness: number; // 1-5
  workHours: string; // "9-6" | "night" | "flexible"
  wfh: YesNo;
  pets: YesNo;
  guestsOk: YesNo;
  languages: string[];
  bio: string;
  phoneVerified: boolean;
}

export interface RoommateProfile extends MyProfile {
  id: string;
  verified?: boolean;
  trustScore?: number; // 0-100, see lib/verification.ts
  createdAt?: string; // ISO date — listings older than 30 days are flagged stale
}

export interface Room {
  id: string;
  title: string;
  type: "room" | "flat" | "pg";
  city: string;
  locality: string;
  rent: number;
  deposit: number;
  furnishing: "furnished" | "semi-furnished" | "unfurnished";
  bhk: string;
  availableFrom: string;
  genderPref: "any" | "female" | "male";
  foodPref: Food;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  amenities: string[];
  photos: string[];
  ownerName: string;
  verified?: boolean;
  status?: ListingStatus;
  views?: number;
  createdAt: string;
}

export interface RentalItem {
  id: string;
  title: string;
  category: "furniture" | "appliance" | "electronics" | "daily";
  pricePerMonth: number;
  deposit: number;
  condition: "new" | "like-new" | "good";
  city: string;
  locality: string;
  ownerName: string;
  photos: string[];
  verified?: boolean;
  createdAt: string;
}

export interface Interest {
  id: string;
  targetType: "room" | "roommate" | "rental";
  targetId: string;
  message: string;
  createdAt: string;
}

export interface BundleItem {
  kind: "room" | "rental";
  id: string;
  title: string;
  monthly: number;
  deposit: number;
}

// ---- v5 types, carried into Final ----
export interface Conversation {
  id: string;
  title: string; // e.g. "Aarav Mehta — Private room in 2BHK, HSR Layout"
  targetType: "room" | "roommate" | "rental";
  targetId: string;
  otherName: string;
  createdAt: string;
}
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  body: string;
  createdAt: string;
}
export interface Squad {
  id: string;
  name: string;
  target: string; // e.g. "2BHK in HSR Layout"
  city: string;
  budgetPerPerson: number;
  members: string[]; // names
  maxMembers: number;
  createdAt: string;
}
export interface Visit {
  id: string;
  roomId: string;
  roomTitle: string;
  date: string;
  time: string;
  status: "requested" | "confirmed" | "done" | "cancelled";
  createdAt: string;
}
export interface Report {
  id: string;
  targetType: "room" | "roommate" | "rental" | "user";
  targetId: string;
  targetLabel: string;
  reason: string;
  status: "open" | "reviewed" | "actioned";
  createdAt: string;
}
export interface SavedBundle {
  id: string;
  name: string;
  items: BundleItem[];
  savedAt: string;
}
export type ListingStatus = "active" | "paused" | "filled";

// ---- v7 types ----
export type EscrowStatus = "created" | "held" | "released" | "refunded" | "disputed";
export interface Escrow {
  id: string;
  roomId: string;
  roomTitle: string;
  amount: number; // deposit, ₹ — DEMO ONLY, no real money moves
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
}
export interface PurchaseRecord {
  product: string;
  paymentId: string;
  mode: "demo" | "test";
  paidAt: string;
}
