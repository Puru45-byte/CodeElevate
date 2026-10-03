import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditInternshipForm } from "./edit-internship-form";

export const revalidate = 0;

export default async function AdminEditInternshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabaseAdmin = createAdminClient();
  const { data: internship, error } = await supabaseAdmin
    .from("internships")
    .select("*, modules:internship_modules(*), tasks:tasks(*)")
    .eq("id", id)
    .single();

  if (error || !internship) {
    notFound();
  }

  return <EditInternshipForm internship={internship as any} />;
}
