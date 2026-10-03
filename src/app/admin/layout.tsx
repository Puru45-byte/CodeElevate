import React from "react";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { Sidebar } from "@/components/shared/Sidebar";
import { Code2, ShieldAlert, User as UserIcon, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  const adminName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    profile?.full_name ||
    user.email?.split("@")[0] ||
    "Administrator";

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-slate-900 text-base leading-none block">
                CodeElevate
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold py-0.5 px-2.5">
            Admin Mode
          </Badge>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors hidden md:inline"
          >
            Switch to Student View →
          </Link>

          <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
              {profile?.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={adminName}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {adminName}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold leading-none mt-0.5">
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body with Sidebar */}
      <div className="flex flex-1">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
