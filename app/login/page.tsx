"use client";
import { useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { DEMO_OTP, demoUserFromGoogle, demoUserFromPhone, isValidIndianPhone, isValidOtp, normalisePhone, verifyDemoOtp } from "@/lib/auth";

/** Sign in — Supabase Auth (Google + phone OTP) with a demo fallback.
 * LIVE: Google OAuth via supabase.auth.signInWithOAuth, phone OTP via
 * signInWithOtp / verifyOtp (SMS is sent by Supabase only when a phone
 * provider is configured in the Supabase project — MSG91/DLT is a v2 step).
 * DEMO (no env vars): the demo OTP is shown on screen and any demo
 * Google email is accepted locally. Nothing is sent, nothing is real. */
export default function LoginPage() {
  const live = supabaseConfigured;
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<string | null>(() => {
    try { return JSON.parse(localStorage.getItem("rp-auth-user") || "null")?.label ?? null; } catch { return null; }
  });

  const saveDemoUser = (u: { id: string; label: string; provider: string; phoneVerified: boolean }) => {
    localStorage.setItem("rp-auth-user", JSON.stringify(u));
    localStorage.setItem("rp-trust", JSON.stringify({ phoneVerified: u.phoneVerified, verifiedAt: u.phoneVerified ? new Date().toISOString() : null }));
    setUser(u.label);
  };

  const signInGoogle = async () => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (error) setMsg(`Google sign-in failed: ${error.message}`);
      return;
    }
    if (!email.includes("@")) { setMsg("Demo mode: enter any email to continue as a demo Google user."); return; }
    saveDemoUser(demoUserFromGoogle(email));
    setMsg("Signed in as a DEMO Google user — no real Google account was used.");
  };

  const sendOtp = async () => {
    if (!isValidIndianPhone(phone)) { setMsg("Enter a valid Indian mobile number (10 digits, starting 6–9)."); return; }
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithOtp({ phone: normalisePhone(phone) });
      if (error) { setMsg(`OTP failed: ${error.message} — the Supabase project needs a phone provider configured.`); return; }
      setOtpSent(true);
      setMsg("OTP sent by SMS (Supabase). Enter the 6-digit code.");
      return;
    }
    setOtpSent(true);
    setMsg(`DEMO mode — no SMS sent. Your demo OTP is ${DEMO_OTP} (shown here only because this is a demo).`);
  };

  const verifyOtp = async () => {
    if (!isValidOtp(otp)) { setMsg("Enter the 6-digit OTP."); return; }
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb.auth.verifyOtp({ phone: normalisePhone(phone), token: otp, type: "sms" });
      if (error || !data.session) { setMsg(`OTP verification failed: ${error?.message || "no session"}`); return; }
      saveDemoUser({ id: data.user?.id || "live-user", label: normalisePhone(phone), provider: "phone", phoneVerified: true });
      setMsg("Phone verified via Supabase Auth.");
      return;
    }
    if (!verifyDemoOtp(otp)) { setMsg("Wrong demo OTP. The demo code is shown on screen."); return; }
    saveDemoUser(demoUserFromPhone(phone));
    setMsg("Phone verified in DEMO mode — no SMS was sent, no real verification happened.");
  };

  const signOut = () => {
    const sb = getSupabase();
    if (sb) void sb.auth.signOut();
    localStorage.removeItem("rp-auth-user");
    setUser(null);
    setMsg("Signed out.");
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="page-title">Sign in</h1>
      <p className="text-sm text-ink-500">
        {live ? "Live mode: Google sign-in and phone OTP go through Supabase Auth." : "Demo mode: no Supabase keys are set, so sign-in is simulated locally. No SMS is sent and no real account is created."}
      </p>
      {user ? (
        <div className="card">
          <p className="font-semibold">Signed in as {user}</p>
          <p className="text-sm text-ink-500">{live ? "Supabase Auth session." : "Demo user (localStorage only)."}</p>
          <button onClick={signOut} className="mt-3 btn-secondary btn-sm">Sign out</button>
        </div>
      ) : (
        <>
          <section className="card">
            <h2 className="font-bold">Continue with Google</h2>
            {!live && <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com (demo only)" className="mt-2 w-full rounded-lg border p-2 text-sm" />}
            <button onClick={signInGoogle} className="mt-3 w-full btn-primary">Continue with Google</button>
            <p className="mt-2 text-xs text-ink-500">{live ? "Redirects to Google, then back to /auth/callback." : "Demo: no Google account is used."}</p>
          </section>
          <section className="card">
            <h2 className="font-bold">Phone OTP</h2>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-2 w-full rounded-lg border p-2 text-sm" />
            {!otpSent ? (
              <button onClick={sendOtp} className="mt-3 w-full btn-primary">Send OTP</button>
            ) : (
              <>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" className="mt-2 w-full rounded-lg border p-2 text-sm" />
                {!live && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm">Demo OTP: <b>{DEMO_OTP}</b> — shown here because no SMS is sent in demo mode.</p>}
                <button onClick={verifyOtp} className="mt-3 w-full btn-primary">Verify OTP</button>
              </>
            )}
          </section>
        </>
      )}
      {msg && <p className="toast text-sm">{msg}</p>}
      <p className="text-xs text-ink-500">By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>. Real Aadhaar/ID verification is not part of sign-in — the trust score stays simulated.</p>
    </div>
  );
}
