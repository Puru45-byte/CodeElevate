import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const allowedStatuses = ["NEW", "IN_PROGRESS", "RESOLVED"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) {
      updatePayload.status = body.status;
    }

    if (typeof body.admin_notes === "string") {
      updatePayload.admin_notes = body.admin_notes;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[ADMIN_MESSAGES_PATCH_ERROR]", error);
      return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    console.error("[ADMIN_MESSAGES_PATCH_EXCEPTION]", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized or internal error" },
      { status: 403 }
    );
  }
}
