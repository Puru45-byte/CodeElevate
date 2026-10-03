import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createResourceSchema = z.object({
  title: z.string().min(2, "Resource title is required"),
  type: z.enum(["PPT", "PDF", "LINK", "OTHER"]).default("LINK"),
  file_path: z.string().min(2, "File path or URL is required"),
  file_size: z.number().int().optional().nullable(),
  position: z.number().int().positive().default(1),
  module_id: z.string().uuid().optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const parsed = createResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: resource, error } = await supabaseAdmin
      .from("task_resources")
      .insert({
        task_id: taskId,
        module_id: parsed.data.module_id || null,
        title: parsed.data.title,
        type: parsed.data.type,
        file_path: parsed.data.file_path,
        file_size: parsed.data.file_size || null,
        position: parsed.data.position,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId query parameter is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("task_resources")
      .delete()
      .eq("id", resourceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Resource deleted." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
