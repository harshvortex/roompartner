/** Edge middleware — rate limiting for API routes, using the single
 * implementation in lib/rateLimit.ts (unit-tested). Security headers live
 * in next.config.ts (headers()).
 * Health checks (/api/health) are never rate-limited — uptime monitors
 * must always get an answer.
 * Honest limitation: the limiter is in-memory per instance; for a strict
 * global limit use Upstash Redis / Vercel KV. */
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter, paymentLimiter, rateLimitHeaders } from "@/lib/rateLimit";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/") || pathname === "/api/health") {
    return NextResponse.next();
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const isPayment = pathname.startsWith("/api/payments/");
  const limiter = isPayment ? paymentLimiter : apiLimiter;
  const result = limiter.check(`${isPayment ? "pay" : "api"}:${ip}`);
  const headers = rateLimitHeaders(result);
  const res = result.allowed
    ? NextResponse.next()
    : NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again.", code: "rate_limited" },
        { status: 429 },
      );
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  if (!result.allowed) res.headers.set("Retry-After", "60");
  return res;
}

export const config = { matcher: ["/api/:path*"] };
