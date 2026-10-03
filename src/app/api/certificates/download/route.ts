import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCertificateSignedUrl } from "@/lib/certificates/issue-certificate";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/certificates/download?id=<certificate_id>
 * Authenticated students can download their own certificate PDF.
 * Returns a redirect to a signed Supabase Storage URL.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("id");

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Verify the requesting user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch certificate and verify ownership
    const supabaseAdmin = createAdminClient();
    const { data: cert, error: fetchErr } = await supabaseAdmin
      .from("certificates")
      .select("id, user_id, pdf_path, certificate_number, url_slug")
      .eq("id", certificateId)
      .single();

    if (fetchErr || !cert) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check ownership: user must own the cert OR be admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    if (cert.user_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!cert.pdf_path) {
      return NextResponse.json(
        { error: "PDF has not been generated yet" },
        { status: 404 }
      );
    }

    const signedUrl = await getCertificateSignedUrl(cert.pdf_path);
    if (!signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signedUrl);
  } catch (err: any) {
    console.error("Certificate download error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
