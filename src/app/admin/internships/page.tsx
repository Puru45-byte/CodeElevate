import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { InternshipsManager } from "./internships-manager";

export const revalidate = 0;

export default async function AdminInternshipsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: internships } = await supabaseAdmin
    .from("internships")
    .select(
      "*, modules:internship_modules(id), tasks:tasks(id, is_required)"
    )
    .order("created_at", { ascending: false });

  return <InternshipsManager initialInternships={internships || []} />;
}
