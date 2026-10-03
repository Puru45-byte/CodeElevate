import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEnrollmentTaskStatuses } from "@/lib/queries/internships";
import { TaskDetailContent } from "./task-detail-content";

export const revalidate = 0;

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>;
}

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("title")
    .eq("id", taskId)
    .single();

  return {
    title: `${task?.title || "Task Details"} | CodeElevate`,
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/tasks/${taskId}`);
  }

  // 1. Fetch task details
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*, module:internship_modules(*), resources:task_resources(*)")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    notFound();
  }

  // 2. SERVER-SIDE ACCESS CHECK: Ensure the student is enrolled in the internship owning this task
  const { data: enrollment, error: enrError } = await supabase
    .from("enrollments")
    .select("id, status, internship_id")
    .eq("user_id", user.id)
    .eq("internship_id", task.internship_id)
    .in("status", ["ACTIVE", "COMPLETED"])
    .maybeSingle();

  if (enrError || !enrollment) {
    // If user is not enrolled in this task's internship, deny access
    redirect("/dashboard/learning");
  }

  // 3. Fetch computed status for this task
  const allStatuses = await getEnrollmentTaskStatuses(supabase, enrollment.id);
  const currentStatus =
    allStatuses.find((s) => s.task_id === taskId) || null;

  // 4. Fetch submission history for this student & task
  const { data: submissions } = await supabase
    .from("task_submissions")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .eq("task_id", taskId)
    .order("submitted_at", { ascending: false });

  return (
    <TaskDetailContent
      task={task as any}
      computedStatus={currentStatus}
      submissions={(submissions || []) as any}
      enrollmentId={enrollment.id}
    />
  );
}
