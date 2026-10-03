import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "./notifications-list";
import { Notification } from "@/types/database";

export const metadata: Metadata = {
  title: "Notifications | CodeElevate",
  description: "View updates and announcements on your applications and submissions.",
};

export const revalidate = 0;

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/notifications");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Activity Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Notifications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay up to date on application approvals, reviews, and task deadlines.
        </p>
      </div>

      <NotificationsList initialNotifications={(notifications || []) as Notification[]} />
    </div>
  );
}
