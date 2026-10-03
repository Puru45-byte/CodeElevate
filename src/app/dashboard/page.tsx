import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  getStudentApplications,
  getStudentEnrollments,
  getEnrollmentProgress,
  getEnrollmentTaskStatuses,
  getStudentCertificates,
} from "@/lib/queries/internships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Layers,
  ArrowRight,
  Calendar,
  Sparkles,
  Hourglass,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export const metadata: Metadata = {
  title: "Student Dashboard | CodeElevate",
  description: "View your active internships, progress, tasks, and certificates.",
};

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Fetch enrollments & applications
  const enrollments = await getStudentEnrollments(supabase, user.id);
  const applications = await getStudentApplications(supabase, user.id);
  const certificates = await getStudentCertificates(supabase, user.id);

  const activeEnrollment =
    enrollments.find((e) => e.status === "ACTIVE") || null;
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "COMPLETED"
  );
  const latestApplication = applications[0];

  // 3. Compute stats via DB RPC
  let progress = { approved_required: 0, total_required: 0, percent: 0 };
  let pendingTasksCount = 0;
  let completedTasksCount = 0;
  let daysRemaining = 0;

  if (activeEnrollment) {
    progress = await getEnrollmentProgress(supabase, activeEnrollment.id);
    const taskStatuses = await getEnrollmentTaskStatuses(
      supabase,
      activeEnrollment.id
    );

    completedTasksCount = taskStatuses.filter(
      (t) => t.computed_status === "APPROVED"
    ).length;
    pendingTasksCount = taskStatuses.filter(
      (t) =>
        t.computed_status === "AVAILABLE" ||
        t.computed_status === "UNDER_REVIEW"
    ).length;

    if (activeEnrollment.end_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = parseISO(activeEnrollment.end_date);
      daysRemaining = Math.max(0, differenceInDays(endDate, today));
    }
  } else if (completedEnrollments.length > 0) {
    progress = { approved_required: 8, total_required: 8, percent: 100 };
    completedTasksCount = 8;
    pendingTasksCount = 0;
  }

  const studentFirstName =
    profile?.first_name || user.email?.split("@")[0] || "Student";
  const hasValidCertificate = certificates.some(
    (c) => c.status === "ISSUED" || c.status === "VALID"
  );

  return (
    <div className="space-y-8">
      {/* ────────────────── GREETING & HERO BANNER ────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <Award className="h-64 w-64" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-blue-200 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>Student Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Welcome back, {studentFirstName}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {completedEnrollments.length > 0 && !activeEnrollment
              ? "Congratulations on completing your internship! Your verified credentials are ready for download and sharing."
              : "Track your milestones, submit your local code deliverables, and unlock your verified credential upon evaluation."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeEnrollment ? (
              <Link href="/dashboard/learning">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-blue-500/30 gap-2">
                  <span>Continue Learning</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : completedEnrollments.length > 0 ? (
              <>
                <Link href="/dashboard/certificates">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-emerald-500/30 gap-2">
                    <Award className="h-4 w-4" />
                    <span>View Certificates</span>
                  </Button>
                </Link>
                <Link href="/internships">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-5 rounded-xl gap-2">
                    <span>Explore New Internships</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : latestApplication?.status === "PENDING" ? (
              <Link href="/dashboard/applications">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs h-10 px-5 rounded-xl gap-2">
                  <Hourglass className="h-4 w-4" />
                  <span>View Application Under Review</span>
                </Button>
              </Link>
            ) : (
              <Link href="/internships">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-5 rounded-xl gap-2">
                  <span>Explore & Apply for Internships</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Link href="/dashboard/submissions">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-semibold h-10 px-4 rounded-xl"
              >
                My Submissions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── STATS GRID ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Course Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Track Progress
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {progress.percent}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {progress.approved_required} of {progress.total_required} required tasks
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Tasks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {pendingTasksCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {pendingTasksCount > 0 ? "Awaiting review or submit" : "All caught up"}
            </p>
          </div>
          <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
            <Link href="/dashboard/tasks" className="hover:underline flex items-center gap-1">
              <span>View task list</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Days Remaining */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Days Remaining
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeEnrollment ? `${daysRemaining}d` : "—"}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeEnrollment ? `Until ${activeEnrollment.end_date}` : "No active batch"}
            </p>
          </div>
          <div className="text-[11px] font-semibold text-indigo-600">
            {activeEnrollment ? "1 Month Duration" : "Not enrolled"}
          </div>
        </div>

        {/* Card 4: Certificate Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Certificate
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">
              {hasValidCertificate ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-5 w-5" /> Issued
                </span>
              ) : progress.percent === 100 ? (
                <span className="text-blue-600">Eligible</span>
              ) : (
                <span className="text-slate-500 text-base">In Progress</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {hasValidCertificate
                ? "Credential verified & ready"
                : "Complete all required tasks"}
            </p>
          </div>
          <div className="text-[11px] font-semibold text-emerald-600">
            <Link href="/dashboard/certificates" className="hover:underline flex items-center gap-1">
              <span>View credentials</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── ACTIVE INTERNSHIP / GRADUATED / EMPTY STATE ────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>
            {activeEnrollment
              ? "Active Learning Track"
              : completedEnrollments.length > 0
              ? "Graduation & Completed Tracks"
              : "Active Learning Track"}
          </span>
        </h2>

        {activeEnrollment ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-2.5 shadow-sm ring-1 ring-blue-100">
                  <Image
                    src={
                      activeEnrollment.internship?.icon_url ||
                      "/icons/open-book.png"
                    }
                    alt={activeEnrollment.internship?.title || "Internship"}
                    width={38}
                    height={38}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      IN PROGRESS
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-slate-600">
                      Remote
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {activeEnrollment.internship?.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeEnrollment.start_date} to {activeEnrollment.end_date}
                  </p>
                </div>
              </div>

              <Link href="/dashboard/learning">
                <Button className="font-bold text-xs rounded-xl h-10 px-5 gap-2 shadow-md shadow-blue-500/20">
                  <span>Open Curriculum</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Quick summary strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block">Completed Tasks</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {completedTasksCount} / {progress.total_required} Tasks
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block">Batch Timeline</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {daysRemaining} Days Left
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block">Credential Readiness</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                  {progress.percent}% Ready
                </span>
              </div>
            </div>
          </div>
        ) : completedEnrollments.length > 0 ? (
          /* All Completed Celebration State */
          <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 p-2.5 shadow-sm ring-1 ring-emerald-100 text-emerald-600">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                      ALL TRACKS COMPLETED & CERTIFIED 🎓
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Graduation Achieved
                  </h3>
                  <p className="text-xs text-slate-500">
                    You have earned {certificates.length} verified completion credential{certificates.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/dashboard/certificates">
                  <Button className="font-bold text-xs rounded-xl h-10 px-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                    <Award className="h-4 w-4" />
                    <span>View Certificates</span>
                  </Button>
                </Link>
                <Link href="/internships">
                  <Button variant="outline" className="font-bold text-xs rounded-xl h-10 px-4 gap-1.5">
                    <span>Browse More Tracks</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* List of completed tracks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedEnrollments.map((enr: any) => (
                <div
                  key={enr.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      {enr.internship?.title || "Internship"}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Certified (100% Complete)
                    </span>
                  </div>
                  <Link href="/dashboard/certificates">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      Certificate →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : latestApplication?.status === "PENDING" ? (
          /* Under Review State matching collage screen */
          <div className="bg-white rounded-3xl border border-amber-200/80 p-8 text-center space-y-4 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Hourglass className="h-8 w-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                APPLICATION UNDER REVIEW
              </span>
              <h3 className="text-lg font-bold text-slate-900 pt-2">
                Your application for {latestApplication.internship?.title} is being reviewed
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our academic team is reviewing your profile. You will receive full dashboard curriculum access once your application is approved.
              </p>
            </div>
            <Link href="/dashboard/applications">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-2">
                <FileText className="h-4 w-4" />
                <span>Check Application Status</span>
              </Button>
            </Link>
          </div>
        ) : (
          /* Empty state when no applications / enrollments exist */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                No active internship yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose an internship track, complete real-world practical milestones, and receive your industry-recognized verified certificate.
              </p>
            </div>
            <Link href="/internships">
              <Button className="font-bold text-xs rounded-xl h-10 px-6 gap-2 shadow-md shadow-blue-500/20">
                <span>Browse Internships</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
