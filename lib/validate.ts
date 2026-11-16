/** Input validation — pure functions, shared by client forms and (where
 * applicable) server routes. Nothing here trusts the client: server routes
 * re-validate anything that affects money or identity. Ranges are the
 * production limits; anything outside them is rejected, not silently clamped. */

export function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function isValidText(value: unknown, maxLen = 200): value is string {
  if (typeof value !== "string") return false;
  const t = value.trim();
  // eslint-disable-next-line no-control-regex
  return t.length >= 1 && t.length <= maxLen && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(t);
}

/** Age 18–70, whole years. */
export function isValidAge(age: unknown): boolean {
  return isFiniteNumber(age) && Number.isInteger(age) && age >= 18 && age <= 70;
}

/** Monthly budget ₹500–₹2,00,000, min must not exceed max. */
export function isValidBudget(min: unknown, max: unknown): boolean {
  if (!isFiniteNumber(min) || !isFiniteNumber(max)) return false;
  return min >= 500 && max <= 200000 && min <= max && Number.isInteger(min) && Number.isInteger(max);
}

/** Room rent ₹500–₹2,00,000 per month. */
export function isValidRent(rent: unknown): boolean {
  return isFiniteNumber(rent) && Number.isInteger(rent) && rent >= 500 && rent <= 200000;
}

/** Deposit must be ₹0 up to 12× the monthly rent (the legal cap most states use). */
export function isValidDeposit(deposit: unknown, monthlyRent: unknown): boolean {
  if (!isFiniteNumber(deposit) || !isFiniteNumber(monthlyRent)) return false;
  return Number.isInteger(deposit) && deposit >= 0 && deposit <= 12 * monthlyRent;
}

/** Rental item price ₹50–₹50,000 per month. */
export function isValidPricePerMonth(price: unknown): boolean {
  return isFiniteNumber(price) && Number.isInteger(price) && price >= 50 && price <= 50000;
}

/** Cleanliness 1–5. */
export function isValidCleanliness(n: unknown): boolean {
  return isFiniteNumber(n) && Number.isInteger(n) && n >= 1 && n <= 5;
}

export interface ProfileInput {
  name: unknown;
  age: unknown;
  city: unknown;
  budgetMin: unknown;
  budgetMax: unknown;
  cleanliness: unknown;
  bio: unknown;
}

/** Validate a match profile. Returns a list of human-readable errors (empty = valid). */
export function validateProfile(p: ProfileInput): string[] {
  const errors: string[] = [];
  if (!isValidText(p.name, 80)) errors.push("Name is required (max 80 characters).");
  if (!isValidAge(p.age)) errors.push("Age must be between 18 and 70.");
  if (!isValidText(p.city, 60)) errors.push("Choose a city.");
  if (!isValidBudget(p.budgetMin, p.budgetMax)) errors.push("Budget must be ₹500–₹2,00,000 per month, and minimum must not exceed maximum.");
  if (!isValidCleanliness(p.cleanliness)) errors.push("Cleanliness must be 1–5.");
  if (p.bio !== undefined && p.bio !== null && p.bio !== "" && !isValidText(p.bio, 500)) errors.push("About you must be at most 500 characters.");
  return errors;
}

export interface RoomListingInput {
  title: unknown;
  locality: unknown;
  ownerName: unknown;
  rent: unknown;
  deposit: unknown;
  bhk: unknown;
}

export function validateRoomListing(r: RoomListingInput): string[] {
  const errors: string[] = [];
  if (!isValidText(r.title, 120)) errors.push("Title is required (max 120 characters).");
  if (!isValidText(r.locality, 80)) errors.push("Locality is required (max 80 characters).");
  if (!isValidText(r.ownerName, 80)) errors.push("Your name is required (max 80 characters).");
  if (!isValidRent(r.rent)) errors.push("Rent must be ₹500–₹2,00,000 per month.");
  if (!isValidDeposit(r.deposit, r.rent)) errors.push("Deposit must be between ₹0 and 12× the monthly rent.");
  if (!isValidText(r.bhk, 10)) errors.push("BHK is required (e.g. 2BHK).");
  return errors;
}

export interface RentalItemInput {
  title: unknown;
  locality: unknown;
  ownerName: unknown;
  pricePerMonth: unknown;
  deposit: unknown;
}

export function validateRentalItem(r: RentalItemInput): string[] {
  const errors: string[] = [];
  if (!isValidText(r.title, 120)) errors.push("Item name is required (max 120 characters).");
  if (!isValidText(r.locality, 80)) errors.push("Locality is required (max 80 characters).");
  if (!isValidText(r.ownerName, 80)) errors.push("Your name is required (max 80 characters).");
  if (!isValidPricePerMonth(r.pricePerMonth)) errors.push("Rent must be ₹50–₹50,000 per month.");
  if (!isValidDeposit(r.deposit, r.pricePerMonth)) errors.push("Deposit must be between ₹0 and 12× the monthly rent.");
  return errors;
}

/** Clamp a number into a range (used for range inputs, never for money). */
export function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
