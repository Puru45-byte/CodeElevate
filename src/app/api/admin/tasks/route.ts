import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createTaskSchema = z.object({
  internship_id: z.string().uuid(),
  module_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2, "Task title is required"),
  description: z.string().min(5, "Task description is required"),
  requirements: z.array(z.string()).default([]),
  deadline_days_after_start: z.number().int().positive().default(7),
  position: z.number().int().positive().default(1),
  is_required: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");
    const moduleId = searchParams.get("moduleId");

    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
      .from("tasks")
      .select(
        "*, module:internship_modules(id, title, position), internship:internships(id, title), resources:task_resources(*)"
      )
      .order("position", { ascending: true });

    if (internshipId) {
      query = query.eq("internship_id", internshipId);
    }
    if (moduleId) {
      query = query.eq("module_id", moduleId);
    }

    const { data: tasks, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Auto-compute position if needed
    let pos = parsed.data.position;
    if (!pos || pos === 1) {
      let posQuery = supabaseAdmin
        .from("tasks")
        .select("position")
        .eq("internship_id", parsed.data.internship_id);

      if (parsed.data.module_id) {
        posQuery = posQuery.eq("module_id", parsed.data.module_id);
      }

      const { data: existingTasks } = await posQuery
        .order("position", { ascending: false })
        .limit(1);

      if (existingTasks && existingTasks.length > 0) {
        pos = existingTasks[0].position + 1;
      }
    }

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        ...parsed.data,
        position: pos,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
