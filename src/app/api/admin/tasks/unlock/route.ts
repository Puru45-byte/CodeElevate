import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const unlockTaskSchema = z.object({
  enrollmentId: z.string().uuid(),
  taskId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const body = await request.json();
    const parsed = unlockTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid enrollmentId or taskId" },
        { status: 400 }
      );
    }

    const { enrollmentId, taskId } = parsed.data;
    const supabaseAdmin = createAdminClient();

    // 1. Check if enrollment and task exist
    const { data: enrollment, error: enrErr } = await supabaseAdmin
      .from("enrollments")
      .select("id, user_id, internship_id, internship:internships(title)")
      .eq("id", enrollmentId)
      .single();

    if (enrErr || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const { data: task, error: taskErr } = await supabaseAdmin
      .from("tasks")
      .select("id, title")
      .eq("id", taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 2. Insert into task_unlocks
    const { error: unlockErr } = await supabaseAdmin
      .from("task_unlocks")
      .upsert(
        {
          enrollment_id: enrollmentId,
          task_id: taskId,
          unlocked_by: authResult.user.id,
        },
        { onConflict: "enrollment_id,task_id" }
      );

    if (unlockErr) {
      return NextResponse.json({ error: unlockErr.message }, { status: 500 });
    }

    // 3. Notify student
    await supabaseAdmin.from("notifications").insert({
      user_id: enrollment.user_id,
      title: "Task Unlocked 🔓",
      body: `Mentor unlocked "${task.title}" for your learning roadmap.`,
      type: "TASK",
      link: `/dashboard/learning`,
    });

    return NextResponse.json({ success: true, message: "Task manually unlocked." });
  } catch (err: any) {
    console.error("Task unlock error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
