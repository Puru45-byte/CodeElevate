import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicCertificateVerification } from "@/types/database";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User,
  Award,
  Calendar,
  Clock,
  Building,
  FileText,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Verify Certificate ${slug} | CodeElevate`,
    description: "Public verification page for CodeElevate certificate.",
  };
}

export default async function VerifySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabaseAdmin = createAdminClient();

  const { data: cert, error } = await supabaseAdmin
    .from("certificates")
    .select(`
      certificate_number,
      url_slug,
      type,
      status,
      issued_at,
      profile:profiles(first_name, last_name, student_id),
      internship:internships(title, duration_months),
      template:certificate_templates(config)
    `)
    .or(`certificate_number.eq.${slug},url_slug.eq.${slug}`)
    .maybeSingle();

  if (error || !cert) {
    notFound();
  }

  const profile = Array.isArray(cert.profile) ? cert.profile[0] : cert.profile;
  const internship = Array.isArray(cert.internship) ? cert.internship[0] : cert.internship;
  const template = Array.isArray(cert.template) ? cert.template[0] : cert.template;

  const studentFullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Student"
    : "Student";

  const result: PublicCertificateVerification = {
    certificate_number: cert.certificate_number,
    url_slug: cert.url_slug,
    student_name: studentFullName,
    student_id: profile?.student_id || "CE2026",
    student_code: profile?.student_id || "CE2026",
    internship_title: internship?.title || "Internship Program",
    course_title: internship?.title || "Internship Program",
    certificate_type: cert.type === "COMPLETION" ? "Certificate of Completion" : "Certificate of Confirmation",
    issue_date: cert.issued_at,
    duration: `${internship?.duration_months || 1} Month (Remote)`,
    status: cert.status,
    organization: template?.config?.organization || "CodeElevate Inc.",
  };

  const isRevoked = result.status === "REVOKED";
  const isValid = result.status === "ISSUED" || result.status === "VALID";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-16">
      <div className="container max-w-3xl space-y-10">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Certificate Verification
          </h1>
        </div>

        <div className={`rounded-2xl border overflow-hidden shadow-sm ${isRevoked ? "border-red-200 bg-white" : "border-emerald-200 bg-white"}`}>
          <div className={`p-5 flex items-center justify-between border-b ${isRevoked ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isRevoked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {isRevoked ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div>
                <p className={`text-sm font-bold ${isRevoked ? "text-red-900" : "text-emerald-900"}`}>
                  {isRevoked ? "Certificate Revoked" : "Certificate Verified"}
                </p>
                <p className={`text-[11px] ${isRevoked ? "text-red-600" : "text-emerald-600"}`}>
                  {isRevoked ? "This certificate is no longer valid." : "This certificate is authentic and valid."}
                </p>
              </div>
            </div>
            <Badge className={isRevoked ? "bg-red-100 text-red-700 font-bold border-red-200" : "bg-emerald-100 text-emerald-700 font-bold border-emerald-200"}>
              {isRevoked ? "✗ Invalid" : "✓ Verified"}
            </Badge>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Intern Information
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Intern Name" value={result.student_name} icon={<User className="h-3.5 w-3.5" />} />
              <InfoRow label="Student ID" value={result.student_code || result.student_id} icon={<Hash className="h-3.5 w-3.5" />} />
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                Certificate Details
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Certificate Number" value={result.certificate_number} icon={<FileText className="h-3.5 w-3.5" />} mono />
              <InfoRow label="Certificate Type" value={result.certificate_type} icon={<Award className="h-3.5 w-3.5" />} />
              <InfoRow label="Domain" value={result.internship_title || result.course_title || "—"} icon={<FileText className="h-3.5 w-3.5" />} />
              <InfoRow label="Issue Date" value={result.issue_date ? new Date(result.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }) : "—"} icon={<Calendar className="h-3.5 w-3.5" />} />
              <InfoRow label="Duration" value={result.duration} icon={<Clock className="h-3.5 w-3.5" />} />
              <InfoRow label="Status" value={isValid ? "✓ Issued" : result.status} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Issuing Authority
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Organization" value={result.organization} icon={<Building className="h-3.5 w-3.5" />} />
              <InfoRow label="Authorized By" value="CodeElevate" icon={<ShieldCheck className="h-3.5 w-3.5" />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
        {icon && <span className="text-slate-300">{icon}</span>}
        {label}
      </p>
      <p className={`text-sm font-bold text-slate-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
