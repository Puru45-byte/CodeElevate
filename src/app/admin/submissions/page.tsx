import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { SubmissionsManager } from "./submissions-manager";

export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  // 1. Fetch internship_submissions
  const { data: intSubmissions, error: intErr } = await supabaseAdmin
    .from("internship_submissions")
    .select(
      `
      *,
      enrollment:enrollments(
        id,
        start_date,
        end_date,
        internship:internships(id, title, slug)
      ),
      profile:profiles!user_id(id, student_id, first_name, last_name, email, phone),
      payment:payments(id, status, amount_paise, razorpay_payment_id)
    `
    )
    .order("submitted_at", { ascending: false });

  // 2. Fetch legacy task_submissions if any
  const { data: taskSubmissions } = await supabaseAdmin
    .from("task_submissions")
    .select(
      `
      *,
      task:tasks(id, title, position, is_required),
      enrollment:enrollments(
        id,
        start_date,
        end_date,
        internship:internships(id, title, slug)
      ),
      profile:profiles(id, student_id, first_name, last_name, email, phone),
      payment:payments(id, status, amount_paise, razorpay_payment_id)
    `
    )
    .order("submitted_at", { ascending: false });

  const combined = [
    ...(intSubmissions || []),
    ...(taskSubmissions || []),
  ];

  // Deduplicate by ID
  const seen = new Set<string>();
  const uniqueSubmissions = combined.filter((sub) => {
    if (seen.has(sub.id)) return false;
    seen.add(sub.id);
    return true;
  });

  return <SubmissionsManager initialSubmissions={uniqueSubmissions as any} />;
}
