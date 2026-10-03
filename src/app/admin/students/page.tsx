import React from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudentsTable } from "./students-table";
import { Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Registered Students | Admin | CodeElevate",
  description: "Browse and inspect all registered students, their enrollments, and academic details.",
};

export const revalidate = 0;

export default async function AdminStudentsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          User Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Registered Students
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete roster of active candidates, student IDs, and verification records.
        </p>
      </div>

      <StudentsTable students={(students || []) as Profile[]} />
    </div>
  );
}
