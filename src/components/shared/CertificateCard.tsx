import React from "react";
import Link from "next/link";
import { Certificate } from "@/types/database";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Award, ExternalLink, ShieldCheck } from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const courseTitle =
    certificate.internship?.title ||
    certificate.course_title ||
    "Internship Completion";

  const studentName =
    certificate.profile
      ? `${certificate.profile.first_name || ""} ${certificate.profile.last_name || ""}`.trim()
      : certificate.student_name || "Verified Student";

  const issueDate = certificate.issued_at || certificate.issue_date || new Date().toISOString();
  const durationText = certificate.duration || `${certificate.internship?.duration_months || 1} Month (Remote)`;
  const verifyIdentifier = certificate.url_slug || certificate.certificate_number;

  return (
    <Card className="relative overflow-hidden rounded-2xl border-slate-200/80 bg-white transition-all hover:border-blue-200 hover:shadow-card-hover">
      {/* Decorative top accent */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />

      <CardHeader className="p-6 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Official Credential
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {courseTitle}
              </h3>
            </div>
          </div>
          <StatusBadge status={certificate.status} />
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Certificate ID</span>
            <span className="font-mono font-bold text-slate-800">{certificate.certificate_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Issue Date</span>
            <span className="font-medium text-slate-800">{formatDate(issueDate)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Recipient</span>
            <span className="font-medium text-slate-800">{studentName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Duration</span>
            <span className="font-medium text-slate-800">{durationText}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Link
          href={`/verify/${verifyIdentifier}`}
          target="_blank"
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full gap-1.5 font-semibold text-slate-700 hover:text-blue-600">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Verify Credential
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
