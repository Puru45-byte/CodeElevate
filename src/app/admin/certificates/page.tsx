import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCertificatesClient } from "./certificates-client";

export const revalidate = 0;

export default async function AdminCertificatesPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: certificates } = await supabaseAdmin
    .from("certificates")
    .select(
      `
      *,
      profile:profiles(student_id, first_name, last_name, email),
      internship:internships(title, slug),
      enrollment:enrollments(start_date, end_date)
    `
    )
    .order("issued_at", { ascending: false });

  return <AdminCertificatesClient initialCertificates={certificates || []} />;
}
