import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const broadcastSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const json = await request.json();
    const parsed = broadcastSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch all student profiles
    const { data: students, error: fetchErr } = await supabaseAdmin
      .from("profiles")
      .select("id");

    if (fetchErr || !students) {
      return NextResponse.json(
        { error: fetchErr?.message || "Failed to fetch students" },
        { status: 500 }
      );
    }

    const notificationsToInsert = students.map((s) => ({
      user_id: s.id,
      title: parsed.data.title,
      body: parsed.data.body,
      type: "SYSTEM",
      link: "/dashboard",
    }));

    const { error: insertErr } = await supabaseAdmin
      .from("notifications")
      .insert(notificationsToInsert);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: notificationsToInsert.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
