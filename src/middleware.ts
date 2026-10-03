import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

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
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated user away from login/register
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
