import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStudentApplications } from "@/lib/queries/internships";
import { ApplicationCard } from "@/components/shared/ApplicationCard";
import { Button } from "@/components/ui/button";
import { FileText, Plus, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Applications | CodeElevate",
  description: "View the status of your CodeElevate internship applications.",
};

export const revalidate = 0;

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const applications = await getStudentApplications(supabase, user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Student Applications
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track the approval status of your submitted internship applications.
          </p>
        </div>

        <Link href="/internships">
          <Button className="h-10 px-4 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
            <Plus className="h-4 w-4" />
            <span>Apply for Another Track</span>
          </Button>
        </Link>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No applications submitted yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore 12+ domains and submit your 1-month practical internship application to get started.
            </p>
          </div>
          <Link href="/internships">
            <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
              <span>Browse Internships</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
