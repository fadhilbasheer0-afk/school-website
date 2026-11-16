import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when the Supabase public credentials are present.
 */
export const isSupabaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim() &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
);

/**
 * Creates a cookie-free, ANON-ONLY Supabase client for PUBLIC read paths.
 *
 * Unlike the request-bound server client (`@/lib/supabase/server`), this
 * client never touches `cookies()`/`headers()`, so it can be used inside
 * `unstable_cache()` for on-demand revalidation.
 *
 * It uses the anon key only — never the service-role key — and therefore every
 * query is still governed by Row Level Security. Public reads rely on the
 * read-only RLS policies, so this client can never write to protected data.
 *
 * Defensive: trims env values and swallows client-construction errors so a
 * misconfigured env (e.g. an accidentally quoted URL) degrades to the static
 * seed fallback instead of crashing a build or a request.
 */
export function createPublicClient(): SupabaseClient | null {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } catch {
    return null;
  }
}
