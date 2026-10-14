import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { registerSchema } from "@/lib/validations/register";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

// Service role client for server-side verification and updating of profiles
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Client for calling supabase.auth.signUp with standard anon key
function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  // Rate limit: 5 per hour per hashed IP
  const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const hashedIp = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);
  const allowed = rateLimit(`register_${hashedIp}`, 5, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

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

  // 1. Check if a profile with this email already exists
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in.", isExistingUser: true },
      { status: 400 }
    );
  }

  // 2. Call supabase.auth.signUp with user_metadata so the existing handle_new_user trigger creates the profiles row
  const supabaseAnon = createAnonClient();
  const { data: authData, error: signUpError } = await supabaseAnon.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
      },
    },
  });

  if (signUpError) {
    const msg = signUpError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("exists") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in.", isExistingUser: true },
        { status: 400 }
      );
    }
    console.error("[register] signUp error:", signUpError.message);
    return NextResponse.json(
      { error: signUpError.message || "Could not create account. Please try again." },
      { status: 400 }
    );
  }

  // Supabase returns an empty identities array if user already existed
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in.", isExistingUser: true },
      { status: 400 }
    );
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  const userId = authData.user.id;

  // 3. Verify that the trigger really fills first_name, last_name and email in profiles
  // Give trigger a small window to execute
  await new Promise((res) => setTimeout(res, 300));

  const { data: profileRow } = await supabaseAdmin
    .from("profiles")
    .select("id, student_id, first_name, last_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profileRow) {
    // If trigger did not create the row, create it using service role
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentId = `CE2026${randomSuffix}`;
    await supabaseAdmin.from("profiles").insert({
      id: userId,
      student_id: studentId,
      email: normalizedEmail,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      role: "student",
      consent_at: new Date().toISOString(),
      consent_version: "October 2026",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } else {
    // Trigger fired: verify first_name, last_name, email are filled and record consent
    const updates: Record<string, any> = {
      consent_at: new Date().toISOString(),
      consent_version: "October 2026",
      updated_at: new Date().toISOString(),
    };
    if (!profileRow.first_name) updates.first_name = firstName;
    if (!profileRow.last_name) updates.last_name = lastName;
    if (!profileRow.email) updates.email = normalizedEmail;

    await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", userId);
  }

  // 4. Return success with normalized email (never return password)
  return NextResponse.json({
    success: true,
    email: normalizedEmail,
  });
}
