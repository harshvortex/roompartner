/** SERVER ONLY — node:crypto. Never import this from a client component
 * (it breaks the webpack build: "node:" schemes are not bundled).
 * Only app/api/payments/verify/route.ts imports it. */

/** Verify a Razorpay payment signature in constant time.
 * Uses crypto.timingSafeEqual (not ===) so a wrong signature does not leak
 * how many leading characters matched. Returns false for malformed input
 * instead of throwing. */
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  try {
    if (!orderId || !paymentId || !signature || !secret) return false;
    if (signature.length > 256 || orderId.length > 128 || paymentId.length > 128) return false;
    const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
