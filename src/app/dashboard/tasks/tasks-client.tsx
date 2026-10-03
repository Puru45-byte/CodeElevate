"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  BookOpen,
  Download,
  Github,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  FolderDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmitInternshipDialog } from "@/components/shared/SubmitInternshipDialog";
import { toast } from "sonner";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  position?: number;
  is_required?: boolean;
  module_id?: string | null;
  module?: {
    id: string;
    title: string;
    position: number;
  };
}

interface ModuleGroup {
  id: string;
  title: string;
  position: number;
  tasks: TaskItem[];
}

interface TasksClientProps {
  enrollment: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    internship?: {
      id: string;
      title: string;
      slug: string;
      description?: string;
      technologies?: string[];
    };
  };
  modules: ModuleGroup[];
  allTasks: TaskItem[];
  latestSubmission: {
    id: string;
    status: string;
    github_url: string;
    attempt_no: number;
    feedback?: string | null;
    submitted_at: string;
  } | null;
}

export function TasksClient({
  enrollment,
  modules,
  allTasks,
  latestSubmission,
}: TasksClientProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(
    allTasks[0]?.id || null
  );
  const [downloading, setDownloading] = useState(false);

  const internshipTitle =
    enrollment.internship?.title || "Internship Program";

  const handleDownloadMaterials = async () => {
    setDownloading(true);
    try {
      // Fetch signed URL or open study resource
      const res = await fetch("/api/resources/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: enrollment.internship?.id || "learning-materials",
        }),
      });
      const data = await res.json();
      if (res.ok && data.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        // Fallback: notify that syllabus document is ready
        toast.info("Downloading official project specifications and slides...");
        // Generate client-side printable document or view curriculum
        window.open(`/internships/${enrollment.internship?.slug || ""}`, "_blank");
      }
    } catch {
      toast.error("Failed to download materials. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const isUnderReview = latestSubmission?.status === "UNDER_REVIEW";
  const isApproved = latestSubmission?.status === "APPROVED";
  const isRejected = latestSubmission?.status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* ────────────────── HEADER BANNER ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
              {enrollment.internship?.title || "Curriculum"}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-semibold">
              Batch: {enrollment.start_date} - {enrollment.end_date}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Internship Tasks & Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Review all practical tasks grouped by week below. Complete all project requirements in your local repository and submit your GitHub repository for final evaluation.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleDownloadMaterials}
            disabled={downloading}
            className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 shadow-sm"
          >
            <FolderDown className="w-4 h-4 text-blue-600" />
            <span>Download Materials (PPT/PDF)</span>
          </Button>

          <Button
            onClick={() => setIsSubmitDialogOpen(true)}
            disabled={isUnderReview || isApproved}
            className="rounded-xl text-xs sm:text-sm font-bold h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isApproved
                ? "Internship Approved"
                : isUnderReview
                ? "Submission Under Review"
                : isRejected
                ? "Resubmit Internship Work"
                : "Submit Internship Work"}
            </span>
          </Button>
        </div>
      </div>

      {/* ────────────────── SUBMISSION STATUS BANNER ────────────────── */}
      {latestSubmission && (
        <div>
          {isUnderReview && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 flex items-start gap-3.5 text-amber-900 shadow-sm">
              <Hourglass className="h-5 w-5 shrink-0 text-amber-600 animate-spin mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">Submission Under Review (Attempt #{latestSubmission.attempt_no})</p>
                  <span className="text-[11px] text-amber-700">
                    Submitted: {new Date(latestSubmission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your project repository is currently being evaluated by our mentor team. You will receive feedback and your credential upon approval.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={latestSubmission.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Submitted Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex items-start gap-3.5 text-emerald-900 shadow-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-sm">Internship Deliverables Approved! 🎓</p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {latestSubmission.feedback ||
                    "Outstanding work! Your deliverables have met all required criteria and your Certificate of Completion has been issued."}
                </p>
                <div className="pt-2">
                  <Link href="/dashboard/certificates">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-8 px-4">
                      View Certificate →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 flex items-start gap-3.5 text-red-900 shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-sm">Mentor Revision Feedback (Attempt #{latestSubmission.attempt_no})</p>
                <p className="text-xs text-red-800 leading-relaxed">
                  {latestSubmission.feedback ||
                    "Please review the task requirements, improve test cases or missing functions, and resubmit your updated repository link."}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => setIsSubmitDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl h-8 px-4"
                  >
                    Resubmit Project Work →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── TASKS GROUPED BY WEEK / MODULE ────────────────── */}
      <div className="space-y-6">
        {modules.length === 0 && allTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No tasks listed</h3>
            <p className="text-xs text-slate-500">Tasks will appear here once the curriculum is configured.</p>
          </div>
        ) : modules.length > 0 ? (
          modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-black text-xs">
                    W{mod.position || modIdx + 1}
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {mod.title}
                    </h2>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {mod.tasks.length} {mod.tasks.length === 1 ? "milestone task" : "milestone tasks"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Tasks */}
              <div className="divide-y divide-slate-100">
                {mod.tasks.map((task, tIdx) => {
                  const isExpanded = expandedTaskId === task.id;
                  return (
                    <div key={task.id} className="py-4 first:pt-2 last:pb-0 space-y-3">
                      <div
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                        className="flex items-center justify-between gap-4 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                            #{tIdx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          {task.is_required && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-red-600 border-red-200 bg-red-50 font-bold"
                            >
                              Required Milestone
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-slate-400 group-hover:text-slate-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Read-Only Details */}
                      {isExpanded && (
                        <div className="pl-6 pt-2 space-y-4 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 animate-in fade-in-50 duration-200">
                          <div>
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                              Task Description
                            </span>
                            <p className="leading-relaxed whitespace-pre-line text-slate-700">
                              {task.description}
                            </p>
                          </div>

                          {task.requirements && task.requirements.length > 0 && (
                            <div className="border-t border-slate-200/60 pt-3 space-y-2">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block">
                                Deliverable Requirements
                              </span>
                              <ol className="space-y-1.5 pl-1">
                                {task.requirements.map((req, rIdx) => (
                                  <li
                                    key={rIdx}
                                    className="flex items-start gap-2 text-slate-700"
                                  >
                                    <span className="font-bold text-blue-600 shrink-0">
                                      {rIdx + 1}.
                                    </span>
                                    <span className="leading-relaxed">{req}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          /* Fallback if flat tasks without modules */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">
              Curriculum Milestones
            </h2>
            <div className="divide-y divide-slate-100">
              {allTasks.map((task, idx) => (
                <div key={task.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── BOTTOM CTA BAR ────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-black tracking-tight">
            Ready to submit your complete internship work?
          </h3>
          <p className="text-xs text-slate-300">
            Submit your single GitHub repository link for mentor review and verified credential issuance.
          </p>
        </div>

        <Button
          onClick={() => setIsSubmitDialogOpen(true)}
          disabled={isUnderReview || isApproved}
          className="rounded-xl text-xs sm:text-sm font-bold h-11 px-6 bg-white text-slate-900 hover:bg-slate-100 shadow-md shrink-0 gap-2"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>
            {isApproved
              ? "Completed & Certified"
              : isUnderReview
              ? "Under Review"
              : "Submit Internship Work →"}
          </span>
        </Button>
      </div>

      {/* Submit Modal */}
      <SubmitInternshipDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        enrollmentId={enrollment.id}
        internshipTitle={internshipTitle}
      />
    </div>
  );
}
