import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const isSupabaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim() &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
);

const AUTH_PAGES = ["/admin/login", "/admin/forgot-password"];

/**
 * Multi-tenant routing proxy & Auth guard.
 *
 * 1. Resolves tenant from hostname (subdomain / custom domain) or /s/:slug path.
 * 2. Injects `x-tenant-slug` and `x-tenant-domain` request headers.
 * 3. Guards /admin and /platform-admin protected paths.
 * 4. Refreshes Supabase auth cookies.
 */
export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // ─── 1. Tenant Resolution ──────────────────────────────────────────
  let tenantSlug: string | null = null;
  let tenantDomain: string | null = null;

  // Check /s/:slug prefix
  const sPathMatch = pathname.match(/^\/s\/([a-zA-Z0-9_-]+)(.*)/);
  if (sPathMatch) {
    tenantSlug = sPathMatch[1].toLowerCase();
  } else if (searchParams.has("school")) {
    tenantSlug = searchParams.get("school")!.toLowerCase();
  } else if (host) {
    const hostname = host.split(":")[0].toLowerCase();
    const parts = hostname.split(".");
    if (parts.length > 2 && !["www", "admin", "platform", "api", "app"].includes(parts[0])) {
      tenantSlug = parts[0];
    } else if (!["localhost", "127.0.0.1"].includes(hostname) && parts.length >= 2) {
      tenantDomain = hostname;
    }
  }

  if (tenantSlug) requestHeaders.set("x-tenant-slug", tenantSlug);
  if (tenantDomain) requestHeaders.set("x-tenant-domain", tenantDomain);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ─── 2. Auth Guard & Session Refresh ──────────────────────────────
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  let supabase;
  try {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    });
  } catch {
    return response;
  }

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return response;
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isPlatformAdminPath = pathname.startsWith("/platform-admin");
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated user trying to reach protected dashboard
  if (!user && (isAdminPath || isPlatformAdminPath) && !isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname + (request.nextUrl.search ?? ""));
    return NextResponse.redirect(redirectUrl);
  }

  // Signed in user visiting login page
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/platform-admin/:path*",
    "/s/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
