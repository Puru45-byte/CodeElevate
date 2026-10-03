import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    // Basic protection using CRON_SECRET from environment (set in Vercel)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const today = new Date();
    
    // 1. Mark enrollments as EXPIRED if their end_date is past and they are still ACTIVE
    const { data: expiredEnrollments, error: expErr } = await supabaseAdmin
      .from("enrollments")
      .select("id, user_id, internship:internships(title)")
      .eq("status", "ACTIVE")
      .lt("end_date", today.toISOString().split("T")[0]);

    if (!expErr && expiredEnrollments && expiredEnrollments.length > 0) {
      const expiredIds = expiredEnrollments.map((e) => e.id);
      
      // Update status
      await supabaseAdmin
        .from("enrollments")
        .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
        .in("id", expiredIds);
        
      // Notify users
      const notifications = expiredEnrollments.map((e: any) => {
        const title = Array.isArray(e.internship) ? e.internship[0]?.title : e.internship?.title;
        return {
          user_id: e.user_id,
          title: "Internship Expired",
          body: `Your time for the "${title || "Internship"}" has expired.`,
          type: "SYSTEM",
          link: `/dashboard/learning`,
        };
      });
      await supabaseAdmin.from("notifications").insert(notifications);
    }

    // 2. Nearing completion notices (3 days before end date)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const targetDateStr = threeDaysFromNow.toISOString().split("T")[0];

    const { data: nearingEnrollments, error: nearErr } = await supabaseAdmin
      .from("enrollments")
      .select("id, user_id, internship:internships(title)")
      .eq("status", "ACTIVE")
      .eq("end_date", targetDateStr);

    if (!nearErr && nearingEnrollments && nearingEnrollments.length > 0) {
      const notifications = nearingEnrollments.map((e: any) => {
        const title = Array.isArray(e.internship) ? e.internship[0]?.title : e.internship?.title;
        return {
          user_id: e.user_id,
          title: "Internship Ending Soon ⏳",
          body: `You have 3 days left to complete your milestone tasks for "${title || "Internship"}".`,
          type: "SYSTEM",
          link: `/dashboard/learning`,
        };
      });
      await supabaseAdmin.from("notifications").insert(notifications);
    }

    return NextResponse.json({
      success: true,
      expiredProcessed: expiredEnrollments?.length || 0,
      nearingProcessed: nearingEnrollments?.length || 0,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
