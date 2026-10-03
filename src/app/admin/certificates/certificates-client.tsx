"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Download,
  XCircle,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CertificateItem {
  id: string;
  certificate_number: string;
  url_slug?: string;
  user_id: string;
  enrollment_id: string;
  internship_id?: string;
  type: string;
  status: string;
  issued_at: string;
  pdf_path?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  profile?: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  internship?: {
    title: string;
    slug: string;
  };
  enrollment?: {
    start_date: string;
    end_date: string;
  };
}

export function AdminCertificatesClient({
  initialCertificates,
}: {
  initialCertificates: CertificateItem[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [revokeModal, setRevokeModal] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [detailPanel, setDetailPanel] = useState<CertificateItem | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = initialCertificates.filter((c) => {
    if (
      statusFilter !== "all" &&
      c.status.toLowerCase() !== statusFilter.toLowerCase()
    )
      return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name =
        `${c.profile?.first_name || ""} ${c.profile?.last_name || ""}`.toLowerCase();
      return (
        name.includes(term) ||
        c.certificate_number.toLowerCase().includes(term) ||
        c.profile?.student_id?.toLowerCase().includes(term) ||
        c.profile?.email?.toLowerCase().includes(term) ||
        c.internship?.title?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  async function handleRevoke(cert: CertificateItem) {
    if (!revokeReason.trim()) {
      toast.error("Revocation reason is required.");
      return;
    }
    setLoading(cert.id);
    try {
      const res = await fetch(`/api/admin/certificates/${cert.id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: revokeReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revocation failed");
      toast.success("Certificate revoked successfully.");
      setRevokeModal(null);
      setRevokeReason("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleRegenerate(cert: CertificateItem) {
    setLoading(cert.id);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId: cert.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      toast.success("Certificate PDF generated successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Issued Certificates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official completion credentials verified by the CodeElevate
            academic ledger.
          </p>
        </div>

        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1 text-xs gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Issuance Engine Active
        </Badge>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Automatic Issuance & PDF Generation
          </p>
          <p className="text-slate-600 max-w-2xl">
            When a student completes all required milestone tasks with approval,
            a verified certificate record is automatically minted with a unique
            URL slug, and a PDF is generated and uploaded to secure storage.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, cert ID, student ID, email, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl text-sm bg-white"
          />
        </div>
        <div className="flex gap-2">
          {["all", "ISSUED", "REVOKED"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="rounded-xl text-xs font-bold h-10"
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Total: {filtered.length} certificate
            {filtered.length !== 1 ? "s" : ""}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course Track</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">PDF</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400"
                  >
                    No certificates found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const studentName =
                    `${c.profile?.first_name || ""} ${c.profile?.last_name || ""}`.trim() ||
                    c.profile?.email?.split("@")[0] ||
                    "Student";
                  const isIssued = c.status === "ISSUED";
                  const isRevoked = c.status === "REVOKED";

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isRevoked ? "opacity-60" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {c.certificate_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">
                          {studentName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {c.profile?.student_id || c.profile?.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {c.internship?.title || "Internship"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(c.issued_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isIssued ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                            <CheckCircle className="w-3 h-3" />
                            ISSUED
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold gap-1">
                            <XCircle className="w-3 h-3" />
                            REVOKED
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.pdf_path ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold gap-1">
                            <FileText className="w-3 h-3" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-amber-600 border-amber-200 text-[10px] font-bold"
                          >
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {/* View Details */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailPanel(c)}
                            className="h-7 w-7 p-0"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-600" />
                          </Button>

                          {/* Verify Link */}
                          <Link
                            href={`/verify/${c.url_slug || c.certificate_number}`}
                            target="_blank"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              title="Public Verification"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                          </Link>

                          {/* Download PDF */}
                          {c.pdf_path && (
                            <a
                              href={`/api/certificates/download?id=${c.id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5 text-emerald-600" />
                              </Button>
                            </a>
                          )}

                          {/* Regenerate PDF */}
                          {isIssued && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRegenerate(c)}
                              disabled={loading === c.id}
                              className="h-7 w-7 p-0"
                              title="Regenerate PDF"
                            >
                              {loading === c.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                              )}
                            </Button>
                          )}

                          {/* Revoke */}
                          {isIssued && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRevokeModal(c);
                                setRevokeReason("");
                              }}
                              className="h-7 w-7 p-0"
                              title="Revoke Certificate"
                            >
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Modal */}
      {revokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Revoke Certificate
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRevokeModal(null)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 space-y-1">
              <p className="font-bold">
                You are about to revoke certificate:{" "}
                <span className="font-mono">
                  {revokeModal.certificate_number}
                </span>
              </p>
              <p>
                This action will mark the certificate as REVOKED. The student
                will no longer be able to use it for verification.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Reason for Revocation *
              </label>
              <Textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Explain why this certificate is being revoked..."
                className="text-sm rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRevokeModal(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRevoke(revokeModal)}
                disabled={
                  loading === revokeModal.id || !revokeReason.trim()
                }
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {loading === revokeModal.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Revoke Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {detailPanel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setDetailPanel(null)}
          />
          <div className="relative bg-white w-full max-w-md shadow-2xl border-l border-slate-200 p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Certificate Details
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDetailPanel(null)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <DetailRow
                label="Certificate ID"
                value={detailPanel.certificate_number}
                mono
              />
              <DetailRow
                label="URL Slug"
                value={detailPanel.url_slug || "—"}
                mono
              />
              <DetailRow
                label="Student"
                value={
                  `${detailPanel.profile?.first_name || ""} ${detailPanel.profile?.last_name || ""}`.trim() ||
                  "Student"
                }
              />
              <DetailRow
                label="Student ID"
                value={detailPanel.profile?.student_id || "—"}
                mono
              />
              <DetailRow
                label="Email"
                value={detailPanel.profile?.email || "—"}
              />
              <DetailRow
                label="Course"
                value={detailPanel.internship?.title || "Internship"}
              />
              <DetailRow
                label="Type"
                value={
                  detailPanel.type === "COMPLETION"
                    ? "Certificate of Completion"
                    : "Certificate of Confirmation"
                }
              />
              <DetailRow label="Status" value={detailPanel.status} />
              <DetailRow
                label="Issued At"
                value={new Date(detailPanel.issued_at).toLocaleString()}
              />
              {detailPanel.enrollment && (
                <>
                  <DetailRow
                    label="Start Date"
                    value={new Date(
                      detailPanel.enrollment.start_date
                    ).toLocaleDateString()}
                  />
                  <DetailRow
                    label="End Date"
                    value={new Date(
                      detailPanel.enrollment.end_date
                    ).toLocaleDateString()}
                  />
                </>
              )}
              <DetailRow
                label="PDF Status"
                value={detailPanel.pdf_path ? "Generated ✓" : "Not Generated"}
              />
              {detailPanel.revoked_at && (
                <DetailRow
                  label="Revoked At"
                  value={new Date(detailPanel.revoked_at).toLocaleString()}
                />
              )}
              {detailPanel.revoked_reason && (
                <DetailRow
                  label="Revocation Reason"
                  value={detailPanel.revoked_reason}
                />
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                href={`/verify/${detailPanel.url_slug || detailPanel.certificate_number}`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  className="w-full rounded-xl text-xs font-bold gap-1.5 h-9"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Public Verification
                </Button>
              </Link>

              {detailPanel.pdf_path && (
                <a
                  href={`/api/certificates/download?id=${detailPanel.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="w-full rounded-xl text-xs font-bold gap-1.5 h-9 mt-2">
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-slate-400 font-bold shrink-0">{label}:</span>
      <span
        className={`text-slate-900 font-semibold text-right ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
