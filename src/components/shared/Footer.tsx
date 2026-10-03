import React from "react";
import Link from "next/link";
import { Code2, Github, Linkedin, Twitter, ShieldCheck, Mail } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Empowering students and early-career software engineers with practical project-driven internships and verified digital credentials.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Internship Domains
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/internships/full-stack-web-development" className="hover:text-blue-600 transition-colors">
                  Full Stack Web Development
                </Link>
              </li>
              <li>
                <Link href="/internships/python-programming-ai" className="hover:text-blue-600 transition-colors">
                  Python Programming & AI
                </Link>
              </li>
              <li>
                <Link href="/internships/cloud-devops-engineering" className="hover:text-blue-600 transition-colors">
                  Cloud & DevOps Engineering
                </Link>
              </li>
              <li>
                <Link href="/internships/java-core-enterprise" className="hover:text-blue-600 transition-colors">
                  Java Core & Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Student Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/internships" className="hover:text-blue-600 transition-colors">
                  Browse All Internships
                </Link>
              </li>
              <li>
                <Link href="/my-learning" className="hover:text-blue-600 transition-colors">
                  My Learning Track
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Verification & Support
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every CodeElevate certificate features a tamper-proof cryptographic credential ID that can be verified instantly by employers worldwide.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <Mail className="h-4 w-4 text-blue-600 shrink-0" />
              <span>support@codeelevate.edu</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CodeElevate Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
            <Link href="/verify" className="hover:text-slate-600">Credential Verification</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
