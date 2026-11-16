/** Supabase Auth callback: Google OAuth (and email links) land here.
 * Exchanges the `code` for a session, then redirects to /dashboard.
 * In demo mode (no Supabase env vars) this route just redirects home. */
import { NextRequest, NextResponse } from "next/server";
import { getAuthServerClient } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = request.nextUrl.origin;
  if (code) {
    const supabase = await getAuthServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
