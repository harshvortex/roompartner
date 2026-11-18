"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import {
  DEMO_OTP,
  demoUserFromEmail,
  demoUserFromGoogle,
  demoUserFromPhone,
  isValidEmail,
  isValidIndianPhone,
  isValidOtp,
  isValidPassword,
  normalisePhone,
  safeRedirectPath,
  verifyDemoOtp,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Smartphone, Globe, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sign in — Supabase Auth (Google + Email + phone OTP) with a demo fallback.
 * LIVE: email magic link + email/password go through Supabase Auth (the
 * session lives in SSR cookies); Google OAuth via signInWithOAuth; phone OTP
 * via signInWithOtp / verifyOtp — SMS is sent by Supabase only when a phone
 * provider is configured in the Supabase project (MSG91/DLT is a later step),
 * so a live phone failure says so honestly.
 * DEMO (no env vars): nothing is sent, no real account is created. The demo
 * OTP is shown on screen and demo users are localStorage-only, clearly
 * labelled as demo. */
export default function LoginPage() {
  const live = supabaseConfigured;
  const [nextPath, setNextPath] = useState("/dashboard");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTab, setEmailTab] = useState<"magic" | "password">("magic");
  const [passwordMode, setPasswordMode] = useState<"signin" | "signup">("signin");
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState<"info" | "ok" | "error">("info");
  const [user, setUser] = useState<string | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("rp-auth-user") || "null")?.label ?? null;
    } catch {
      return null;
    }
  });

  // Read ?next= and ?error= from the URL after mount (avoids a Suspense
  // boundary for useSearchParams). The callback redirects here on failure.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(safeRedirectPath(params.get("next")));
    if (params.get("error") === "auth_failed") {
      setMsgKind("error");
      setMsg("Sign-in didn't complete — the link may have expired. Please try again.");
    }
  }, []);

  const say = (kind: "info" | "ok" | "error", text: string) => {
    setMsgKind(kind);
    setMsg(text);
  };

  const saveDemoUser = (u: { id: string; label: string; provider: string; phoneVerified: boolean }) => {
    localStorage.setItem("rp-auth-user", JSON.stringify(u));
    localStorage.setItem(
      "rp-trust",
      JSON.stringify({ phoneVerified: u.phoneVerified, verifiedAt: u.phoneVerified ? new Date().toISOString() : null }),
    );
    setUser(u.label);
  };

  const goNext = () => {
    window.location.href = nextPath;
  };

  const signInGoogle = async () => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
      });
      if (error) say("error", `Google sign-in failed: ${error.message}`);
      return;
    }
    if (!isValidEmail(email)) {
      say("error", "Demo mode: enter a valid email above to continue as a demo Google user.");
      return;
    }
    saveDemoUser(demoUserFromGoogle(email));
    say("ok", "Signed in as a DEMO Google user — no real Google account was used.");
  };

  const sendMagicLink = async () => {
    if (!isValidEmail(email)) {
      say("error", "Enter a valid email address (e.g. you@example.com).");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      say("info", "Demo mode — no email is sent. Use the password tab to continue as a demo email user instead.");
      return;
    }
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    });
    setBusy(false);
    if (error) {
      say("error", `Could not send the sign-in link: ${error.message}`);
      return;
    }
    setEmailSent(true);
    say("ok", `Sign-in link sent to ${email.trim().toLowerCase()}. Check your inbox (and spam folder) — the link signs you in.`);
  };

  const submitPassword = async () => {
    if (!isValidEmail(email)) {
      say("error", "Enter a valid email address (e.g. you@example.com).");
      return;
    }
    if (!isValidPassword(password)) {
      say("error", "Password must be at least 8 characters.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      saveDemoUser(demoUserFromEmail(email));
      say("ok", "Signed in as a DEMO email user — no real account was created.");
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    if (passwordMode === "signup") {
      const { data, error } = await sb.auth.signUp({ email: email.trim().toLowerCase(), password, options: { emailRedirectTo: redirectTo } });
      setBusy(false);
      if (error) {
        say("error", `Could not create the account: ${error.message}`);
        return;
      }
      if (data.session) {
        saveDemoUser({ id: data.user?.id || "live-user", label: email.trim().toLowerCase(), provider: "email", phoneVerified: false });
        say("ok", "Account created and signed in.");
        goNext();
        return;
      }
      setEmailSent(true);
      say("ok", `Account created for ${email.trim().toLowerCase()}. Check your inbox to confirm your email, then sign in.`);
      return;
    }
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error || !data.session) {
      say("error", `Sign-in failed: ${error?.message || "check your email and password and try again."}`);
      return;
    }
    saveDemoUser({ id: data.user?.id || "live-user", label: email.trim().toLowerCase(), provider: "email", phoneVerified: false });
    say("ok", "Signed in.");
    goNext();
  };

  const sendOtp = async () => {
    if (!isValidIndianPhone(phone)) {
      say("error", "Enter a valid Indian mobile number (10 digits, starting 6–9).");
      return;
    }
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithOtp({ phone: normalisePhone(phone) });
      if (error) {
        say("error", `OTP failed: ${error.message} — the Supabase project needs a phone provider configured (MSG91/DLT).`);
        return;
      }
      setOtpSent(true);
      say("ok", "OTP sent by SMS (Supabase). Enter the 6-digit code.");
      return;
    }
    setOtpSent(true);
    say("info", `DEMO mode — no SMS sent. Your demo OTP is ${DEMO_OTP} (shown here only because this is a demo).`);
  };

  const verifyOtp = async () => {
    if (!isValidOtp(otp)) {
      say("error", "Enter the 6-digit OTP.");
      return;
    }
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb.auth.verifyOtp({ phone: normalisePhone(phone), token: otp, type: "sms" });
      if (error || !data.session) {
        say("error", `OTP verification failed: ${error?.message || "no session"}`);
        return;
      }
      saveDemoUser({ id: data.user?.id || "live-user", label: normalisePhone(phone), provider: "phone", phoneVerified: true });
      say("ok", "Phone verified via Supabase Auth.");
      goNext();
      return;
    }
    if (!verifyDemoOtp(otp)) {
      say("error", "Wrong demo OTP. The demo code is shown on screen.");
      return;
    }
    saveDemoUser(demoUserFromPhone(phone));
    say("ok", "Phone verified in DEMO mode — no SMS was sent, no real verification happened.");
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    localStorage.removeItem("rp-auth-user");
    localStorage.removeItem("rp-trust");
    setUser(null);
    setEmailSent(false);
    say("info", "Signed out.");
  };

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title">Sign in</h1>
        <p className="page-sub">
          {live
            ? "Live mode: sign in with email, Google or phone OTP through Supabase Auth. Your session is kept securely on the server."
            : "Demo mode: no Supabase keys are set, so sign-in is simulated locally. No SMS or email is sent and no real account is created."}
        </p>
      </header>

      {user ? (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground">
                  {user.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">Signed in as {user}</p>
                <p className="text-sm text-ink-500">{live ? "Supabase Auth session — your account is real." : "Demo user (localStorage only)."}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1"><Link href="/dashboard">Go to dashboard</Link></Button>
              <Button variant="outline" onClick={signOut}>Sign out</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-brand-600" /> Continue with Google</CardTitle>
              <CardDescription>One click — Google handles the sign-in.</CardDescription>
            </CardHeader>
            <CardContent>
              {!live && (
                <div className="mb-3 space-y-1.5">
                  <Label htmlFor="google-demo-email">Demo email</Label>
                  <Input id="google-demo-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com (demo only)" type="email" autoComplete="email" />
                </div>
              )}
              <Button onClick={signInGoogle} className="w-full"><Globe className="h-4 w-4" /> Continue with Google</Button>
              <p className="mt-2 text-xs text-ink-500">{live ? "Redirects to Google, then back here. Google sign-in needs the Google provider enabled in Supabase — if it fails, use email instead." : "Demo: no Google account is used."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-brand-600" /> Sign in with email</CardTitle>
              <CardDescription>Works right now — no extra setup needed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={emailTab} onValueChange={(v) => setEmailTab(v as "magic" | "password")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="magic">Magic link</TabsTrigger>
                  <TabsTrigger value="password">Email + password</TabsTrigger>
                </TabsList>
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" />
                </div>
                <TabsContent value="magic">
                  <Button onClick={sendMagicLink} disabled={busy} className="w-full">{busy ? "Sending…" : "Email me a sign-in link"}</Button>
                  {emailSent && (
                    <div className="callout-ok mt-3">
                      <p className="font-semibold">Check your inbox</p>
                      <p>We sent a sign-in link to {email.trim().toLowerCase()}. Click it to sign in — it expires soon, so check spam too if you don&apos;t see it.</p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-ink-500">No password to remember. The link signs you in on this device.</p>
                </TabsContent>
                <TabsContent value="password">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete={passwordMode === "signup" ? "new-password" : "current-password"} />
                  </div>
                  <Tabs value={passwordMode} onValueChange={(v) => setPasswordMode(v as "signin" | "signup")} className="mt-3 w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign in</TabsTrigger>
                      <TabsTrigger value="signup">Create account</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button onClick={submitPassword} disabled={busy} className="mt-3 w-full">
                    {busy ? "Please wait…" : passwordMode === "signup" ? "Create account" : "Sign in"}
                  </Button>
                  {emailSent && passwordMode === "signup" && (
                    <div className="callout-ok mt-3">
                      <p className="font-semibold">Check your inbox to confirm your email</p>
                      <p>We sent a confirmation link to {email.trim().toLowerCase()}. Click it, then come back and sign in.</p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-ink-500">{live ? "Your password is stored by Supabase Auth, never in RoomPartner's own database." : "Demo: the account is simulated locally."}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-brand-600" /> Phone OTP</CardTitle>
              <CardDescription>Get a 6-digit code by SMS.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="login-phone">Mobile number</Label>
                <Input id="login-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" autoComplete="tel" />
              </div>
              {!otpSent ? (
                <Button onClick={sendOtp} className="mt-3 w-full">Send OTP</Button>
              ) : (
                <>
                  <div className="mt-3 space-y-1.5">
                    <Label htmlFor="login-otp">OTP</Label>
                    <Input id="login-otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" autoComplete="one-time-code" />
                  </div>
                  {!live && (
                    <p className="callout-amber mt-3">Demo OTP: <b>{DEMO_OTP}</b> — shown here because no SMS is sent in demo mode.</p>
                  )}
                  <Button onClick={verifyOtp} className="mt-3 w-full">Verify OTP</Button>
                </>
              )}
              <p className="mt-2 text-xs text-ink-500">{live ? "Live SMS needs a phone provider (MSG91/DLT) configured in Supabase — until then, phone OTP will fail and email works instead." : "Demo: no SMS is sent."}</p>
            </CardContent>
          </Card>
        </>
      )}

      {msg && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2 rounded-xl border p-3 text-sm",
            msgKind === "error" && "border-amber-200 bg-amber-50 text-amber-900",
            msgKind === "ok" && "border-emerald-200 bg-emerald-50 text-emerald-900",
            msgKind === "info" && "border-brand-100 bg-brand-50 text-ink-700",
          )}
        >
          {msgKind === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : msgKind === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}
      <p className="text-xs text-ink-500">
        By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>. Real Aadhaar/ID verification is not part of sign-in — the
        trust score stays simulated.
      </p>
      {!live && <Badge variant="secondary">Demo mode — sign-in is simulated locally</Badge>}
    </div>
  );
}
