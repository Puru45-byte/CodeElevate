import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentsManager } from "./payments-manager";

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select(
      `
      *,
      profile:profiles(id, student_id, first_name, last_name, email, phone),
      task:tasks(id, title),
      enrollment:enrollments(
        id,
        internship:internships(title)
      )
    `
    )
    .order("created_at", { ascending: false });

  return <PaymentsManager initialPayments={payments || []} />;
}
