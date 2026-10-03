import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateInternshipSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  short_description: z.string().optional().nullable(),
  category: z
    .enum([
      "Development",
      "AI/ML",
      "Cloud",
      "Data",
      "Cyber Security",
      "Design",
      "Other",
    ])
    .optional(),
  icon_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional(),
  duration_months: z.number().int().positive().optional(),
  is_free: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { data: internship, error } = await supabaseAdmin
      .from("internships")
      .select(
        "*, modules:internship_modules(*), tasks:tasks(*)"
      )
      .eq("id", id)
      .single();

    if (error || !internship) {
      return NextResponse.json(
        { error: "Internship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ internship });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateInternshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    if (parsed.data.slug) {
      const { data: existing } = await supabaseAdmin
        .from("internships")
        .select("id")
        .eq("slug", parsed.data.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "An internship with this URL slug already exists." },
          { status: 400 }
        );
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from("internships")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, internship: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("internships")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Internship deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
