// Unit tests for the pure logic in lib/ (compiled to .test-build/ by
// scripts/run-tests.mjs). Run with: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const { compatibilityScore, matchLabel } = require("../.test-build/compatibility.js");
const { bundleSummary } = require("../.test-build/bundle.js");
const { splitCost, splitByShare } = require("../.test-build/rentSplit.js");
const { trustScore, trustLabel } = require("../.test-build/verification.js");
const { isStale } = require("../.test-build/store.js");
const { isValidIndianPhone, normalisePhone, isValidOtp, verifyDemoOtp } = require("../.test-build/auth.js");
const { PRODUCTS, productAmount, isDemoOrder, isDemoPayment, formatRupees } = require("../.test-build/payments.js");
const { autoFlagListing, autoFlagAll, bannedWordIn, isSuspiciousPrice } = require("../.test-build/moderation.js");
const { createEscrow, transitionEscrow, canTransition, nextActions } = require("../.test-build/escrow.js");
const { channelNameForConversation, realtimeAvailable } = require("../.test-build/realtime.js");

const me = {
  name: "Test", age: 24, gender: "female", occupation: "Engineer", city: "Bengaluru",
  budgetMin: 8000, budgetMax: 12000, moveInDate: "2026-12-01", food: "veg", smoking: "no",
  alcohol: "no", sleepTime: "23:00", wakeTime: "07:00", cleanliness: 4, workHours: "9-6",
  wfh: "yes", pets: "no", guestsOk: "yes", languages: ["English"], bio: "", phoneVerified: false,
};
const identical = { ...me, id: "rm-x", verified: true, createdAt: "2026-11-14" };

test("identical profiles score 100 (weights sum to 100)", () => {
  const r = compatibilityScore(me, identical);
  assert.equal(r.score, 100);
  assert.deepEqual(r.breakdown, { budget: 25, food: 15, smoking: 10, sleep: 15, cleanliness: 15, work: 10, guests: 10 });
});

test("different city is a hard filter: score 0", () => {
  const r = compatibilityScore(me, { ...identical, city: "Mumbai" });
  assert.equal(r.score, 0);
});

test("cleanliness within 1 scores 15, 2 away scores 8, 3 away scores 0", () => {
  assert.equal(compatibilityScore(me, { ...identical, cleanliness: 5 }).breakdown.cleanliness, 15);
  assert.equal(compatibilityScore(me, { ...identical, cleanliness: 2 }).breakdown.cleanliness, 8);
  assert.equal(compatibilityScore(me, { ...identical, cleanliness: 1 }).breakdown.cleanliness, 0);
});

test("guests mismatch scores 0, budget far apart scores 0", () => {
  assert.equal(compatibilityScore(me, { ...identical, guestsOk: "no" }).breakdown.guests, 0);
  assert.equal(compatibilityScore(me, { ...identical, budgetMax: 20000 }).breakdown.budget, 0);
});

test("empty profile scores neutral half-credit, not zero", () => {
  const empty = { ...me, city: "", budgetMax: 0, food: "", smoking: "", sleepTime: "", cleanliness: 0, workHours: "", guestsOk: "" };
  const r = compatibilityScore(empty, { ...identical, city: "", budgetMax: 0, food: "", smoking: "", sleepTime: "", cleanliness: 0, workHours: "", guestsOk: "" });
  assert.equal(r.score, 52); // 13+8+5+8+8+5+5
});

test("match labels", () => {
  assert.equal(matchLabel(90), "Great match");
  assert.equal(matchLabel(75), "Good match");
  assert.equal(matchLabel(60), "Decent match");
  assert.equal(matchLabel(20), "Low match");
});

test("bundle summary: room + bed, brokerage saved is one month's rent", () => {
  const s = bundleSummary([
    { kind: "room", id: "room-1", title: "Room", monthly: 11000, deposit: 22000 },
    { kind: "rental", id: "rent-1", title: "Bed", monthly: 549, deposit: 1098 },
  ]);
  assert.equal(s.monthlyTotal, 11549);
  assert.equal(s.depositTotal, 23098);
  assert.equal(s.firstMonthCost, 34647);
  assert.equal(s.brokerageSaved, 11000);
  assert.equal(s.itemCount, 2);
});

test("rent split: equal and weighted", () => {
  assert.equal(splitCost(12000, 3).perPerson, 4000);
  assert.equal(splitCost(11549, 2).perPerson, 5775); // rounded
  assert.deepEqual(splitByShare(10000, [1, 1, 2]), [2500, 2500, 5000]);
});

