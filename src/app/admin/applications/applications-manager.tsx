"use client";

import React, { useState } from "react";
import { Application, Profile, Internship } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  CheckCircle2,
  XCircle,
  Hourglass,
  Eye,
  Filter,
  User,
  Calendar,
  Mail,
  Phone,
  Building,
  GraduationCap,
  MapPin,
  Loader2,
  Check,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ApplicationsManagerProps {
  initialApplications: (Application & {
    profile: Profile;
    internship: Internship;
  })[];
}

export function ApplicationsManager({
  initialApplications,
}: ApplicationsManagerProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedAppForView, setSelectedAppForView] = useState<(Application & { profile: Profile; internship: Internship }) | null>(null);
  const [selectedAppForReject, setSelectedAppForReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter applications
  const filtered = applications.filter((app) => {
    const student = app.profile;
    const internship = app.internship;
    const fullName = `${student?.first_name || ""} ${student?.last_name || ""}`.toLowerCase();
    const email = (student?.email || "").toLowerCase();
    const studentId = (student?.student_id || "").toLowerCase();
    const courseTitle = (internship?.title || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      studentId.includes(query) ||
      courseTitle.includes(query);

    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Approve action
  const handleApprove = async (appId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/applications/${appId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to approve application");
        return;
      }

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "APPROVED" } : a))
      );
      toast.success("Application approved & student enrolled!");
      if (selectedAppForView?.id === appId) {
        setSelectedAppForView((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
      }
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject action
  const handleReject = async () => {
    if (!selectedAppForReject || !rejectReason.trim()) {
      toast.error("Please provide a reason for declining the application");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/admin/applications/${selectedAppForReject}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            reason: rejectReason.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to decline application");
        return;
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedAppForReject
            ? { ...a, status: "REJECTED", admin_note: rejectReason.trim() }
            : a
        )
      );
      toast.success("Application rejected with reason provided");
      setSelectedAppForReject(null);
      setRejectReason("");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ────────────────── FILTER BAR ────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name, ID, email, or track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL" ? "All Applications" : status}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────── APPLICATIONS TABLE ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No applications match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Internship Track</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">College / Degree</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => {
                  const student = app.profile;
                  const internship = app.internship;
                  const studentName =
                    `${student?.first_name || ""} ${student?.last_name || ""}`.trim() ||
                    "Student";

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {student?.student_id || "CE2026"} • {student?.email}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {internship?.title || "Internship Program"}
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {formatDate(app.created_at)}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {student?.college || "—"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {student?.degree || ""} {student?.department ? `• ${student?.department}` : ""}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        {app.status === "PENDING" && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold gap-1">
                            <Hourglass className="h-3 w-3" /> Under Review
                          </Badge>
                        )}
                        {app.status === "APPROVED" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </Badge>
                        )}
                        {app.status === "REJECTED" && (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold gap-1">
                            <XCircle className="h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedAppForView(app)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>View</span>
                          </Button>

                          {app.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => handleApprove(app.id)}
                                className="h-8 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isProcessing}
                                onClick={() => {
                                  setSelectedAppForReject(app.id);
                                  setRejectReason("");
                                }}
                                className="h-8 px-2.5 rounded-lg text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                                <span>Decline</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────────── APPLICATION DETAIL SIDE SHEET ────────────────── */}
      <Sheet open={!!selectedAppForView} onOpenChange={(open) => !open && setSelectedAppForView(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6 sm:p-8 space-y-6">
          {selectedAppForView && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-bold font-mono">
                    ID: {selectedAppForView.profile?.student_id || "CE2026"}
                  </Badge>
                  <Badge
                    className={
                      selectedAppForView.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                        : selectedAppForView.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                        : "bg-red-50 text-red-700 border-red-200 font-bold"
                    }
                  >
                    {selectedAppForView.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-black text-slate-900 mt-2">
                  {selectedAppForView.profile?.first_name} {selectedAppForView.profile?.last_name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  Applied for {selectedAppForView.internship?.title} on {formatDate(selectedAppForView.created_at)}
                </SheetDescription>
              </SheetHeader>

              {/* Personal Details Card */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold text-slate-800">{selectedAppForView.profile?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-semibold text-slate-800">+91 {selectedAppForView.profile?.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">WhatsApp</span>
                    <span className="font-semibold text-slate-800">{selectedAppForView.profile?.whatsapp ? `+91 ${selectedAppForView.profile.whatsapp}` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-semibold text-slate-800">{selectedAppForView.profile?.gender || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Address & Location
                </h4>
                <p className="text-xs text-slate-700">
                  {selectedAppForView.profile?.address ? `${selectedAppForView.profile.address}, ` : ""}
                  {selectedAppForView.profile?.city}, {selectedAppForView.profile?.state} - {selectedAppForView.profile?.pincode}
                </p>
              </div>

              {/* Education Card */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Academic Background
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900">{selectedAppForView.profile?.college}</p>
                  <p>{selectedAppForView.profile?.degree} in {selectedAppForView.profile?.department}</p>
                  <p className="text-slate-500 text-[11px]">Passout Year: {selectedAppForView.profile?.passout_year}</p>
                </div>
              </div>

              {/* Resume / CV Card */}
              {(selectedAppForView.resume_url || selectedAppForView.profile?.resume_url) && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Student Resume / CV
                  </h4>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-5 w-5 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {selectedAppForView.resume_file_name || selectedAppForView.profile?.resume_file_name || "Student_Resume.pdf"}
                        </p>
                        <p className="text-[10px] text-slate-400">PDF Document</p>
                      </div>
                    </div>
                    <a
                      href={selectedAppForView.resume_url || selectedAppForView.profile?.resume_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shrink-0"
                    >
                      <span>View Resume</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Dates & Schedule */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Internship Schedule
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Start Date</span>
                    <span className="font-semibold">{selectedAppForView.start_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">End Date</span>
                    <span className="font-semibold">{selectedAppForView.end_date}</span>
                  </div>
                </div>
              </div>

              {/* Note if rejected */}
              {selectedAppForView.admin_note && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-900 space-y-1">
                  <span className="font-bold block">Admin Evaluation Note:</span>
                  <p>{selectedAppForView.admin_note}</p>
                </div>
              )}

              {/* Actions */}
              {selectedAppForView.status === "PENDING" && (
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAppForReject(selectedAppForView.id);
                      setSelectedAppForView(null);
                    }}
                    className="rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedAppForView.id)}
                    disabled={isProcessing}
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve & Enroll</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ────────────────── REJECT MODAL ────────────────── */}
      <Dialog open={!!selectedAppForReject} onOpenChange={(open) => !open && setSelectedAppForReject(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              Decline Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please enter the reason for declining. This explanation will be sent directly to the student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-bold text-slate-700">
                Decline Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g. Incomplete background details, batch full, or prerequisite mismatch..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAppForReject(null)}
                className="rounded-xl text-xs font-semibold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="rounded-xl text-xs font-bold h-10 px-5 bg-red-600 hover:bg-red-500 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Decline Application</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
