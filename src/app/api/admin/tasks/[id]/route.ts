import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  module_id: z.string().uuid().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  deadline_days_after_start: z.number().int().positive().optional(),
  position: z.number().int().positive().optional(),
  is_required: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function GET(
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

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .select("*, resources:task_resources(*), module:internship_modules(*)")
      .eq("id", id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: updated, error } = await supabaseAdmin
      .from("tasks")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Task deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
