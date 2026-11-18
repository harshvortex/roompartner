/** GET /api/health — liveness + configuration status.
 * Never rate-limited (uptime monitors must always get an answer).
 * Contains no secrets and no user data — only the mode and which
 * integrations are configured (not their keys). */
import { NextResponse } from "next/server";
import { buildHealthStatus } from "@/lib/health";

const STARTED_AT = Date.now();

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  return NextResponse.json(
    buildHealthStatus({
      version: "11.0.0",
      mode: supabaseConfigured ? "live" : "demo",
      uptimeSeconds: (Date.now() - STARTED_AT) / 1000,
      supabaseConfigured,
      razorpayConfigured,
    }),
    { headers: { "Cache-Control": "no-store" } },
  );
}
