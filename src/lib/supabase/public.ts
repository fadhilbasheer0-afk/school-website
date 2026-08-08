import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when the Supabase public credentials are present.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
 */
export function createPublicClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
