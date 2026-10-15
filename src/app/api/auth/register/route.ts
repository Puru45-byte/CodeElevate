import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/register";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

// ─── helpers ─────────────────────────────────────────────────────────────────

function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function POST(request: Request) {
  // Rate-limit: 5 per hour per hashed IP
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1";
  const hashedIp = crypto
    .createHash("sha256")
    .update(rawIp)
    .digest("hex")
    .slice(0, 16);
  const allowed = rateLimit(`register_${hashedIp}`, 5, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  // ── Parse & validate body ──────────────────────────────────────────────────
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return NextResponse.json(
      { error: firstError || "Invalid form data." },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, password } = parsed.data;
  const fullName = `${firstName} ${lastName}`.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const supabaseAdmin = createAdminClient();
  const emailVerification = isEmailVerificationEnabled();

  // ── Duplicate-email guard (profiles table) ─────────────────────────────────
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      {
        error: "An account with this email already exists. Please log in.",
        isExistingUser: true,
      },
      { status: 400 }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PATH A: Email verification DISABLED (default)
  //   → admin.createUser with email_confirm:true, then sign in server-side
  // ═══════════════════════════════════════════════════════════════════════════
  if (!emailVerification) {
    // 1. Create user via admin API — bypasses email-confirm requirement
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,           // mark confirmed immediately
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
        },
      });

    if (createError) {
      const msg = createError.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("unique") ||
        msg.includes("duplicate")
      ) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please log in.",
            isExistingUser: true,
          },
          { status: 400 }
        );
      }
      // Log real error server-side only
      console.error("[register] admin.createUser error:", createError.message, createError.status);
      return NextResponse.json(
        { error: "Could not create account. Please try again." },
        { status: 500 }
      );
    }

    if (!createData.user) {
      return NextResponse.json(
        { error: "Could not create account. Please try again." },
        { status: 500 }
      );
    }

    const userId = createData.user.id;

    // 2. Ensure the profiles row exists (trigger may or may not have fired)
    await ensureProfileRow(supabaseAdmin, userId, {
      email: normalizedEmail,
      firstName,
      lastName,
      fullName,
    });

    // 3. Sign in server-side (sets session cookies) — retry once on failure
    const signInResult = await attemptServerSignIn(
      normalizedEmail,
      password
    );

    if (!signInResult.ok) {
      // Retry once
      const retry = await attemptServerSignIn(normalizedEmail, password);
      if (!retry.ok) {
        // Account created but sign-in failed after retry → redirect to login
        console.error(
          "[register] sign-in after create failed twice:",
          retry.error
        );
        return NextResponse.json(
          {
            success: true,
            email: normalizedEmail,
            redirectToLogin: true,
            message:
              "Account created. Please log in.",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ success: true, email: normalizedEmail });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PATH B: Email verification ENABLED
  //   → normal signUp; verification email is sent; no auto sign-in
  // ═══════════════════════════════════════════════════════════════════════════
  const { createClient: createAnonClient } = await import(
    "@supabase/supabase-js"
  );
  const supabaseAnon = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: signUpError } = await supabaseAnon.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, full_name: fullName },
    },
  });

  if (signUpError) {
    const msg = signUpError.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("exists") ||
      msg.includes("unique")
    ) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in.",
          isExistingUser: true,
        },
        { status: 400 }
      );
    }
    console.error("[register] signUp error:", signUpError.message);
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 400 }
    );
  }

  // Supabase returns empty identities array when email already existed
  if (
    authData.user &&
    authData.user.identities &&
    authData.user.identities.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "An account with this email already exists. Please log in.",
        isExistingUser: true,
      },
      { status: 400 }
    );
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  await ensureProfileRow(supabaseAdmin, authData.user.id, {
    email: normalizedEmail,
    firstName,
    lastName,
    fullName,
  });

  // No auto sign-in when email verification is required
  return NextResponse.json({
    success: true,
    email: normalizedEmail,
    requiresVerification: true,
    message:
      "Please check your email to confirm your account before logging in.",
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Attempt a server-side sign-in (sets session cookies via SSR client). */
async function attemptServerSignIn(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

/** Ensure a profiles row exists for the given user; create or patch as needed. */
async function ensureProfileRow(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string,
  opts: {
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  }
) {
  // Give the DB trigger a small window to fire
  await new Promise((res) => setTimeout(res, 300));

  const { data: profileRow } = await supabaseAdmin
    .from("profiles")
    .select("id, student_id, first_name, last_name, email")
    .eq("id", userId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (!profileRow) {
    // Trigger did not fire — create the row manually
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentId = `CE2026${randomSuffix}`;
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      student_id: studentId,
      email: opts.email,
      first_name: opts.firstName,
      last_name: opts.lastName,
      full_name: opts.fullName,
      role: "student",
      consent_at: now,
      consent_version: "October 2026",
      created_at: now,
      updated_at: now,
    });
    if (insertError) {
      console.error("[register] profile insert error:", insertError.message);
    }
  } else {
    // Trigger fired — patch any missing fields and record consent
    const updates: Record<string, string> = {
      consent_at: now,
      consent_version: "October 2026",
      updated_at: now,
    };
    if (!profileRow.first_name) updates.first_name = opts.firstName;
    if (!profileRow.last_name) updates.last_name = opts.lastName;
    if (!profileRow.email) updates.email = opts.email;

    await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
  }
}
