import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { issueCertificatePDF } from "@/lib/certificates/issue-certificate";
import { z } from "zod";

const generateSchema = z.object({
  certificateId: z.string().uuid(),
});

/**
 * POST /api/certificates/generate
 * Admin-only: triggers PDF generation and upload for a given certificate row.
 * Idempotent — if PDF already exists, returns the existing path.
 */
export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "certificateId (UUID) is required" },
        { status: 400 }
      );
    }

    const result = await issueCertificatePDF(parsed.data.certificateId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Certificate generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pdfPath: result.pdfPath,
    });
  } catch (err: any) {
    console.error("Certificate generation error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
