import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationsManager } from "./notifications-manager";

export const revalidate = 0;

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: notifications } = await supabaseAdmin
    .from("notifications")
    .select(
      `
      *,
      profile:profiles(first_name, last_name, email, student_id)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <NotificationsManager initialNotifications={notifications || []} />
  );
}
