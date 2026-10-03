import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const internshipSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  short_description: z.string().optional().nullable(),
  category: z.enum([
    "Development",
    "AI/ML",
    "Cloud",
    "Data",
    "Cyber Security",
    "Design",
    "Other",
  ]),
  icon_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  technologies: z.array(z.string()).default([]),
  duration_months: z.number().int().positive().default(1),
  is_free: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const supabaseAdmin = createAdminClient();
    const { data: internships, error } = await supabaseAdmin
      .from("internships")
      .select(
        "*, modules:internship_modules(id, title, position), tasks:tasks(id, title, is_required)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ internships });
  } catch (err: any) {
    console.error("GET internships error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const body = await request.json();
    const parsed = internshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("internships")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An internship with this URL slug already exists." },
        { status: 400 }
      );
    }

    const { data: internship, error } = await supabaseAdmin
      .from("internships")
      .insert({
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, internship }, { status: 201 });
  } catch (err: any) {
    console.error("POST internship error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
