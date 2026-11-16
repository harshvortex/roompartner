/** Structured logging — one JSON line per event, no secrets.
 * Values whose keys look like secrets (secret, token, key, password,
 * authorization) are redacted before logging. Never pass a full request
 * body, headers, or env object here. */

const SENSITIVE = /secret|token|password|authorization|api[_-]?key|razorpay/i;

export type LogLevel = "info" | "warn" | "error";

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[truncated]";
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE.test(k) ? "[redacted]" : scrub(v, depth + 1);
    }
    return out;
  }
  return value;
}

export function logEvent(level: LogLevel, event: string, data: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(scrub(data) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, data?: Record<string, unknown>): void {
  logEvent("info", event, data);
}
export function logWarn(event: string, data?: Record<string, unknown>): void {
  logEvent("warn", event, data);
}
export function logError(event: string, data?: Record<string, unknown>): void {
  logEvent("error", event, data);
}
