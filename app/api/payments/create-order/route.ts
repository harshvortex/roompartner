/** POST /api/payments/create-order — Razorpay TEST MODE ONLY.
 * Body: { product: "seekerPass" | "verification" | "ownerBoost" }
 * Hardening (v8): JSON body capped at 4 KB, product whitelist only, the
 * amount is always looked up server-side from the product id (never taken
 * from the client), live keys refused (403), malformed test keys rejected,
 * rate limited in middleware (10/min/IP), structured logging, and no
 * upstream error body is ever returned to the client.
 * Hardening (v10): when Supabase is configured, the order is bound to the
 * authenticated session — a valid Supabase session (SSR cookies, or a
 * Bearer access token) is required and the order's user id comes from that
 * session, never from the request body. Unauthenticated requests get 401
 * in live mode. In demo mode (no Supabase env vars) the demo behaviour is
 * unchanged: no account exists, so no session is required.
 * With RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET set (test keys, rzp_test_*),
 * it creates a real test order via Razorpay's REST API. Without keys it
 * returns a demo order — no money moves, clearly labelled. */
import { NextResponse } from "next/server";
import { PRODUCTS, type ProductId } from "@/lib/payments";
import { apiError, apiServerError, readJsonBody } from "@/lib/apiError";
import { logInfo, logWarn } from "@/lib/logger";
import { authConfigured, getSessionUser, getUserFromToken } from "@/lib/auth-server";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return apiError("Invalid or oversized request body.", 400, "bad_request");
  const product = body.product as ProductId | undefined;
  if (!product || !PRODUCTS[product]) {
    return apiError("Unknown product.", 400, "unknown_product");
  }
  // v10: in live mode the order belongs to the signed-in user — never to a
  // user id supplied in the request body (which anyone could forge).
  let userId: string | null = null;
  if (authConfigured()) {
    const authHeader = request.headers.get("authorization") || "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "");
    const sessionUser = bearer && bearer !== authHeader ? await getUserFromToken(bearer) : await getSessionUser();
    if (!sessionUser) {
      logWarn("payment.create_order.unauthenticated", { product });
      return apiError("Sign in to continue with payment.", 401, "unauthenticated");
    }
    userId = sessionUser.id;
  }
  const { amountPaise, name } = PRODUCTS[product];
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (keyId.startsWith("rzp_live_")) {
    logWarn("payment.create_order.live_key_refused", { product });
    return apiError(
      "Live Razorpay keys are refused in this build. Complete business KYC and enable live mode explicitly first.",
      403,
      "live_keys_refused",
    );
  }
  if (keyId && !keyId.startsWith("rzp_test_")) {
    return apiError("Razorpay key id is not a recognised test key.", 400, "bad_key");
  }
  if (!keyId || !keySecret) {
    logInfo("payment.create_order.demo", { product, amountPaise, userId });
    return NextResponse.json({
      mode: "demo",
      testMode: true,
      orderId: `order_demo_${Date.now()}`,
      amount: amountPaise,
      currency: "INR",
      product,
      name,
      keyId: null,
      note: "Demo order — no Razorpay keys set. No money moves.",
    });
  }
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt: `rp_${product}_${Date.now()}`, notes: { product, mode: "test" } }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      logWarn("payment.create_order.upstream_failed", { product, status: res.status });
      return apiError("Payment provider is unavailable. Please try again.", 502, "provider_unavailable");
    }
    logInfo("payment.create_order.test", { product, amountPaise, orderId: data?.id, userId });
    return NextResponse.json({ mode: "test", testMode: true, orderId: data.id, amount: data.amount, currency: data.currency, product, name, keyId, note: "Razorpay TEST mode — use a test card, no real charge." });
  } catch (err) {
    return apiServerError("payment.create_order.error", err);
  }
}
