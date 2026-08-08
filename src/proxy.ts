import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AUTH_PAGES = ["/admin/login", "/admin/forgot-password"];

/**
 * Guards the /admin section and keeps the Supabase session fresh by writing
 * refreshed auth cookies onto the response.
 *
 * Authorization to the dashboard itself is enforced server-side in
 * src/app/admin/(protected)/layout.tsx via requireAdmin() — the proxy only
 * handles session refresh and the coarse signed-in / signed-out redirects.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Signed out and trying to reach a protected admin page → login.
  if (!user && isAdminPath && !isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set(
      "next",
      pathname + (request.nextUrl.search ?? "")
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Signed in and visiting a login/forgot-password page → dashboard.
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
