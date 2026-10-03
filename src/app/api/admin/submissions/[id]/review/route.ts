import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueCertificatePDF } from "@/lib/certificates/issue-certificate";
import { z } from "zod";

const reviewSubmissionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const parsed = reviewSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review parameters" },
        { status: 400 }
      );
    }

    const { status, feedback } = parsed.data;

    if (status === "REJECTED" && (!feedback || feedback.trim().length === 0)) {
      return NextResponse.json(
        { error: "Feedback is required when rejecting a submission." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Try to fetch from internship_submissions first
    const { data: internshipSub, error: intSubErr } = await supabaseAdmin
      .from("internship_submissions")
      .select(
        "*, enrollment:enrollments(*, internship:internships(*)), profile:profiles!user_id(*)"
      )
      .eq("id", submissionId)
      .maybeSingle();

    let submission: any = internshipSub;
    let isInternshipSubmission = true;

    if (!submission) {
      // Fallback to task_submissions for legacy records
      const { data: taskSub, error: taskSubErr } = await supabaseAdmin
        .from("task_submissions")
        .select(
          "*, task:tasks(*), enrollment:enrollments(*, internship:internships(*)), profile:profiles(*)"
        )
        .eq("id", submissionId)
        .maybeSingle();

      if (taskSub) {
        submission = taskSub;
        isInternshipSubmission = false;
      }
    }

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // 2. Update submission record
    const targetTable = isInternshipSubmission
      ? "internship_submissions"
      : "task_submissions";

    const { error: updateErr } = await supabaseAdmin
      .from(targetTable)
      .update({
        status,
        feedback: feedback?.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: authResult.user.id,
      })
      .eq("id", submissionId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 3. If APPROVED, complete enrollment and issue certificate
    let isCompleted = false;
    let certificateGenerated = false;

    if (status === "APPROVED") {
      const enrollmentId = submission.enrollment_id;

      // Update enrollment to COMPLETED
      await supabaseAdmin
        .from("enrollments")
        .update({
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId);

      isCompleted = true;

      // Check if certificate already exists
      const { data: existingCert } = await supabaseAdmin
        .from("certificates")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .maybeSingle();

      let certId = existingCert?.id;

      if (!certId) {
        // Fetch default template
        const { data: template } = await supabaseAdmin
          .from("certificate_templates")
          .select("id")
          .eq("is_default", true)
          .maybeSingle();

        // Generate next certificate number
        const { data: certNumData } = await supabaseAdmin.rpc(
          "next_certificate_number",
          { p_type: "COMPLETION" }
        );

        const certInfo = certNumData?.[0] || {
          certificate_number: `CE-COMP-${Date.now().toString().slice(-4)}/${new Date().getFullYear()}`,
          url_slug: `CE-COMP-${Date.now().toString().slice(-4)}-${new Date().getFullYear()}`,
        };

        const { data: newCert, error: certInsertErr } = await supabaseAdmin
          .from("certificates")
          .insert({
            certificate_number: certInfo.certificate_number,
            url_slug: certInfo.url_slug,
            user_id: submission.user_id,
            enrollment_id: enrollmentId,
            internship_id:
              submission.internship_id ||
              submission.enrollment?.internship_id,
            type: "COMPLETION",
            status: "ISSUED",
            issued_at: new Date().toISOString(),
            template_id: template?.id || null,
          })
          .select("id")
          .single();

        if (!certInsertErr && newCert) {
          certId = newCert.id;
        }
      }

      // Generate PDF if cert exists
      if (certId) {
        try {
          const pdfResult = await issueCertificatePDF(certId);
          certificateGenerated = pdfResult.success;
          if (!pdfResult.success) {
            console.error(
              "Certificate PDF generation failed:",
              pdfResult.error
            );
          }
        } catch (pdfErr) {
          console.error("Certificate PDF generation error:", pdfErr);
        }
      }
    }

    // 4. Send notification to student
    const courseTitle =
      submission.enrollment?.internship?.title || "Internship Track";

    if (status === "APPROVED") {
      await supabaseAdmin.from("notifications").insert({
        user_id: submission.user_id,
        title: "Internship Work Approved & Certified! 🎓",
        body: `Congratulations! Your final project deliverable for "${courseTitle}" has been approved. Your verified certificate has been issued.`,
        type: "CERTIFICATE",
        link: `/dashboard/certificates`,
      });
    } else {
      await supabaseAdmin.from("notifications").insert({
        user_id: submission.user_id,
        title: "Internship Submission Needs Revision 📝",
        body: `Your submission for "${courseTitle}" was reviewed. Mentor Feedback: ${feedback}`,
        type: "TASK",
        link: `/dashboard/submissions`,
      });
    }

    return NextResponse.json({
      success: true,
      status,
      isCompleted,
      certificateGenerated,
    });
  } catch (err: any) {
    console.error("Review submission error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
