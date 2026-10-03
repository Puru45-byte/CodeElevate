import React from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApplicationsManager } from "./applications-manager";

export const metadata: Metadata = {
  title: "Manage Applications | Admin | CodeElevate",
  description: "Review, approve, and manage student internship applications.",
};

export const revalidate = 0;

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      profile:profiles(*),
      internship:internships(*)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Enrollment Review
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Student Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming applications, inspect student academic details, and approve active enrollments.
        </p>
      </div>

      <ApplicationsManager initialApplications={(applications || []) as any} />
    </div>
  );
}
