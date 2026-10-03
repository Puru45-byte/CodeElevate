"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Filter,
  Check,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  X,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SubmissionItem {
  id: string;
  enrollment_id: string;
  task_id?: string | null;
  user_id: string;
  payment_id?: string | null;
  github_url: string;
  comments?: string | null;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | string;
  attempt_no: number;
  feedback?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  task?: {
    id: string;
    title: string;
    position?: number;
    is_required?: boolean;
  };
  enrollment?: {
    id: string;
    start_date: string;
    end_date: string;
    internship?: {
      id: string;
      title: string;
      slug: string;
    };
  };
  profile?: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  payment?: {
    id: string;
    status: string;
    amount_paise: number;
    razorpay_payment_id?: string;
  };
}

interface SubmissionsManagerProps {
  initialSubmissions: SubmissionItem[];
}

export function SubmissionsManager({
  initialSubmissions,
}: SubmissionsManagerProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(
    initialSubmissions
  );
  const [statusFilter, setStatusFilter] = useState<string>("UNDER_REVIEW");
  const [search, setSearch] = useState("");

  // Review Modal State
  const [activeModal, setActiveModal] = useState<{
    submission: SubmissionItem;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus =
      statusFilter === "ALL" || sub.status === statusFilter;

    const studentName = `${sub.profile?.first_name || ""} ${
      sub.profile?.last_name || ""
    }`.toLowerCase();
    const studentEmail = (sub.profile?.email || "").toLowerCase();
    const studentCode = (sub.profile?.student_id || "").toLowerCase();
    const taskTitle = (sub.task?.title || "").toLowerCase();
    const courseTitle = (
      sub.enrollment?.internship?.title || ""
    ).toLowerCase();

    const q = search.toLowerCase();
    const matchesSearch =
      studentName.includes(q) ||
      studentEmail.includes(q) ||
      studentCode.includes(q) ||
      taskTitle.includes(q) ||
      courseTitle.includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleOpenReview = (
    submission: SubmissionItem,
    action: "APPROVE" | "REJECT"
  ) => {
    setActiveModal({ submission, action });
    setFeedback(
      action === "APPROVE"
        ? "Excellent project implementation! Deliverables meet all quality and architecture standards."
        : ""
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    if (
      activeModal.action === "REJECT" &&
      (!feedback || feedback.trim().length === 0)
    ) {
      toast.error("Feedback is required when rejecting a submission.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${activeModal.submission.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: activeModal.action === "APPROVE" ? "APPROVED" : "REJECTED",
            feedback: feedback.trim() || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review submission failed");

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === activeModal.submission.id
            ? {
                ...item,
                status:
                  activeModal.action === "APPROVE" ? "APPROVED" : "REJECTED",
                feedback: feedback.trim(),
                reviewed_at: new Date().toISOString(),
              }
            : item
        )
      );

      toast.success(
        activeModal.action === "APPROVE"
          ? "Internship work approved! Certificate generated and issued."
          : "Submission marked for revision with mentor feedback."
      );

      setActiveModal(null);
      setFeedback("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Internship Submissions Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review student final project repositories, evaluate code quality, provide actionable mentor feedback, and issue verified completion certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-bold px-3 py-1 text-xs">
            {submissions.filter((s) => s.status === "UNDER_REVIEW").length}{" "}
            Pending Review
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search student name, CE-ID, track..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["UNDER_REVIEW", "APPROVED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "UNDER_REVIEW"
                ? "Under Review"
                : st === "APPROVED"
                ? "Approved"
                : st === "REJECTED"
                ? "Needs Revision"
                : "All Submissions"}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No submissions in this queue
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter === "UNDER_REVIEW"
              ? "All submitted project deliverables have been reviewed! Great job."
              : "No submissions matched your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const studentName = `${sub.profile?.first_name || ""} ${
              sub.profile?.last_name || ""
            }`.trim() || sub.profile?.email?.split("@")[0] || "Student";

            const trackTitle =
              sub.enrollment?.internship?.title ||
              sub.task?.title ||
              "Internship Deliverable";

            const isPaid =
              sub.payment?.status === "PAID" || !!sub.payment_id;

            return (
              <div
                key={sub.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  {/* Status & Track header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={`text-[10px] font-extrabold py-0.5 px-2.5 ${
                        sub.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : sub.status === "UNDER_REVIEW"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {sub.status.replace("_", " ")}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-blue-700 bg-blue-50/60 border-blue-200"
                    >
                      {trackTitle}
                    </Badge>

                    <span className="text-xs text-slate-400 font-semibold">
                      Attempt #{sub.attempt_no}
                    </span>

                    {/* Payment Status Badge */}
                    <Badge
                      className={`text-[10px] font-bold py-0.5 px-2 gap-1 ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {isPaid ? "Evaluation Fee Verified" : "Review Verified"}
                    </Badge>
                  </div>

                  {/* Student Title */}
                  <div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <Link
                          href={`/admin/students/${sub.user_id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {studentName} ({sub.profile?.student_id || "CE-STUDENT"})
                        </Link>
                      </div>

                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{sub.profile?.email}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">
                        Submitted:{" "}
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* GitHub URL Button */}
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={sub.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <span>Open GitHub Repository</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                    </a>

                    {sub.comments && (
                      <span className="text-xs text-slate-500 italic truncate max-w-md">
                        &ldquo;{sub.comments}&rdquo;
                      </span>
                    )}
                  </div>

                  {/* Previous Feedback if any */}
                  {sub.feedback && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900">
                        Mentor Feedback:{" "}
                      </span>
                      {sub.feedback}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenReview(sub, "APPROVE")}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve & Certify
                    </Button>

                    <Button
                      onClick={() => handleOpenReview(sub, "REJECT")}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Request Revision
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {activeModal.action === "APPROVE" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="font-extrabold text-slate-900 text-base">
                  {activeModal.action === "APPROVE"
                    ? "Approve & Issue Certificate"
                    : "Request Revision with Feedback"}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800">
                  {activeModal.submission.enrollment?.internship?.title ||
                    activeModal.submission.task?.title ||
                    "Internship Deliverable"}
                </p>
                <p className="text-slate-500">
                  Student: {activeModal.submission.profile?.first_name}{" "}
                  {activeModal.submission.profile?.last_name} (
                  {activeModal.submission.profile?.student_id})
                </p>
                <a
                  href={activeModal.submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Check GitHub repo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mentor Evaluation Feedback{" "}
                  {activeModal.action === "REJECT" ? (
                    <span className="text-red-500">* (Required on reject)</span>
                  ) : (
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  )}
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder={
                    activeModal.action === "APPROVE"
                      ? "Great work on the code architecture and tests..."
                      : "Explain what needs improvement before resubmission..."
                  }
                  required={activeModal.action === "REJECT"}
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl text-xs font-bold border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className={`rounded-xl text-xs font-bold text-white shadow-sm gap-1.5 ${
                    activeModal.action === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submittingReview
                    ? "Submitting..."
                    : activeModal.action === "APPROVE"
                    ? "Confirm Approval & Issue Certificate"
                    : "Confirm Revision Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
