import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const revokeSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

/**
 * POST /api/admin/certificates/[id]/revoke
 * Admin-only: revokes a certificate by updating its status and revoked_reason.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id: certificateId } = await params;
    const body = await request.json();
    const parsed = revokeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters. Reason is required." },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;
    const supabaseAdmin = createAdminClient();

    const { data: cert, error: fetchErr } = await supabaseAdmin
      .from("certificates")
      .select("id, status")
      .eq("id", certificateId)
      .single();

    if (fetchErr || !cert) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (cert.status === "REVOKED") {
      return NextResponse.json(
        { error: "Certificate is already revoked" },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("certificates")
      .update({
        status: "REVOKED",
        revoked_at: new Date().toISOString(),
        revoked_reason: reason.trim(),
      })
      .eq("id", certificateId);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Revoke certificate error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
