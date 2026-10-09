import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { issueCertificatePDF } from "@/lib/certificates/issue-certificate";
import { z } from "zod";

const generateSchema = z.object({
  certificateId: z.string().uuid(),
  forceRegenerate: z.boolean().optional().default(true),
});

/**
 * POST /api/certificates/generate
 * Admin-only: triggers PDF generation and upload for a given certificate row.
 * Default forceRegenerate=true overwrites any existing PDF with the updated template design.
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

    const result = await issueCertificatePDF(
      parsed.data.certificateId,
      parsed.data.forceRegenerate
    );

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
