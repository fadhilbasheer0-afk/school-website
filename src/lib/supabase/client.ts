import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when the Supabase public credentials are present. NEXT_PUBLIC_* values
 * are inlined at build time, so this is a constant per build.
 */
export const isSupabaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim() &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
);

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a shared Supabase client for the browser. Reuses a single instance
 * to avoid leaking listeners. Never used server-side.
 */
export function createClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}