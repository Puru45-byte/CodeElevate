import React from "react";
import Link from "next/link";
import {
  Code2,
  Github,
  Linkedin,
  Twitter,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { APP_TAGLINE } from "@/lib/constants";
import { business } from "@/config/business";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white print:hidden">
      <div className="container max-w-7xl py-12 md:py-16">
        {/* Top 4 Columns Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand Info & Support */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                {business.brandName}
              </span>
            </Link>
            <p className="text-xs text-slate-500 font-medium">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empowering students and early-career software engineers with practical project-driven internships and verified digital credentials.
            </p>

            {/* Support Details from business.ts */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{business.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{business.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{business.supportHours}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Internships */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Internships
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/internships"
                  className="hover:text-blue-600 transition-colors"
                >
                  Browse Internships
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-blue-600 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verify Certificate</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Student Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Student Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/login"
                  className="hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/certificates"
                  className="hover:text-blue-600 transition-colors"
                >
                  My Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/about"
                  className="hover:text-blue-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-blue-600 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Shipping & Delivery Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright and Legal Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-500">
          <p>
            © {currentYear} {business.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-blue-600 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-blue-600 transition-colors">
              Refund & Cancellation
            </Link>
            <Link href="/shipping-policy" className="hover:text-blue-600 transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact & Grievances
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
