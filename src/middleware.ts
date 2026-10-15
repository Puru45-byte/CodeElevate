import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";
import { ROUTES } from "./lib/routes";

export async function middleware(request: NextRequest) {
  // --- Rate Limiting for Sensitive Routes ---
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/applications/apply") ||
    pathname.startsWith("/api/verify") ||
    pathname.startsWith("/api/payments/create-order")
  ) {
    // 20 requests per minute per IP for sensitive routes
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const allowed = rateLimit(`sensitive_${ip}`, 20, 60000);
    
    if (!allowed) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      return new NextResponse("Too many requests. Please try again later.", { status: 429 });
    }
  }

  // --- Canonical Redirects for Legacy / Un-nested Routes ---
  if (pathname === "/my-learning" || pathname.startsWith("/my-learning/")) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = ROUTES.dashboard.learning();
    return NextResponse.redirect(nextUrl);
  }
  if (pathname === "/applications") {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = ROUTES.dashboard.applications;
    return NextResponse.redirect(nextUrl);
  }
  if (pathname === "/certificates") {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = ROUTES.dashboard.certificates();
    return NextResponse.redirect(nextUrl);
  }
  if (pathname === "/profile") {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = ROUTES.dashboard.profile;
    return NextResponse.redirect(nextUrl);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect student dashboard routes
  if (
    !user &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/my-learning") ||
      pathname.startsWith("/applications") ||
      pathname.startsWith("/certificates") ||
      pathname.startsWith("/profile"))
  ) {
    const redirectUrl = new URL(ROUTES.login, request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL(ROUTES.login, request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  function isSafeRedirect(path?: string | null): path is string {
    if (!path || typeof path !== "string") return false;
    if (!path.startsWith("/") || path.startsWith("//")) return false;
    if (path.includes("\\")) return false;
    try {
      const url = new URL(path, "https://codeelevate.local");
      if (url.origin !== "https://codeelevate.local") return false;
      if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return false;
      return true;
    } catch {
      return false;
    }
  }

  // Redirect authenticated user away from login/register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const nextParam = request.nextUrl.searchParams.get("next") || request.nextUrl.searchParams.get("redirect");
    if (isSafeRedirect(nextParam)) {
      return NextResponse.redirect(new URL(nextParam, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.dashboard.home, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