test("trust score: base 42, +30 phone, +20 complete = 92 max", () => {
  assert.equal(trustScore({ phoneVerified: false, profileComplete: false }), 42);
  assert.equal(trustScore({ phoneVerified: true, profileComplete: false }), 72);
  assert.equal(trustScore({ phoneVerified: true, profileComplete: true }), 92);
  assert.equal(trustLabel(92), "Highly trusted");
  assert.equal(trustLabel(42), "New");
});

test("stale flag: older than 30 days", () => {
  assert.equal(isStale("2020-01-01"), true);
  assert.equal(isStale(new Date().toISOString().slice(0, 10)), false);
});

// ---- v7: auth helpers ----
test("auth: Indian phone validation + normalisation + demo OTP", () => {
  assert.equal(isValidIndianPhone("9876543210"), true);
  assert.equal(isValidIndianPhone("+91 98765 43210"), true);
  assert.equal(isValidIndianPhone("12345"), false);
  assert.equal(isValidIndianPhone("5876543210"), false);
  assert.equal(normalisePhone("9876543210"), "+919876543210");
  assert.equal(isValidOtp("123456"), true);
  assert.equal(isValidOtp("12345"), false);
  assert.equal(verifyDemoOtp("123456"), true);
  assert.equal(verifyDemoOtp("000000"), false);
});

// ---- v7: payments (test mode only) ----
test("payments: products are ₹99/₹99/₹199 in paise, demo ids recognised", () => {
  assert.equal(productAmount("seekerPass"), 9900);
  assert.equal(productAmount("verification"), 9900);
  assert.equal(productAmount("ownerBoost"), 19900);
  assert.equal(PRODUCTS.seekerPass.name, "Seeker Pass");
  assert.equal(isDemoOrder("order_demo_123"), true);
  assert.equal(isDemoOrder("order_abc"), false);
  assert.equal(isDemoPayment("pay_demo_123"), true);
  assert.equal(formatRupees(9900), "₹99");
});

// ---- v7: auto-moderation ----
test("moderation: banned phrase, suspicious price, duplicate phone", () => {
  assert.equal(bannedWordIn("No broker, direct owner"), "broker");
  assert.equal(bannedWordIn("Clean 2BHK near park"), null);
  assert.equal(isSuspiciousPrice(500, 10000), "rent ₹500 is suspiciously low");
  assert.equal(isSuspiciousPrice(10000, 200000), "deposit ₹200000 is more than 12× the rent");
  assert.equal(isSuspiciousPrice(10000, 20000), null);
  const flags = autoFlagListing(
    { id: "r1", title: "Room", type: "room", text: "broker free room, pay advance before visit", rent: 10000, deposit: 20000, city: "Bengaluru", phone: "9876543210" },
    { "9876543210": 2 },
  );
  assert.ok(flags.some((f) => f.reason.includes("banned phrase")));
  assert.ok(flags.some((f) => f.reason.includes("phone")));
  assert.equal(autoFlagAll([{ id: "r2", title: "Room", type: "room", text: "Clean room", rent: 10000, deposit: 20000, city: "Bengaluru" }]).length, 0);
});

// ---- v7: escrow state machine (demo only) ----
test("escrow: created → held → released, invalid transitions rejected", () => {
  const e = createEscrow("room-1", "Room", 22000);
  assert.equal(e.status, "created");
  assert.deepEqual(nextActions("created"), ["held"]);
  const held = transitionEscrow(e, "held");
  assert.equal(held.status, "held");
  assert.deepEqual(nextActions("held"), ["released", "refunded", "disputed"]);
  assert.equal(transitionEscrow(held, "released").status, "released");
  assert.equal(canTransition("created", "released"), false);
  assert.throws(() => transitionEscrow(e, "released"), /Invalid escrow transition/);
  assert.equal(transitionEscrow(transitionEscrow(held, "disputed"), "refunded").status, "refunded");
});

// ---- v7: realtime channel naming ----
test("realtime: channel name is per-conversation, demo mode has no Realtime", () => {
  assert.equal(channelNameForConversation("abc-123"), "messages:conv:abc-123");
  assert.equal(realtimeAvailable(), false); // no Supabase env vars in test env
});

