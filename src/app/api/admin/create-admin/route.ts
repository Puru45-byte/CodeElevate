import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Verify caller is an already-authenticated admin
    const supabaseUser = await createClient();
    const {
      data: { user: callerUser },
    } = await supabaseUser.auth.getUser();

    if (!callerUser) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check caller role in public.profiles
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .maybeSingle();

    if (callerProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Parse payload for new admin
    const body = await request.json().catch(() => ({}));
    const { email, password, firstName = "Admin", lastName = "User" } = body;

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Valid email and password (min 8 chars) are required." },
        { status: 400 }
      );
    }

    const adminEmail = email.trim().toLowerCase();

    // 3. Check if user already exists
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === adminEmail
    );

    if (existingUser) {
      return NextResponse.json(
        { error: `User with email ${adminEmail} already exists.` },
        { status: 409 }
      );
    }

    // 4. Create new admin via Supabase Auth Admin API
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          role: "admin",
        },
        app_metadata: {
          role: "admin",
        },
      });

    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create admin user" },
        { status: 500 }
      );
    }

    const adminUserId = newUser.user.id;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentId = `CE-ADMIN-${randomSuffix}`;

    // 5. Upsert matching public.profiles row
    await supabaseAdmin.from("profiles").upsert(
      {
        id: adminUserId,
        student_id: studentId,
        role: "admin",
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        email: adminEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return NextResponse.json({
      success: true,
      message: `Admin account ${adminEmail} created successfully.`,
      user: {
        id: adminUserId,
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Disallow GET method completely to prevent unauthenticated browser execution
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Admin creation requires authenticated POST request or CLI script." },
    { status: 405 }
  );
}
