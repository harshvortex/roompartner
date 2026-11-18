/** Server-side Supabase Auth client (Next.js App Router).
 * Returns null in demo mode (no env vars) — callers must fall back to demo. */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // setAll in a Server Component — handled by middleware/route handlers.
        }
      },
    },
  });
}

export function authConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** The currently signed-in user from the SSR session cookies, or null.
 * Returns null in demo mode and when there is no valid session. Never
 * throws — callers treat null as "not signed in". */
export async function getSessionUser(): Promise<{ id: string; email?: string } | null> {
  const supabase = await getAuthServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}

/** Validate a Bearer access token (e.g. from a mobile/API caller) against
 * Supabase Auth. Returns the user or null; never throws. */
export async function getUserFromToken(token: string): Promise<{ id: string; email?: string } | null> {
  const supabase = await getAuthServerClient();
  if (!supabase || !token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}
