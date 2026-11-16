/** Health-check payload — pure function, so it is unit-testable.
 * Contains no secrets and no user data: only mode + uptime + which
 * integrations are configured (not their keys). */

export type AppMode = "demo" | "live";

export interface HealthStatus {
  status: "ok";
  version: string;
  mode: AppMode;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    supabase: "configured" | "demo";
    razorpay: "test" | "demo";
  };
}

export function buildHealthStatus(opts: {
  version: string;
  mode: AppMode;
  uptimeSeconds: number;
  supabaseConfigured: boolean;
  razorpayConfigured: boolean;
  now?: Date;
}): HealthStatus {
  return {
    status: "ok",
    version: opts.version,
    mode: opts.mode,
    uptimeSeconds: Math.max(0, Math.floor(opts.uptimeSeconds)),
    timestamp: (opts.now ?? new Date()).toISOString(),
    checks: {
      supabase: opts.supabaseConfigured ? "configured" : "demo",
      razorpay: opts.razorpayConfigured ? "test" : "demo",
    },
  };
}
