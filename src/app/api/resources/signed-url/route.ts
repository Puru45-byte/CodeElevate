import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resourceId, bucketName = "task-resources" } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: "Missing resourceId" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch resource record
    const { data: resource, error: resError } = await supabaseAdmin
      .from("task_resources")
      .select("*, task:tasks(internship_id)")
      .eq("id", resourceId)
      .maybeSingle();

    let targetPath = resource?.file_path;
    let targetBucket = bucketName;

    // Fallback if resource is a plain storage path
    if (!targetPath) {
      targetPath = resourceId;
    }

    // 2. Check if student has enrollment or is admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    if (!isAdmin) {
      // Verify enrollment
      const internshipId = resource?.task?.internship_id;
      if (internshipId) {
        const { data: enrollment } = await supabaseAdmin
          .from("enrollments")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("internship_id", internshipId)
          .in("status", ["ACTIVE", "COMPLETED"])
          .maybeSingle();

        if (!enrollment) {
          return NextResponse.json(
            { error: "You must be an approved enrolled student to access this resource." },
            { status: 403 }
          );
        }
      }
    }

    // 3. Generate signed URL valid for 60 minutes
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from(targetBucket)
      .createSignedUrl(targetPath, 3600);

    if (signError || !signedData?.signedUrl) {
      // If signed url fails because file is in another bucket or direct link, return error or fallback
      return NextResponse.json(
        { error: signError?.message || "Failed to generate download link" },
        { status: 404 }
      );
    }

    return NextResponse.json({ signedUrl: signedData.signedUrl });
  } catch (err: any) {
    console.error("Resource signed url error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
