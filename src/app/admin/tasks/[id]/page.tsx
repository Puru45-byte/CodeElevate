import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditTaskForm } from "./edit-task-form";

export const revalidate = 0;

export default async function AdminEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabaseAdmin = createAdminClient();

  // Fetch task
  const { data: task, error } = await supabaseAdmin
    .from("tasks")
    .select(
      "*, module:internship_modules(*), internship:internships(*), resources:task_resources(*)"
    )
    .eq("id", id)
    .single();

  if (error || !task) {
    notFound();
  }

  // Fetch internships and modules for selectors
  const { data: internships } = await supabaseAdmin
    .from("internships")
    .select("*")
    .order("title", { ascending: true });

  const { data: modules } = await supabaseAdmin
    .from("internship_modules")
    .select("*")
    .order("position", { ascending: true });

  return (
    <EditTaskForm
      task={task as any}
      internships={internships || []}
      modules={modules || []}
    />
  );
}
