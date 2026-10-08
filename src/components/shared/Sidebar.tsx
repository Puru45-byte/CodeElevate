"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  User,
  Shield,
  CheckSquare,
  Layers,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Applications", href: "/dashboard/applications", icon: FileText },
    { label: "My Learning", href: "/dashboard/learning", icon: BookOpen },
    { label: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { label: "My Submissions", href: "/dashboard/submissions", icon: Layers },
    { label: "My Certificates", href: "/dashboard/certificates", icon: Award },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Students", href: "/admin/students", icon: User },
    { label: "Internships", href: "/admin/internships", icon: BookOpen },
    { label: "Modules", href: "/admin/modules", icon: Layers },
    { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { label: "Submissions", href: "/admin/submissions", icon: CheckSquare },
    { label: "Payments", href: "/admin/payments", icon: Layers },
    { label: "Inquiries & Support", href: "/admin/messages", icon: MessageSquare },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Certificate Templates", href: "/admin/templates", icon: Award },
    { label: "Notifications", href: "/admin/notifications", icon: Sparkles },
    { label: "Settings", href: "/admin/settings", icon: Shield },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {isAdmin ? "Admin Console" : "Student Portal"}
            </span>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" &&
                  link.href !== "/admin" &&
                  pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {!isAdmin && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 border border-blue-100/80">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Need More Tracks?</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Explore other domain internships to expand your project portfolio.
            </p>
            <Link
              href="/internships"
              className="inline-block text-xs font-bold text-blue-600 hover:underline"
            >
              Browse Internships →
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
