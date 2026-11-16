/** API error responses — production-safe: a short public message and a
 * machine-readable code, never a stack trace, never an upstream error body
 * (which can leak keys, paths, or internal URLs). */

import { NextResponse } from "next/server";
import { logError } from "./logger";

export function apiError(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code: code ?? "error" }, { status });
}

/** Catch-all for unexpected failures: log the detail server-side, return a
 * generic message to the client. */
export function apiServerError(event: string, err: unknown) {
  logError(event, { message: err instanceof Error ? err.message : "unknown error" });
  return apiError("Something went wrong. Please try again.", 500, "internal_error");
}

/** Read a JSON body with a size cap (default 4 KB). Returns null on bad JSON
 * or an oversized body. */
export async function readJsonBody(request: Request, maxBytes = 4096): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    if (!text.trim()) return {};
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Best-effort client identifier for rate limiting: first X-Forwarded-For
 * hop, else a coarse "unknown". Never a token or session id. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 45);
  return "unknown";
}
