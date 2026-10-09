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

    const targetBucket = bucketName;
    const supabaseAdmin = createAdminClient();

    // 1. Fetch resource record
    const { data: resource } = await supabaseAdmin
      .from("task_resources")
      .select("*, task:tasks(internship_id)")
      .eq("id", resourceId)
      .maybeSingle();

    // Check if external link or http URL
    const externalLink = resource?.external_url || resource?.url;
    if (externalLink && (externalLink.startsWith("http://") || externalLink.startsWith("https://"))) {
      return NextResponse.json({ signedUrl: externalLink });
    }

    let targetPath = resource?.file_path || resourceId;

    if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
      return NextResponse.json({ signedUrl: targetPath });
    }

    // Clean bucket prefix if present
    if (targetPath.startsWith("task-resources/")) {
      targetPath = targetPath.replace(/^task-resources\//, "");
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
      // If path is a public URL fallback
      if (targetPath.includes("/")) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(targetBucket)
          .getPublicUrl(targetPath);
        if (publicUrlData?.publicUrl) {
          return NextResponse.json({ signedUrl: publicUrlData.publicUrl });
        }
      }

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
