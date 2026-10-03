import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  Github,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Submissions | CodeElevate",
  description: "View the evaluation status and mentor feedback on all your submitted internship work.",
};

export const revalidate = 0;

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/submissions");
  }

  // 1. Fetch internship_submissions
  const { data: intSubmissions } = await supabase
    .from("internship_submissions")
    .select(`
      *,
      enrollment:enrollments(
        id,
        start_date,
        end_date,
        internship:internships(id, title, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });

  // 2. Fallback to task_submissions for legacy data
  let allSubmissions: any[] = intSubmissions || [];

  if (allSubmissions.length === 0) {
    const { data: taskSubmissions } = await supabase
      .from("task_submissions")
      .select(`
        *,
        enrollment:enrollments(
          id,
          start_date,
          end_date,
          internship:internships(id, title, slug)
        ),
        task:tasks(id, title)
      `)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    allSubmissions = taskSubmissions || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Evaluation History
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Submissions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all your submitted project repositories, evaluation status, and mentor feedback.
        </p>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {allSubmissions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Layers className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                No submissions yet
              </h3>
              <p className="text-xs text-slate-500">
                Once you submit your project repository for review, your evaluations and feedbacks will appear here.
              </p>
            </div>
            <Link href="/dashboard/tasks">
              <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
                <BookOpen className="h-4 w-4" />
                <span>Go to My Tasks</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Internship Track</th>
                  <th className="py-4 px-6">Repository</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Attempt</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Mentor Feedback / Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSubmissions.map((sub: any) => {
                  const trackTitle =
                    sub.enrollment?.internship?.title ||
                    sub.task?.title ||
                    "Internship Track";

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{trackTitle}</p>
                        {sub.comments && (
                          <p className="text-[11px] text-slate-400 italic truncate max-w-xs">
                            &ldquo;{sub.comments}&rdquo;
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline max-w-[220px] truncate"
                        >
                          <Github className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {sub.github_url.replace("https://github.com/", "")}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {formatDate(sub.submitted_at)}
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-700 bg-slate-50">
                          #{sub.attempt_no || 1}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        {sub.status === "APPROVED" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </Badge>
                        )}
                        {sub.status === "UNDER_REVIEW" && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold gap-1">
                            <Hourglass className="h-3 w-3 animate-spin" /> Under Review
                          </Badge>
                        )}
                        {sub.status === "REJECTED" && (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold gap-1">
                            <AlertCircle className="h-3 w-3" /> Needs Revision
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {sub.status === "APPROVED" ? (
                          <Link href="/dashboard/certificates">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] font-bold text-emerald-600 gap-1">
                              <Award className="h-3.5 w-3.5" />
                              <span>View Certificate</span>
                            </Button>
                          </Link>
                        ) : sub.status === "REJECTED" ? (
                          <div className="space-y-1">
                            {sub.feedback && (
                              <span
                                className="text-[11px] text-red-600 italic block max-w-xs ml-auto truncate"
                                title={sub.feedback}
                              >
                                &ldquo;{sub.feedback}&rdquo;
                              </span>
                            )}
                            <Link href="/dashboard/tasks">
                              <Button size="sm" className="h-7 px-2.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg gap-1">
                                <span>Resubmit Work</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        ) : sub.feedback ? (
                          <span
                            className="text-[11px] text-slate-600 italic block max-w-xs ml-auto truncate"
                            title={sub.feedback}
                          >
                            &ldquo;{sub.feedback}&rdquo;
                          </span>
                        ) : (
                          <span className="text-slate-400">Awaiting Evaluation</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
