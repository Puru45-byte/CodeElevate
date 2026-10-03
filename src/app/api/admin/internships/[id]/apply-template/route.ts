import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    // Verify internship exists
    const { data: internship, error: findErr } = await supabaseAdmin
      .from("internships")
      .select("id, title")
      .eq("id", id)
      .single();

    if (findErr || !internship) {
      return NextResponse.json(
        { error: "Internship not found" },
        { status: 404 }
      );
    }

    // Call RPC copy_default_course_structure
    const { error: rpcErr } = await supabaseAdmin.rpc(
      "copy_default_course_structure",
      {
        p_internship_id: id,
      }
    );

    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Default 4-week module and task structure applied to ${internship.title}.`,
    });
  } catch (err: any) {
    console.error("Apply template error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
