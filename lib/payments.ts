/** Razorpay payments — TEST MODE ONLY.
 *
 * No live charge ever happens in this code. Amounts are in paise.
 * - create-order: POST /api/payments/create-order (server route). With
 *   RAZORPAY_KEY_ID/SECRET set it calls Razorpay's test API; without them
 *   it returns a demo order (order_demo_*) and the client simulates a test
 *   payment, clearly labelled.
 * - verify: POST /api/payments/verify checks the HMAC-SHA256 signature
 *   server-side when a secret is set; in demo mode only demo payment ids
 *   are accepted.
 * Live keys must NEVER be used until Razorpay business KYC is complete. */

export type ProductId = "seekerPass" | "verification" | "ownerBoost";

export const PRODUCTS: Record<ProductId, { name: string; amountPaise: number; note: string }> = {
  seekerPass: { name: "Seeker Pass", amountPaise: 9900, note: "₹99/month, no auto-renew" },
  verification: { name: "Verification", amountPaise: 9900, note: "₹99 one-off" },
  ownerBoost: { name: "Owner boost", amountPaise: 19900, note: "₹199 / 7 days" },
};

export function productAmount(product: ProductId): number {
  return PRODUCTS[product].amountPaise;
}

export function isTestMode(): boolean {
  // This build only ever runs Razorpay in test mode. A live key id
  // (rzp_live_*) is refused by the create-order route.
  return true;
}

export function isDemoOrder(orderId: string): boolean {
  return orderId.startsWith("order_demo_");
}

export function isDemoPayment(paymentId: string): boolean {
  return paymentId.startsWith("pay_demo_");
}

export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Amount whitelist: only the three products above may ever be charged.
 * The server never trusts an amount sent by the client — it looks the
 * amount up from the product id. */
export const ALLOWED_AMOUNTS_PAISE = [9900, 19900] as const;

export function isAllowedAmount(paise: unknown): paise is number {
  return paise === 9900 || paise === 19900;
}

/** Signature verification lives in lib/paymentVerify.ts (server-only —
 * node:crypto must never be bundled into the browser). */

