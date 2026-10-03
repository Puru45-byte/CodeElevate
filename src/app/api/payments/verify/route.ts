import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRazorpaySignature, getRazorpayInstance } from "@/lib/razorpay";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    // 1. Verify HMAC SHA256 Signature (timing-safe)
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed." },
        { status: 400 }
      );
    }

    // 2. Fetch payment details from Razorpay to confirm captured status
    try {
      const razorpay = getRazorpayInstance();
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (
        paymentDetails.status !== "captured" &&
        paymentDetails.status !== "authorized"
      ) {
        return NextResponse.json(
          { error: `Payment is in ${paymentDetails.status} state, not captured.` },
          { status: 400 }
        );
      }
    } catch (rzpErr: any) {
      console.warn("Razorpay direct fetch warning:", rzpErr?.message);
    }

    // 3. Atomically finalize payment and create single internship submission
    const supabaseAdmin = createAdminClient();
    
    // Try finalize_internship_submission first, fallback to finalize_paid_submission
    let finalizeResult: any = null;
    let finalizeErr: any = null;

    const rpcRes1 = await supabaseAdmin.rpc("finalize_internship_submission", {
      p_order_id: razorpay_order_id,
      p_payment_id: razorpay_payment_id,
    });

    if (rpcRes1.error && rpcRes1.error.message?.includes("function") && rpcRes1.error.message?.includes("does not exist")) {
      // Fallback for transition
      const rpcRes2 = await supabaseAdmin.rpc("finalize_paid_submission", {
        p_order_id: razorpay_order_id,
        p_payment_id: razorpay_payment_id,
      });
      finalizeResult = rpcRes2.data;
      finalizeErr = rpcRes2.error;
    } else {
      finalizeResult = rpcRes1.data;
      finalizeErr = rpcRes1.error;
    }

    if (finalizeErr || (finalizeResult as any)?.error) {
      console.error("Finalize error:", finalizeErr || finalizeResult);
      return NextResponse.json(
        {
          error:
            finalizeErr?.message ||
            (finalizeResult as any)?.error ||
            "Failed to finalize submission.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: (finalizeResult as any)?.submission_id,
      paymentId: (finalizeResult as any)?.payment_id,
      attemptNo: (finalizeResult as any)?.attempt_no,
      status: "UNDER_REVIEW",
      message:
        "Internship project submitted successfully! Payment verified and submission queued for review.",
    });
  } catch (err: any) {
    console.error("Payment verification route error:", err);
    return NextResponse.json(
      { error: err.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
