import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateTemplateSchema = z.object({
  signatory_name: z.string().optional(),
  signatory_title: z.string().optional(),
  organization: z.string().optional(),
  tagline: z.string().optional(),
  signature_text: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id: templateId } = await params;
    const body = await request.json();
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid configuration payload" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Fetch existing template config
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("certificate_templates")
      .select("config")
      .eq("id", templateId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updatedConfig = {
      ...(existing.config || {}),
      ...parsed.data,
    };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("certificate_templates")
      .update({ config: updatedConfig })
      .eq("id", templateId)
      .select()
      .single();

    if (updateErr) {
      console.error("Template update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update template config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: updated,
    });
  } catch (err: any) {
    console.error("Template API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