// ---- v8: input validation ----
const { isValidAge, isValidBudget, isValidRent, isValidDeposit, isValidPricePerMonth, validateProfile, validateRoomListing, validateRentalItem, clampNumber } = require("../.test-build/validate.js");
const { createRateLimiter } = require("../.test-build/rateLimit.js");
const { isAllowedAmount } = require("../.test-build/payments.js");
const { verifyPaymentSignature } = require("../.test-build/paymentVerify.js");
const { buildHealthStatus } = require("../.test-build/health.js");

test("validate: budgets, age, rent, deposit caps", () => {
  assert.equal(isValidAge(24), true);
  assert.equal(isValidAge(17), false);
  assert.equal(isValidAge(71), false);
  assert.equal(isValidBudget(8000, 12000), true);
  assert.equal(isValidBudget(12000, 8000), false);
  assert.equal(isValidBudget(100, 12000), false);
  assert.equal(isValidBudget(8000, 500000), false);
  assert.equal(isValidRent(10000), true);
  assert.equal(isValidRent(100), false);
  assert.equal(isValidDeposit(20000, 10000), true);
  assert.equal(isValidDeposit(200001, 10000), false); // over 12x rent
  assert.equal(isValidPricePerMonth(499), true);
  assert.equal(isValidPricePerMonth(10), false);
  assert.equal(clampNumber(99, 1, 5), 5);
});

test("validate: profile and listing errors are human-readable", () => {
  const errs = validateProfile({ name: "", age: 15, city: "", budgetMin: 12000, budgetMax: 8000, cleanliness: 9, bio: "" });
  assert.ok(errs.length >= 5);
  assert.ok(errs.some((e) => e.includes("Age")));
  assert.equal(validateProfile({ name: "A", age: 24, city: "Bengaluru", budgetMin: 8000, budgetMax: 12000, cleanliness: 4, bio: "" }).length, 0);
  assert.ok(validateRoomListing({ title: "Room", locality: "HSR", ownerName: "A", rent: 100, deposit: 0, bhk: "2BHK" }).some((e) => e.includes("Rent")));
  assert.equal(validateRentalItem({ title: "Bed", locality: "HSR", ownerName: "A", pricePerMonth: 499, deposit: 998 }).length, 0);
});

// ---- v8: rate limiting ----
test("rateLimit: allows up to max, then blocks, per key", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  assert.equal(limiter.check("ip-1").allowed, true);
  assert.equal(limiter.check("ip-1").allowed, true);
  assert.equal(limiter.check("ip-1").allowed, false);
  assert.equal(limiter.check("ip-1").remaining, 0);
  assert.equal(limiter.check("ip-2").allowed, true); // different key, own bucket
});

test("rateLimit: window resets after expiry", () => {
  const limiter = createRateLimiter({ windowMs: 10, max: 1 });
  assert.equal(limiter.check("k", 1000).allowed, true);
  assert.equal(limiter.check("k", 1005).allowed, false);
  assert.equal(limiter.check("k", 1011).allowed, true);
});

// ---- v8: payment signature is timing-safe and rejects bad input ----
test("payments: timing-safe signature verify, amount whitelist", () => {
  const crypto = require("node:crypto");
  const secret = "test-secret";
  const sig = crypto.createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", sig, secret), true);
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "0".repeat(64), secret), false);
  assert.equal(verifyPaymentSignature("order_1", "pay_1", sig, "wrong-secret"), false);
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "short", secret), false);
  assert.equal(verifyPaymentSignature("", "pay_1", sig, secret), false);
  assert.equal(isAllowedAmount(9900), true);
  assert.equal(isAllowedAmount(19900), true);
  assert.equal(isAllowedAmount(5000), false);
  assert.equal(isAllowedAmount("9900"), false);
});

// ---- v8: health payload ----
test("health: payload has version, mode, no secrets", () => {
  const h = buildHealthStatus({ version: "8.0.0", mode: "demo", uptimeSeconds: 42.7, supabaseConfigured: false, razorpayConfigured: false, now: new Date("2026-11-17T00:00:00Z") });
  assert.equal(h.status, "ok");
  assert.equal(h.version, "8.0.0");
  assert.equal(h.mode, "demo");
  assert.equal(h.uptimeSeconds, 42);
  assert.equal(h.checks.supabase, "demo");
  assert.equal(h.checks.razorpay, "demo");
  assert.equal(JSON.stringify(h).includes("secret"), false);
});
