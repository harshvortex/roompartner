/** Edge middleware — three jobs, in order:
 * 1. Rate limiting for API routes (unchanged v8 behaviour) and a stricter
 *    limiter for /auth/callback (10 code-exchange attempts/min/IP) so
 *    brute-forcing auth codes is slow.
 * 2. Supabase session refresh on every matched request, using the
 *    @supabase/ssr middleware pattern, so sessions do not silently expire.
 * 3. Server-side route protection for /dashboard, /my-space, /chats,
 *    /list-room, /list-item: when Supabase is configured, a visitor with
 *    no valid session is redirected to /login?next=<original path>.
 *    In DEMO mode (no Supabase env vars) there is no session to check, so
 *    the pages load exactly as today — a demo user in localStorage cannot
 *    be checked server-side, and Harsh is never locked out of his own demo.
 * Health checks (/api/health) are never rate-limited.
 * Honest limitation: the limiter is in-memory per instance; for a strict
 * global limit use Upstash Redis / Vercel KV. */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { apiLimiter, authCallbackLimiter, paymentLimiter, rateLimitHeaders } from "@/lib/rateLimit";

const PROTECTED_PREFIXES = ["/dashboard", "/my-space", "/chats", "/list-room", "/list-item"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1a. Auth callback brute-force limiter (runs before any session work).
  if (pathname === "/auth/callback") {
    const result = authCallbackLimiter.check(`authcb:${clientIp(request)}`);
    if (!result.allowed) {
      const res = new NextResponse("Too many sign-in attempts. Please wait a minute and try again.", {
        status: 429,
        headers: { "Retry-After": "60", ...rateLimitHeaders(result) },
      });
      return res;
    }
  }

  // 1b. API rate limiting (v8 behaviour, unchanged).
  if (pathname.startsWith("/api/") && pathname !== "/api/health") {
    const ip = clientIp(request);
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

  // 2. Session refresh + 3. page guard — only when Supabase is configured.
  // In demo mode there is no session to refresh or check.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/auth/callback",
    "/dashboard/:path*",
    "/my-space/:path*",
    "/chats/:path*",
    "/list-room/:path*",
    "/list-item/:path*",
  ],
};
