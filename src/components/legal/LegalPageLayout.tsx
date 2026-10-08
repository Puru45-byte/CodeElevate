import React from "react";
import Link from "next/link";
import { business } from "@/config/business";
import { LegalPrintButton } from "./LegalPrintButton";
import { LegalSection } from "./LegalSection";
import {
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  HelpCircle,
  ArrowRight,
  FileText,
  Lock,
  RotateCcw,
  Truck,
  Cookie,
  Building2,
} from "lucide-react";

export { LegalSection };

export interface TocItem {
  id: string;
  title: string;
}

export interface LegalPageLayoutProps {
  title: string;
  intro?: string;
  badge?: string;
  toc?: TocItem[];
  children: React.ReactNode;
  activeRoute?: "/terms" | "/privacy" | "/refund-policy" | "/shipping-policy" | "/contact" | "/cookies";
}

export function LegalPageLayout({
  title,
  intro,
  badge = "Legal & Compliance",
  toc = [],
  children,
  activeRoute,
}: LegalPageLayoutProps) {
  const legalLinks = [
    { href: "/terms", label: "Terms & Conditions", icon: FileText },
    { href: "/privacy", label: "Privacy Policy", icon: Lock },
    { href: "/cookies", label: "Cookie Policy", icon: Cookie },
    { href: "/refund-policy", label: "Refund & Cancellation", icon: RotateCcw },
    { href: "/shipping-policy", label: "Shipping & Delivery", icon: Truck },
    { href: "/contact", label: "Contact & Grievances", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 print:bg-white text-slate-900">
      {/* Print-only official header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6 text-xs text-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{business.brandName}</h1>
            <p className="text-slate-600">Legal Entity: {business.legalName}</p>
            <p className="text-slate-600">Official Portal: {business.domain}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900">{title}</p>
            <p>Last Updated: {business.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-slate-200/80 bg-white print:hidden">
        <div className="container max-w-5xl py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                {title}
              </h1>
              {intro && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {intro}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  Last updated:{" "}
                  <strong className="font-semibold text-slate-900">
                    {business.lastUpdated}
                  </strong>
                </span>
              </div>
              <LegalPrintButton />
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container max-w-5xl py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sidebar on desktop if items exist) */}
          {toc.length > 0 && (
            <aside className="lg:col-span-4 print:hidden">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Table of Contents
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jump to section
                  </p>
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {toc.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="group flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <span className="text-[11px] font-mono text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                      </span>
                      <span className="leading-snug">{item.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Document Content Area */}
          <main
            className={`${
              toc.length > 0 ? "lg:col-span-8" : "lg:col-span-12"
            } space-y-8 print:col-span-12`}
          >
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed print:border-none print:shadow-none print:p-0 print:text-black">
              {children}
            </article>

            {/* Questions? Contact us Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-6 sm:p-8 shadow-sm space-y-4 print:hidden">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Questions? Contact us
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Have questions regarding our policies, internship submissions, or certifications? Our support team and Grievance Officer are here to assist you.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 font-medium">Email Support</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {business.supportEmail}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 font-medium">Helpline / Support</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {business.supportPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 text-xs">
                <span className="text-slate-500">
                  Hours: {business.supportHours}
                </span>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>View Official Business & Grievance Information</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Legal Links Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 print:hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                CodeElevate Legal Center
              </h4>
              <div className="flex flex-wrap gap-2">
                {legalLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeRoute === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                          : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
