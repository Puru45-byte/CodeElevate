import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicCertificateVerification } from "@/types/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateNumber: string }> }
) {
  try {
    const { certificateNumber } = await params;
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
      .or(`certificate_number.eq.${certificateNumber.trim()},url_slug.eq.${certificateNumber.trim()}`)
      .maybeSingle();

    if (error || !cert) {
      return NextResponse.json(
        { error: "Certificate not found or invalid credential ID" },
        { status: 404 }
      );
    }

    const profile = Array.isArray(cert.profile) ? cert.profile[0] : cert.profile;
    const internship = Array.isArray(cert.internship) ? cert.internship[0] : cert.internship;
    const template = Array.isArray(cert.template) ? cert.template[0] : cert.template;

    const studentFullName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Student"
      : "Student";

    // Strictly return only non-sensitive public fields
    const publicVerificationData: PublicCertificateVerification = {
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

    return NextResponse.json(publicVerificationData);
  } catch (err: any) {
    console.error("Certificate verification error:", err);
    return NextResponse.json(
      { error: "Verification lookup failed" },
      { status: 500 }
    );
  }
}
