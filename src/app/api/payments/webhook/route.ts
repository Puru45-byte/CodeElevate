import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Webhook secret not configured." },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      console.error("Invalid Razorpay webhook signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabaseAdmin = createAdminClient();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        const orderId = payment?.order_id;
        const paymentId = payment?.id;

        if (orderId && paymentId) {
          // Atomically finalize payment and create submission (Idempotent)
          await supabaseAdmin.rpc("finalize_paid_submission", {
            p_order_id: orderId,
            p_payment_id: paymentId,
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        const orderId = payment?.order_id;
        const failureReason =
          payment?.error_description || payment?.error_reason || "Payment failed";

        if (orderId) {
          await supabaseAdmin
            .from("payments")
            .update({
              status: "FAILED",
              failure_reason: failureReason,
            })
            .eq("razorpay_order_id", orderId);
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Razorpay webhook handler error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
