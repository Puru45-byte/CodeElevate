import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCertificatePDF, CertificatePDFData } from "./generate-pdf";

/**
 * Issues a certificate for a completed enrollment:
 * 1. Fetches the certificate row + related data
 * 2. Generates the PDF
 * 3. Uploads to the 'certificates' storage bucket
 * 4. Updates the certificate row with pdf_path
 *
 * Idempotent: if pdf_path is already set, returns early.
 */
export async function issueCertificatePDF(
  certificateId: string,
  forceRegenerate = false
): Promise<{
  success: boolean;
  pdfPath?: string;
  error?: string;
}> {
  const supabaseAdmin = createAdminClient();

  // 1. Fetch certificate with all related data
  const { data: cert, error: fetchErr } = await supabaseAdmin
    .from("certificates")
    .select(
      `
      *,
      profile:profiles(first_name, last_name, student_id),
      enrollment:enrollments(start_date, end_date),
      internship:internships(title),
      template:certificate_templates(config)
    `
    )
    .eq("id", certificateId)
    .single();

  if (fetchErr || !cert) {
    console.error("Certificate fetch error:", fetchErr);
    return { success: false, error: "Certificate not found" };
  }

  // Idempotent: already has PDF (unless forceRegenerate is true)
  if (cert.pdf_path && !forceRegenerate) {
    return { success: true, pdfPath: cert.pdf_path };
  }

  // Normalize joined objects
  const profile = Array.isArray(cert.profile) ? cert.profile[0] : cert.profile;
  const enrollment = Array.isArray(cert.enrollment)
    ? cert.enrollment[0]
    : cert.enrollment;
  const internship = Array.isArray(cert.internship)
    ? cert.internship[0]
    : cert.internship;
  const template = Array.isArray(cert.template)
    ? cert.template[0]
    : cert.template;

  const studentName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "Student";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://code-elevate-mu.vercel.app";

  // 2. Build PDF data
  const pdfData: CertificatePDFData = {
    studentName,
    courseName: internship?.title || "Internship",
    certificateNumber: cert.certificate_number,
    urlSlug: cert.url_slug || cert.certificate_number,
    startDate: enrollment?.start_date || cert.issued_at,
    endDate: enrollment?.end_date || cert.issued_at,
    issuedAt: cert.issued_at,
    signatoryName:
      template?.config?.signatory_name || "Sanika Deore",
    signatoryTitle:
      template?.config?.signatory_title ||
      "Head of Academic Programs & Engineering",
    organization:
      template?.config?.organization || "CodeElevate EdTech Platform",
    tagline:
      template?.config?.tagline ||
      "Practical Internship & Career Acceleration Platform",
    signatureText: template?.config?.signature_text || "Sdeore",
    siteUrl,
  };

  // 3. Generate PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateCertificatePDF(pdfData);
  } catch (err) {
    console.error("PDF generation error:", err);
    return { success: false, error: "PDF generation failed" };
  }

  // 4. Upload to storage
  // Path: certificates/{user_id}/{url_slug}.pdf
  const storagePath = `${cert.user_id}/${cert.url_slug || cert.certificate_number.replace(/\//g, "-")}.pdf`;

  const { error: uploadErr } = await supabaseAdmin.storage
    .from("certificates")
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true, // idempotent
    });

  if (uploadErr) {
    console.error("PDF upload error:", uploadErr);
    return { success: false, error: "PDF upload failed" };
  }

  // 5. Update certificate row with pdf_path
  const { error: updateErr } = await supabaseAdmin
    .from("certificates")
    .update({ pdf_path: storagePath })
    .eq("id", certificateId);

  if (updateErr) {
    console.error("Certificate update error:", updateErr);
    return { success: false, error: "Failed to update certificate record" };
  }

  return { success: true, pdfPath: storagePath };
}

/**
 * Gets a signed download URL for a certificate PDF.
 * The signed URL is valid for 1 hour.
 */
export async function getCertificateSignedUrl(
  pdfPath: string
): Promise<string | null> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.storage
    .from("certificates")
    .createSignedUrl(pdfPath, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}
