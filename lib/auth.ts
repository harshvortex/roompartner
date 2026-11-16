/** Auth helpers — Supabase Auth (Google + phone OTP) with a demo fallback.
 *
 * LIVE (Supabase configured): Google OAuth and phone OTP go through
 * supabase.auth (see app/login/page.tsx and app/auth/callback/route.ts).
 * DEMO (no Supabase env vars): no account exists, no SMS is sent. The user
 * can continue as a demo user and "verify" with the demo OTP shown on
 * screen — clearly labelled, never presented as a real OTP.
 * Real Aadhaar/ID verification is NOT part of auth; trust stays simulated. */

export interface DemoAuthUser {
  id: string;
  label: string; // email or phone
  provider: "google" | "phone" | "demo";
  phoneVerified: boolean;
}

export const DEMO_OTP = "123456"; // demo only — shown on screen, never sent by SMS

export function isValidIndianPhone(phone: string): boolean {
  // +91 followed by 10 digits starting 6-9, or 10 digits starting 6-9.
  return /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ""));
}

export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return `+91${ten}`;
}

export function isValidOtp(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** Demo OTP check: only the on-screen demo code is accepted, demo mode only. */
export function verifyDemoOtp(code: string): boolean {
  return code.trim() === DEMO_OTP;
}

export function demoUserFromPhone(phone: string): DemoAuthUser {
  return { id: `demo-${normalisePhone(phone)}`, label: normalisePhone(phone), provider: "phone", phoneVerified: true };
}

export function demoUserFromGoogle(email: string): DemoAuthUser {
  return { id: `demo-${email}`, label: email, provider: "google", phoneVerified: false };
}
