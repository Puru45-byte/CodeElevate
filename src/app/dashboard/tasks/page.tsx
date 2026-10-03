import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getStudentEnrollments,
  getInternshipBySlug,
} from "@/lib/queries/internships";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight } from "lucide-react";
import { TasksClient } from "./tasks-client";

export const metadata: Metadata = {
  title: "My Tasks | CodeElevate",
  description: "View all tasks and milestones for your active internship track.",
};

export const revalidate = 0;

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/tasks");
  }

  const enrollments = await getStudentEnrollments(supabase, user.id);
  const activeEnrollment =
    enrollments.find((e) => e.status === "ACTIVE") || null;
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "COMPLETED"
  );

  if (!activeEnrollment) {
    if (completedEnrollments.length > 0) {
      return (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Deliverables Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Tasks & Milestones
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              All tasks for your enrolled tracks have been reviewed and approved.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200/80 bg-white p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
              <CheckSquare className="h-10 w-10 text-emerald-600" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs py-1 px-3.5 inline-block">
                ALL MILESTONES COMPLETED & CERTIFIED 🎓
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                You have no pending tasks!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have successfully completed all deliverables for your enrolled internship tracks. Your mentor evaluations are complete and your official verified certificates are issued.
              </p>
            </div>

            {/* List of completed tracks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left pt-2">
              {completedEnrollments.map((enr: any) => (
                <div
                  key={enr.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {enr.internship?.title || "Internship"}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      ✓ Certified (8/8 Approved)
                    </span>
                  </div>
                  <Link href="/dashboard/certificates">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Certificate →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard/certificates">
                <Button className="h-11 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-500/20">
                  <span>View My Certificates</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/internships">
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-xl text-xs font-bold gap-2"
                >
                  <span>Explore New Internships</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <CheckSquare className="h-7 w-7" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-slate-900">
            No active internship found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tasks will appear here once your internship application is approved.
          </p>
        </div>
        <Link href="/dashboard/applications">
          <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
            <span>Check Application Status</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch detailed internship with modules and tasks
  let detailedInternship = null;
  if (activeEnrollment.internship?.slug) {
    detailedInternship = await getInternshipBySlug(
      supabase,
      activeEnrollment.internship.slug
    );
  }

  // Fetch latest internship submission (from internship_submissions, fallback to task_submissions)
  const { data: intSubmissions } = await supabase
    .from("internship_submissions")
    .select("*")
    .eq("enrollment_id", activeEnrollment.id)
    .order("submitted_at", { ascending: false })
    .limit(1);

  let latestSub = intSubmissions?.[0] || null;

  if (!latestSub) {
    // Fallback check in task_submissions
    const { data: taskSubs } = await supabase
      .from("task_submissions")
      .select("*")
      .eq("enrollment_id", activeEnrollment.id)
      .order("submitted_at", { ascending: false })
      .limit(1);

    if (taskSubs && taskSubs.length > 0) {
      latestSub = taskSubs[0];
    }
  }

  const modules = detailedInternship?.modules || [];
  const allTasks = detailedInternship?.tasks || [];

  return (
    <TasksClient
      enrollment={activeEnrollment as any}
      modules={modules as any}
      allTasks={allTasks as any}
      latestSubmission={latestSub}
    />
  );
}
