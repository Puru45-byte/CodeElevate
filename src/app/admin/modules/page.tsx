import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ModulesManager } from "./modules-manager";

export const revalidate = 0;

export default async function AdminModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ internshipId?: string }>;
}) {
  await requireAdmin();
  const { internshipId } = await searchParams;

  const supabaseAdmin = createAdminClient();

  const { data: internships } = await supabaseAdmin
    .from("internships")
    .select("*")
    .order("title", { ascending: true });

  const activeInternshipId = internshipId || internships?.[0]?.id || "";

  let initialModules: any[] = [];
  if (activeInternshipId) {
    const { data: mods } = await supabaseAdmin
      .from("internship_modules")
      .select("*, tasks:tasks(*)")
      .eq("internship_id", activeInternshipId)
      .order("position", { ascending: true });

    initialModules = mods || [];
  }

  return (
    <ModulesManager
      internships={internships || []}
      initialSelectedInternshipId={activeInternshipId}
      initialModules={initialModules}
    />
  );
}
