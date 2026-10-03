import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import Link from "next/link";
import Image from "next/image";
import { Code2, User as UserIcon } from "lucide-react";

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch unread notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const studentName =
    profile?.first_name || profile?.full_name || user.email?.split("@")[0] || "Student";
  const studentId = profile?.student_id || "CE2026";
  const avatarUrl = profile?.photo_url || profile?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-900 hidden sm:inline text-base">
              CodeElevate
            </span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/80">
            <span>ID: {studentId}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationDropdown notifications={notifications || []} />

          {/* User Profile Mini Card */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="relative h-8 w-8 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={studentName}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {studentName}
              </p>
              <p className="text-[10px] text-slate-500 leading-none mt-1">
                Student Account
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main App Body with Sidebar */}
      <div className="flex flex-1">
        <Sidebar isAdmin={false} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
