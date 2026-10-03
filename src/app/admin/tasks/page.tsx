import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { TasksManager } from "./tasks-manager";

export const revalidate = 0;

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ internshipId?: string; moduleId?: string }>;
}) {
  await requireAdmin();
  const { internshipId, moduleId } = await searchParams;

  const supabaseAdmin = createAdminClient();

  // Fetch all internships
  const { data: internships } = await supabaseAdmin
    .from("internships")
    .select("*")
    .order("title", { ascending: true });

  const activeInternshipId = internshipId || internships?.[0]?.id || "";

  // Fetch modules
  const { data: modules } = await supabaseAdmin
    .from("internship_modules")
    .select("*")
    .order("position", { ascending: true });

  // Fetch initial tasks
  let tasksQuery = supabaseAdmin
    .from("tasks")
    .select(
      "*, module:internship_modules(*), internship:internships(*), resources:task_resources(*)"
    )
    .order("position", { ascending: true });

  if (activeInternshipId) {
    tasksQuery = tasksQuery.eq("internship_id", activeInternshipId);
  }
  if (moduleId && moduleId !== "ALL") {
    tasksQuery = tasksQuery.eq("module_id", moduleId);
  }

  const { data: tasks } = await tasksQuery;

  return (
    <TasksManager
      internships={internships || []}
      modules={modules || []}
      initialSelectedInternshipId={activeInternshipId}
      initialSelectedModuleId={moduleId || "ALL"}
      initialTasks={tasks || []}
    />
  );
}
