import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateTaskForm } from "./create-task-form";

export const revalidate = 0;

export default async function AdminNewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ internshipId?: string; moduleId?: string }>;
}) {
  await requireAdmin();
  const { internshipId, moduleId } = await searchParams;

  const supabaseAdmin = createAdminClient();

  const { data: internships } = await supabaseAdmin
    .from("internships")
    .select("*")
    .order("title", { ascending: true });

  const { data: modules } = await supabaseAdmin
    .from("internship_modules")
    .select("*")
    .order("position", { ascending: true });

  return (
    <CreateTaskForm
      internships={internships || []}
      modules={modules || []}
      initialInternshipId={internshipId}
      initialModuleId={moduleId}
    />
  );
}
