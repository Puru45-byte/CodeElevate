import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayInstance } from "@/lib/razorpay";
import {
  SUBMISSION_FEE_PAISE,
  PAYMENT_CURRENCY,
  REQUIRE_PAYMENT_ON_RESUBMIT,
} from "@/lib/constants";
import { z } from "zod";

// GitHub repository URL regex: https://github.com/{owner}/{repo} (optional trailing slash or .git)
const githubRepoRegex =
  /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/|\.git)?$/;

const createOrderSchema = z.object({
  enrollmentId: z.string().uuid("Invalid enrollment ID").optional(),
  taskId: z.string().uuid("Invalid task ID").optional(),
  githubUrl: z
    .string()
    .trim()
    .regex(
      githubRepoRegex,
      "Must be a valid GitHub repository URL (e.g. https://github.com/username/project)"
    ),
  comments: z
    .string()
    .max(500, "Comments cannot exceed 500 characters")
    .optional()
    .nullable(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the Terms & Conditions and Refund Policy to proceed.",
    }),
  }),
});

export async function POST(request: Request) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit your work." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg =
        parsed.error.errors[0]?.message || "Invalid submission parameters";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { enrollmentId: rawEnrollmentId, taskId, githubUrl, comments } = parsed.data;
    const supabaseAdmin = createAdminClient();

    let enrollmentId = rawEnrollmentId;

    // If taskId is passed instead of enrollmentId, resolve the user's active enrollment for that task's internship
    if (!enrollmentId && taskId) {
      const { data: task } = await supabaseAdmin
        .from("tasks")
        .select("internship_id")
        .eq("id", taskId)
        .maybeSingle();

      if (task) {
        const { data: enr } = await supabaseAdmin
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("internship_id", task.internship_id)
          .eq("status", "ACTIVE")
          .maybeSingle();
        enrollmentId = enr?.id;
      }
    }

    if (!enrollmentId) {
      // Find the user's active enrollment
      const { data: enr } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      enrollmentId = enr?.id;
    }

    if (!enrollmentId) {
      return NextResponse.json(
        {
          error:
            "Active enrollment required. You do not have an active internship batch.",
        },
        { status: 403 }
      );
    }

    // 1. Fetch enrollment details & verify ownership
    const { data: enrollment, error: enrErr } = await supabaseAdmin
      .from("enrollments")
      .select("id, status, internship_id, internship:internships(id, title)")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (enrErr || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found or unauthorized." },
        { status: 403 }
      );
    }

    // 2. Check current submission status in internship_submissions (or fallback task_submissions)
    const { data: prevSubmissions } = await supabaseAdmin
      .from("internship_submissions")
      .select("id, status, attempt_no")
      .eq("enrollment_id", enrollment.id)
      .order("attempt_no", { ascending: false });

    const latestSubmission = prevSubmissions?.[0];

    if (latestSubmission?.status === "UNDER_REVIEW") {
      return NextResponse.json(
        {
          error:
            "You already have an internship submission under review. Please wait for mentor feedback.",
        },
        { status: 400 }
      );
    }

    if (latestSubmission?.status === "APPROVED") {
      return NextResponse.json(
        {
          error:
            "Your internship work has already been approved and certified.",
        },
        { status: 400 }
      );
    }

    const isResubmission = latestSubmission?.status === "REJECTED";
    const nextAttemptNo = (latestSubmission?.attempt_no || 0) + 1;
    const internshipTitle = (enrollment.internship as any)?.title || "Internship";

    // 3. Handle Free Resubmission if configured
    if (isResubmission && !REQUIRE_PAYMENT_ON_RESUBMIT) {
      const { data: newSubmission, error: subErr } = await supabaseAdmin
        .from("internship_submissions")
        .insert({
          enrollment_id: enrollment.id,
          user_id: user.id,
          internship_id: enrollment.internship_id,
          github_url: githubUrl,
          comments: comments || null,
          status: "UNDER_REVIEW",
          attempt_no: nextAttemptNo,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subErr) {
        return NextResponse.json({ error: subErr.message }, { status: 500 });
      }

      // Notify student
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        title: "Internship Work Resubmitted 🚀",
        body: `Your resubmission for "${internshipTitle}" (Attempt #${nextAttemptNo}) has been queued for mentor review.`,
        type: "TASK",
        link: "/dashboard/submissions",
      });

      return NextResponse.json({
        freeSubmission: true,
        submissionId: newSubmission.id,
        status: "UNDER_REVIEW",
        message: "Resubmission queued for review without additional payment.",
      });
    }

    // 4. Razorpay Payment Flow
    // Check if open CREATED/PENDING payment exists for this enrollment
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("enrollment_id", enrollment.id)
      .in("status", ["CREATED", "PENDING"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const razorpay = getRazorpayInstance();
    let razorpayOrderId: string;

    if (existingPayment?.razorpay_order_id) {
      razorpayOrderId = existingPayment.razorpay_order_id;
      await supabaseAdmin
        .from("payments")
        .update({
          github_url: githubUrl,
          comments: comments || null,
        })
        .eq("id", existingPayment.id);
    } else {
      const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${user.id.slice(0, 4)}`;
      const order = await razorpay.orders.create({
        amount: SUBMISSION_FEE_PAISE,
        currency: PAYMENT_CURRENCY,
        receipt: receiptId,
        notes: {
          user_id: user.id,
          enrollment_id: enrollment.id,
          attempt_no: String(nextAttemptNo),
        },
      });

      razorpayOrderId = order.id;

      // Insert payments row
      const { error: insertPayErr } = await supabaseAdmin
        .from("payments")
        .insert({
          user_id: user.id,
          enrollment_id: enrollment.id,
          task_id: null,
          razorpay_order_id: razorpayOrderId,
          amount_paise: SUBMISSION_FEE_PAISE,
          currency: PAYMENT_CURRENCY,
          status: "CREATED",
          github_url: githubUrl,
          comments: comments || null,
        });

      if (insertPayErr) {
        return NextResponse.json(
          { error: insertPayErr.message },
          { status: 500 }
        );
      }
    }

    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name, phone, email")
      .eq("id", user.id)
      .maybeSingle();

    const fullName =
      (userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim()
        : null) ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";
    const phone = userProfile?.phone || user.user_metadata?.phone || "";

    return NextResponse.json({
      freeSubmission: false,
      orderId: razorpayOrderId,
      amount: SUBMISSION_FEE_PAISE,
      currency: PAYMENT_CURRENCY,
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        "",
      user: {
        name: fullName,
        email: userProfile?.email || user.email,
        phone: phone,
      },
    });
  } catch (err: any) {
    console.error("Create payment order error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
