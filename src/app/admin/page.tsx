import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  BookOpen,
  CheckSquare,
  Award,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard | CodeElevate",
  description: "Administrative console overview, analytics, and operational metrics.",
};

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  // 1. Fetch live metrics concurrently
  const [
    { count: studentsCount },
    { count: pendingAppsCount },
    { count: activeEnrollmentsCount },
    { count: pendingIntSubmissionsCount },
    { count: pendingTaskSubmissionsCount },
    { count: completedEnrollmentsCount },
    { count: issuedCertificatesCount },
    { data: paymentsData },
    { data: recentApps },
    { data: recentIntSubmissions },
    { data: recentTaskSubmissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("internship_submissions").select("*", { count: "exact", head: true }).eq("status", "UNDER_REVIEW"),
    supabase.from("task_submissions").select("*", { count: "exact", head: true }).eq("status", "UNDER_REVIEW"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("certificates").select("*", { count: "exact", head: true }).eq("status", "ISSUED"),
    supabase.from("payments").select("amount_paise").eq("status", "PAID"),
    supabase.from("applications").select("id, status, created_at, profile:profiles(first_name, last_name, email), internship:internships(title)").order("created_at", { ascending: false }).limit(5),
    supabase.from("internship_submissions").select("id, status, submitted_at, profile:profiles!user_id(first_name, last_name), internship:internships(title)").order("submitted_at", { ascending: false }).limit(5),
    supabase.from("task_submissions").select("id, status, submitted_at, profile:profiles(first_name, last_name), task:tasks(title)").order("submitted_at", { ascending: false }).limit(5),
  ]);

  const pendingSubmissionsCount = (pendingIntSubmissionsCount || 0) + (pendingTaskSubmissionsCount || 0);
  const combinedRecentSubmissions = [
    ...(recentIntSubmissions || []).map((s: any) => ({
      ...s,
      displayTitle: s.internship?.title || "Final Project Deliverable",
    })),
    ...(recentTaskSubmissions || []).map((s: any) => ({
      ...s,
      displayTitle: s.task?.title || "Milestone Task",
    })),
  ].sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  ).slice(0, 5);

  // Compute total revenue in ₹
  const totalRevenueRupees = (paymentsData || []).reduce(
    (sum, p) => sum + (p.amount_paise || 0) / 100,
    0
  );

  return (
    <div className="space-y-8">
      {/* ────────────────── HEADER ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time enrollment numbers, pending reviews, submissions, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/applications">
            <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm shadow-blue-500/20">
              <Hourglass className="h-3.5 w-3.5" />
              <span>Review Applications ({pendingAppsCount || 0})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ────────────────── 8 METRIC CARDS ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Students
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{studentsCount || 0}</p>
          <Link href="/admin/students" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>Manage students</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Apps
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingAppsCount || 0}</p>
          <Link href="/admin/applications" className="text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-1">
            <span>Requires action</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Active Enrollments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Interns
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{activeEnrollmentsCount || 0}</p>
          <span className="text-[11px] text-slate-400">Currently in 1-month track</span>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Reviews
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-violet-600">{pendingSubmissionsCount || 0}</p>
          <Link href="/admin/submissions" className="text-[11px] font-semibold text-violet-600 hover:underline flex items-center gap-1">
            <span>Evaluate GitHub code</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Completed Internships */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{completedEnrollmentsCount || 0}</p>
          <span className="text-[11px] text-slate-400">All tasks approved</span>
        </div>

        {/* Certificates Issued */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Certificates
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{issuedCertificatesCount || 0}</p>
          <Link href="/admin/certificates" className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
            <span>View issued registry</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Ledger Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{totalRevenueRupees.toLocaleString("en-IN")}
            </p>
            <span className="text-xs font-semibold text-emerald-600">from Paid task reviews</span>
          </div>
          <Link href="/admin/payments" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>View payments log & export CSV</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ────────────────── RECENT ACTIVITY SPLIT ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Recent Applications</h3>
            <Link href="/admin/applications" className="text-xs font-semibold text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(recentApps || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No applications recorded yet.</p>
            ) : (
              recentApps?.map((app: any) => {
                const profile = Array.isArray(app.profile) ? app.profile[0] : app.profile;
                const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
                const studentName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Student";

                return (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{studentName}</p>
                      <p className="text-[11px] text-slate-500">{internship?.title || "Track"}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{formatDate(app.created_at)}</span>
                      {app.status === "PENDING" && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                          Pending
                        </Badge>
                      )}
                      {app.status === "APPROVED" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Recent Task Submissions</h3>
            <Link href="/admin/submissions" className="text-xs font-semibold text-blue-600 hover:underline">
              Queue →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {combinedRecentSubmissions.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No submissions received yet.</p>
            ) : (
              combinedRecentSubmissions.map((sub: any) => {
                const profile = Array.isArray(sub.profile) ? sub.profile[0] : sub.profile;
                const studentName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Student";

                return (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{studentName}</p>
                      <p className="text-[11px] text-slate-500">{sub.displayTitle || "Submission"}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{formatDate(sub.submitted_at)}</span>
                      {sub.status === "UNDER_REVIEW" && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                          Under Review
                        </Badge>
                      )}
                      {sub.status === "APPROVED" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
