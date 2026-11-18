/** In-memory fixed-window rate limiter for API routes.
 *
 * Honest limitation: this is per-process memory, so on a multi-instance
 * deployment (Vercel scales to several instances) each instance has its own
 * counter. It stops casual abuse and accidental retry storms on one
 * instance; for strict global limits use Upstash Redis / Vercel KV.
 * Keys must never contain secrets — callers pass a hashed or coarse key
 * (IP, or user id), never a token. */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number; // ms until the window resets
  limit: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();
  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const bucket = buckets.get(key);
      if (!bucket || now - bucket.windowStart >= windowMs) {
        buckets.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: max - 1, resetMs: windowMs, limit: max };
      }
      if (bucket.count >= max) {
        return { allowed: false, remaining: 0, resetMs: windowStartOf(bucket) - now + windowMs, limit: max };
      }
      bucket.count += 1;
      return { allowed: true, remaining: max - bucket.count, resetMs: bucket.windowStart + windowMs - now, limit: max };
    },
    /** Test/support helper: clear all counters. */
    reset() {
      buckets.clear();
    },
  };
}

function windowStartOf(bucket: Bucket): number {
  return bucket.windowStart;
}

/** Payments: 10 requests / minute per IP — generous for a human, tight for a bot. */
export const paymentLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });
/** General API: 60 requests / minute per IP. */
export const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
/** Auth callback: 10 code-exchange attempts / minute per IP — slows
 * brute-force guessing of auth codes without blocking real sign-ins. */
export const authCallbackLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000)),
  };
}
