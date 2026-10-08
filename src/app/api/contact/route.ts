export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { contactFormSchema } from "@/lib/validations/contact";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactMessageEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. IP extraction & hashing for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(rawIp + "contact_salt_2026").digest("hex");

    // 2. Rate limit: Max 5 inquiries per hour per IP hash
    const isAllowed = rateLimit(ipHash, 5, 60 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Too many messages sent. Please wait a while before sending another inquiry, or email us directly.",
        },
        { status: 429 }
      );
    }

    // 3. Body validation with Zod
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { error: firstError || "Invalid form data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 4. Honeypot check: If bot filled the hidden website_hp field, silently return success
    if (data.website_hp && data.website_hp.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: "Thanks, we have received your message. We usually reply within 1-2 working days.",
      });
    }

    // 5. Optional user session check
    let userId: string | null = null;
    try {
      const supabaseUser = await createClient();
      const {
        data: { user },
      } = await supabaseUser.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Ignore user resolution errors for anonymous submitters
    }

    // 6. Save message to database using admin client
    const supabaseAdmin = createAdminClient();
    const { error: insertError } = await supabaseAdmin.from("contact_messages").insert({
      user_id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      topic: data.topic,
      message: data.message,
      payment_id_ref: data.paymentIdRef || null,
      status: "NEW",
      ip_hash: ipHash,
    });

    if (insertError) {
      console.error("[CONTACT_API] Error inserting contact message:", insertError);
      return NextResponse.json(
        { error: "Unable to save your message right now. Please try again or email us directly." },
        { status: 500 }
      );
    }

    // 7. Send notification email via Resend
    try {
      await sendContactMessageEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        topic: data.topic,
        message: data.message,
        paymentIdRef: data.paymentIdRef,
      });
    } catch (emailErr) {
      // Email failed but message is saved to DB — don't fail the request
      console.error("[CONTACT_API] Email notification failed (message saved to DB):", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thanks, we have received your message. We usually reply within 1-2 working days.",
    });
  } catch (err: unknown) {
    console.error("[CONTACT_API_EXCEPTION]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
