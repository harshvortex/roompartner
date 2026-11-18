import type { NextConfig } from "next";

// Content-Security-Policy: Next.js needs 'unsafe-inline' for its inline
// scripts/styles; Razorpay Checkout needs its own domains. No 'unsafe-eval'.
// frame-ancestors 'none' stops clickjacking (our pages can never be framed);
// Razorpay's own checkout iframe is allowed via frame-src, not by framing us.
// Audit (v10, 2026-11-18): every header below was checked against what the
// app actually loads — Supabase Auth/Realtime/Storage all live under
// *.supabase.co (covered by connect-src; wss: Realtime matches the https:
// source per CSP), Razorpay Checkout under checkout.razorpay.com /
// api.razorpay.com (script/frame/connect). Nothing was missing and nothing
// could be tightened without breaking one of those: Permissions-Policy
// deliberately does NOT restrict payment=() (Razorpay's checkout uses the
// Payment Request API in some flows), and form-action stays 'self' because
// Razorpay posts happen inside its own iframe, not our document. The only
// addition in v10 is worker-src 'self' (the app uses no web workers).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;
