import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileCheck,
  CheckCircle2,
  Code2,
  GitBranch,
  CreditCard,
  Award,
  ArrowRight,
  BookOpen,
  Users,
  Globe,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | CodeElevate",
  description:
    "Learn how CodeElevate works — a simple 7-step journey from choosing a domain to earning your verified certificate.",
};

const STEPS = [
  {
    num: "01",
    title: "Browse & Choose Your Domain",
    desc: "Explore 12+ internship tracks across web development, AI/ML, cloud, data science, cybersecurity and more. Read the full curriculum, review the tech stack, and pick the domain that matches your career goals.",
    icon: Search,
    color: "bg-blue-50 text-blue-600",
    highlight: "bg-blue-600",
  },
  {
    num: "02",
    title: "Apply for the Internship",
    desc: "Fill in your profile details — name, college, department, and preferred dates. Your application is reviewed by the CodeElevate team, typically within 24 hours.",
    icon: FileCheck,
    color: "bg-indigo-50 text-indigo-600",
    highlight: "bg-indigo-600",
  },
  {
    num: "03",
    title: "Get Approved & Access Curriculum",
    desc: "Once approved, you receive an acceptance notification. Your dashboard unlocks the full module-wise curriculum, downloadable resources (PPTs, PDFs), and your task timeline.",
    icon: CheckCircle2,
    color: "bg-violet-50 text-violet-600",
    highlight: "bg-violet-600",
  },
  {
    num: "04",
    title: "Build Tasks on Your Local Machine",
    desc: "Work through progressive milestones using your own code editor, IDE, and development tools. Each task has clear requirements, a deadline, and expected deliverables.",
    icon: Code2,
    color: "bg-cyan-50 text-cyan-600",
    highlight: "bg-cyan-600",
  },
  {
    num: "05",
    title: "Push Your Code to GitHub",
    desc: "Create a public GitHub repository for each task. Push your code, add a README file, and copy the repository URL to your CodeElevate dashboard for submission.",
    icon: GitBranch,
    color: "bg-teal-50 text-teal-600",
    highlight: "bg-teal-600",
  },
  {
    num: "06",
    title: "Review & Get Expert Feedback",
    desc: "Submit your task with a small per-task review fee. Our expert mentors review your code for correctness, quality, and best practices — and provide actionable feedback.",
    icon: CreditCard,
    color: "bg-amber-50 text-amber-600",
    highlight: "bg-amber-600",
  },
  {
    num: "07",
    title: "Complete All Tasks & Get Certified",
    desc: "Once all required milestones are approved, your verified certificate is automatically generated. It includes a unique credential ID, QR code, and is publicly verifiable by any employer.",
    icon: Award,
    color: "bg-emerald-50 text-emerald-600",
    highlight: "bg-emerald-600",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/60 via-white to-white py-14 md:py-20 border-b border-slate-100">
        <div className="container text-center max-w-3xl space-y-5">
          <Badge variant="default" className="bg-blue-50 text-blue-700 font-bold border-blue-200">
            Your Learning Journey
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How CodeElevate Works
          </h1>
          <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
            A transparent, production-style workflow designed for aspiring software developers. From application to certification — here&apos;s every step.
          </p>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-14 md:py-20">
        <div className="container max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-emerald-300 hidden md:block" />

            <div className="space-y-10">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="relative flex items-start gap-6 md:gap-8"
                >
                  {/* Number circle */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.highlight} text-white font-black text-sm shadow-lg`}
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${step.color}`}
                      >
                        <step.icon className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="py-14 md:py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="container max-w-4xl">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Students Choose CodeElevate
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookOpen,
                title: "Structured Curriculum",
                desc: "Week-by-week modules with progressive difficulty.",
              },
              {
                icon: Users,
                title: "Expert Mentors",
                desc: "Industry professionals review every submission.",
              },
              {
                icon: Globe,
                title: "100% Remote",
                desc: "Self-paced learning from anywhere, anytime.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Credentials",
                desc: "Tamper-proof certificates recognized by employers.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-2 text-center hover:shadow-card-hover transition-all duration-300"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base text-blue-100 leading-relaxed">
            Browse our internship tracks and apply today. Your certificate is just 7 steps away.
          </p>
          <Link href="/internships">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg gap-2"
            >
              Explore Internships
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
