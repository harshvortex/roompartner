/** Supabase Auth callback: Google OAuth, magic links and email
 * confirmation land here.
 * - PKCE flow (OAuth + newer email links): `code` → exchangeCodeForSession.
 * - Email-link flow: `token_hash` + `type` (signup / magiclink / recovery)
 *   → verifyOtp. Supabase still sends these for email links when PKCE is
 *   not used, so both paths must work.
 * The `next` target is validated (same-site relative paths only) so a
 * crafted ?next= can never send a user to an outside site.
 * In demo mode (no Supabase env vars) this route just redirects home. */
import { NextRequest, NextResponse } from "next/server";
import { getAuthServerClient } from "@/lib/auth-server";
import { safeRedirectPath } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeRedirectPath(searchParams.get("next"));
  const origin = request.nextUrl.origin;
  const supabase = await getAuthServerClient();
  if (supabase) {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "magiclink" | "recovery" | "email_change",
      });
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
