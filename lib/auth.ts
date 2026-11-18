/** Auth helpers — Supabase Auth (Google + phone OTP + email) with a demo fallback.
 *
 * LIVE (Supabase configured): Google OAuth, phone OTP and email (magic link
 * + password) go through supabase.auth (see app/login/page.tsx and
 * app/auth/callback/route.ts). Sessions live in SSR cookies; localStorage
 * rp-auth-user is only a display label, never the source of truth.
 * DEMO (no Supabase env vars): no account exists, no SMS/email is sent. The
 * user can continue as a demo user and "verify" with the demo OTP shown on
 * screen — clearly labelled, never presented as a real OTP.
 * Real Aadhaar/ID verification is NOT part of auth; trust stays simulated. */

export interface DemoAuthUser {
  id: string;
  label: string; // email or phone
  provider: "google" | "phone" | "email" | "demo";
  phoneVerified: boolean;
}

export const DEMO_OTP = "123456"; // demo only — shown on screen, never sent by SMS

/** Simple, honest email check: local@domain.tld with no spaces. Supabase
 * does the final validation server-side; this only catches typos early. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Supabase's default minimum password length is 6; we require 8. */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

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

export function demoUserFromEmail(email: string): DemoAuthUser {
  return { id: `demo-${email.trim().toLowerCase()}`, label: email.trim().toLowerCase(), provider: "email", phoneVerified: false };
}

/** Redirect target after sign-in: only same-site relative paths are allowed
 * (must start with a single "/"). Anything else falls back to /dashboard,
 * so a crafted ?next= can never send a user to an outside site. */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/dashboard";
  return next;
}
