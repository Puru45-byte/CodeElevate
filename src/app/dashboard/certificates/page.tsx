import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentCertificates } from "@/lib/queries/internships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Hash,
  FileText,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Certificates | CodeElevate",
  description:
    "View and verify your issued CodeElevate credentials and certificates.",
};

export const revalidate = 0;

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/certificates");
  }

  const certificates = await getStudentCertificates(supabase, user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Verified Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Certificates
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verifiable certificates for completed internships
          and milestone projects.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Award className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No certificates issued yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete all mandatory milestone tasks in your active internship to
              receive your verified digital certificate.
            </p>
          </div>
          <Link href="/dashboard/learning">
            <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
              <BookOpen className="h-4 w-4" />
              <span>Go to My Learning</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const isIssued =
              cert.status === "ISSUED" || cert.status === "VALID";
            const isRevoked = cert.status === "REVOKED";
            const certType =
              cert.type === "COMPLETION"
                ? "Certificate of Completion"
                : "Certificate of Confirmation";

            return (
              <div
                key={cert.id}
                className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between transition-all ${
                  isRevoked
                    ? "border-red-200 opacity-75"
                    : "border-slate-200/80 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${
                        isRevoked
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}
                    >
                      <Award className="h-6 w-6" />
                    </div>
                    {isIssued ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    ) : isRevoked ? (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-xs font-bold">
                        Revoked
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-slate-400 text-xs"
                      >
                        {cert.status}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {certType}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {cert.internship?.title || "Practical Internship Program"}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Credential ID: {cert.certificate_number}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Issue Date:
                      </span>
                      <span className="font-semibold">
                        {formatDate(cert.issued_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Hash className="h-3 w-3" /> Verification Slug:
                      </span>
                      <span className="font-mono text-[11px] font-semibold">
                        {cert.url_slug}
                      </span>
                    </div>
                    {cert.pdf_path && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> PDF:
                        </span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Generated
                        </span>
                      </div>
                    )}
                  </div>

                  {isRevoked && cert.revoked_reason && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
                      <span className="font-bold">Revocation Reason:</span>{" "}
                      {cert.revoked_reason}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/verify?code=${cert.certificate_number}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Public Verification</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  {isIssued && cert.pdf_path && (
                    <a
                      href={`/api/certificates/download?id=${cert.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-bold gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        <span>Download PDF</span>
                      </Button>
                    </a>
                  )}

                  {isIssued && !cert.pdf_path && (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 text-[10px] font-bold"
                    >
                      PDF generating...
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
