import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createModuleSchema = z.object({
  internship_id: z.string().uuid(),
  title: z.string().min(2, "Module title is required"),
  description: z.string().optional().nullable(),
  position: z.number().int().positive().default(1),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");

    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
      .from("internship_modules")
      .select("*, tasks:tasks(*), internship:internships(id, title)")
      .order("position", { ascending: true });

    if (internshipId) {
      query = query.eq("internship_id", internshipId);
    }

    const { data: modules, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ modules });
  } catch (err: any) {
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
    const parsed = createModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // If position not specified, set to max + 1
    let pos = parsed.data.position;
    if (!pos || pos === 1) {
      const { data: existingModules } = await supabaseAdmin
        .from("internship_modules")
        .select("position")
        .eq("internship_id", parsed.data.internship_id)
        .order("position", { ascending: false })
        .limit(1);

      if (existingModules && existingModules.length > 0) {
        pos = existingModules[0].position + 1;
      }
    }

    const { data: moduleData, error } = await supabaseAdmin
      .from("internship_modules")
      .insert({
        internship_id: parsed.data.internship_id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        position: pos,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, module: moduleData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
