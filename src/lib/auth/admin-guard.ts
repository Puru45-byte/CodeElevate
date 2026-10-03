import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/types/database";
import { User } from "@supabase/supabase-js";

/**
 * Server-side guard for Admin Pages & Server Actions.
 * Redirects to /login if unauthenticated, or to /dashboard if non-admin.
 */
export async function requireAdmin(): Promise<{ user: User; profile: Profile }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, profile: profile as Profile };
}

/**
 * Server-side guard for Admin API Route Handlers.
 * Returns 401/403 NextResponse if unauthorized.
 */
export async function verifyAdminApi(): Promise<
  | { isAdmin: true; user: User; profile: Profile; errorResponse?: never }
  | { isAdmin: false; user?: null; profile?: null; errorResponse: NextResponse }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAdmin: false,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      isAdmin: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden. Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { isAdmin: true, user, profile: profile as Profile };
}
