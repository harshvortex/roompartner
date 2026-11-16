/** POST /api/payments/verify — verify a Razorpay payment signature.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, product }
 * Hardening (v8): body capped at 4 KB, all ids length-checked, signature
 * compared in constant time (crypto.timingSafeEqual via lib/payments),
 * rate limited in middleware (10/min/IP), structured logging, and no
 * upstream detail is ever returned. Never trust a client-side "success".
 * With RAZORPAY_KEY_SECRET set: HMAC-SHA256(order_id|payment_id) must match.
 * Demo mode (no secret): only demo order/payment ids are accepted, and the
 * response is labelled demo. */
import { NextResponse } from "next/server";
import { isDemoOrder, isDemoPayment, PRODUCTS, type ProductId } from "@/lib/payments";
import { verifyPaymentSignature } from "@/lib/paymentVerify";
import { apiError, readJsonBody } from "@/lib/apiError";
import { logInfo, logWarn } from "@/lib/logger";

function isId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 128;
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return apiError("Invalid or oversized request body.", 400, "bad_request");
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  const product = body.product as ProductId | undefined;
  if (!isId(orderId) || !isId(paymentId)) {
    return apiError("Missing order/payment id.", 400, "missing_ids");
  }
  if (product !== undefined && !PRODUCTS[product]) {
    return apiError("Unknown product.", 400, "unknown_product");
  }
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) {
    if (isDemoOrder(orderId) && isDemoPayment(paymentId)) {
      logInfo("payment.verify.demo", { product: product ?? null });
      return NextResponse.json({ verified: true, mode: "demo", product: product ?? null, note: "Demo payment verified (no keys set). No money moved." });
    }
    return apiError("Demo mode: only demo payment ids are accepted.", 400, "demo_only");
  }
  if (!isId(signature)) return apiError("Missing signature.", 400, "missing_signature");
  const verified = verifyPaymentSignature(orderId, paymentId, signature, secret);
  if (!verified) logWarn("payment.verify.signature_mismatch", { product: product ?? null });
  else logInfo("payment.verify.test", { product: product ?? null });
  return NextResponse.json(
    {
      verified,
      mode: "test",
      product: product ?? null,
      name: product && PRODUCTS[product] ? PRODUCTS[product].name : null,
      note: verified ? "Signature verified — Razorpay TEST mode, no real charge." : "Signature mismatch.",
    },
    { status: verified ? 200 : 400 },
  );
}
