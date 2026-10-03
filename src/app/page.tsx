import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/shared/CourseCard";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Code2,
  GitBranch,
  CreditCard,
  FileCheck,
  BookOpen,
  Users,
  Layers,
  Search,
  PlayCircle,
} from "lucide-react";
import { Internship } from "@/types/database";
import { DOMAIN_ICONS, DOMAIN_CATEGORIES } from "@/lib/constants";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: coursesData } = await supabase
    .from("internships")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: true });

  const courses: Internship[] = coursesData || [];

  // Unique categories if needed in future
  // const categories = Array.from(new Set(courses.map((c) => c.category || "Development")));

  return (
    <div className="flex flex-col min-h-screen">
      {/* ───────────────────────── 1. HERO SECTION ───────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white py-16 md:py-24 border-b border-slate-100">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-100/20 blur-3xl pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>FREE INTERNSHIPS WITH CERTIFICATE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Learn. Build.{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Get Certified.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Join industry-focused internships with real-world projects, practical tasks and verified certificates.
              </p>

              {/* Feature bullets */}
              <ul className="hidden lg:flex flex-col gap-2 text-sm text-slate-600 max-w-md">
                {[
                  "Practical Projects",
                  "Expert Guided Tasks",
                  "Verified Certificate",
                  "100% Online",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/internships" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-base font-bold shadow-lg shadow-blue-500/25"
                  >
                    <span>Explore Internships</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-base font-semibold text-slate-700 hover:text-blue-600"
                  >
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    <span>Watch Demo</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-slate-200/60 transition-transform duration-500 hover:scale-[1.02]">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 relative aspect-[4/3]">
                  <Image
                    src="/images/hero.png"
                    alt="CodeElevate Platform Preview"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Verifiable Credentials
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Recognized by top tech recruiters
                    </p>
                  </div>
                </div>

                {/* Build Your Future badge */}
                <div className="absolute -top-3 -right-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2.5 shadow-lg text-white text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider">Build Your Future</p>
                  <p className="text-[10px] font-medium opacity-80">CodeElevate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── 2. STATS STRIP ───────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Layers, value: "12+", label: "Domains" },
              { icon: Clock, value: "1 Month", label: "Internship" },
              { icon: Code2, value: "Practical", label: "Tasks" },
              { icon: Award, value: "Verified", label: "Certificate" },
              { icon: Globe, value: "Remote", label: "Learning" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 justify-center lg:justify-start"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 3. PLATFORM BENEFITS ───────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="default" className="bg-blue-50 text-blue-700 font-bold border-blue-200">
              Why CodeElevate
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A Complete Practical Learning Platform
            </h2>
            <p className="text-sm text-slate-500">
              Everything you need to go from learning to building a portfolio that impresses employers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: "Real-World Projects",
                desc: "Work on practical milestones that mirror actual engineering challenges at tech companies.",
                color: "blue",
              },
              {
                icon: GitBranch,
                title: "GitHub Portfolio",
                desc: "Push your code to GitHub and build a verified portfolio that showcases your engineering ability.",
                color: "indigo",
              },
              {
                icon: Award,
                title: "Verified Certificates",
                desc: "Earn tamper-proof digital certificates with a unique credential ID verifiable by any employer.",
                color: "emerald",
              },
              {
                icon: BookOpen,
                title: "Structured Curriculum",
                desc: "Follow a carefully designed week-by-week curriculum with progressive difficulty levels.",
                color: "violet",
              },
              {
                icon: Users,
                title: "Expert Review",
                desc: "Every task submission is reviewed by experienced mentors who provide actionable feedback.",
                color: "amber",
              },
              {
                icon: Globe,
                title: "100% Remote & Flexible",
                desc: "Learn at your own pace from anywhere. No commute, no fixed schedule, just focused learning.",
                color: "cyan",
              },
            ].map((benefit) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-50 text-blue-600",
                indigo: "bg-indigo-50 text-indigo-600",
                emerald: "bg-emerald-50 text-emerald-600",
                violet: "bg-violet-50 text-violet-600",
                amber: "bg-amber-50 text-amber-600",
                cyan: "bg-cyan-50 text-cyan-600",
              };
              return (
                <div
                  key={benefit.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 space-y-3"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      colorMap[benefit.color]
                    } transition-transform duration-300 group-hover:scale-110`}
                  >
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 4. POPULAR INTERNSHIPS ───────────────────────── */}
      <section className="py-16 md:py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="container space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge
                variant="default"
                className="bg-blue-50 text-blue-700 font-bold"
              >
                Featured Programs
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore 1-Month Internship Tracks
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">
                Choose your focus domain. Gain practical skills through milestones, test your solutions, and build a competitive GitHub portfolio.
              </p>
            </div>
            <Link href="/internships">
              <Button
                variant="outline"
                className="gap-1.5 font-semibold text-slate-700"
              >
                <span>View All Tracks</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 5. HOW IT WORKS (7 Steps) ───────────────────────── */}
      <section
        id="how-it-works"
        className="py-16 md:py-20 bg-white"
      >
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="secondary" className="font-bold">
              Simple 7-Step Journey
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How CodeElevate Works
            </h2>
            <p className="text-sm text-slate-500">
              A transparent, production-style learning workflow designed for aspiring software developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: "01",
                title: "Browse & Choose",
                desc: "Explore internship tracks across 12+ domains. Find the one that matches your career goals.",
                icon: Search,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "02",
                title: "Apply for a Track",
                desc: "Submit your profile and select your preferred start date. Applications are reviewed within 24 hours.",
                icon: FileCheck,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "03",
                title: "Get Approved",
                desc: "Receive your acceptance letter and get instant access to the structured curriculum and resources.",
                icon: CheckCircle2,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "04",
                title: "Build Tasks Locally",
                desc: "Work on progressive milestones using your local development environment and favorite tools.",
                icon: Code2,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "05",
                title: "Push Code to GitHub",
                desc: "Submit your public GitHub repository URL for each task. Code is reviewed by expert mentors.",
                icon: GitBranch,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "06",
                title: "Get Reviewed",
                desc: "Pay a small per-task review fee. Your code is assessed for correctness, quality, and best practices.",
                icon: CreditCard,
                color: "bg-blue-50 text-blue-700",
              },
              {
                num: "07",
                title: "Get Certified",
                desc: "Complete all milestones and receive a globally verifiable certificate with a unique credential ID.",
                icon: Award,
                color: "bg-emerald-50 text-emerald-700",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3 hover:shadow-card-hover hover:border-blue-200 transition-all duration-300"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.color} font-black text-sm`}
                >
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 6. DOMAINS GRID ───────────────────────── */}
      <section className="py-16 md:py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="default" className="bg-blue-50 text-blue-700 font-bold border-blue-200">
              Explore Domains
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Internships Across Popular Tech Domains
            </h2>
            <p className="text-sm text-slate-500">
              From web development to cybersecurity — find the domain that aligns with your passion and career path.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DOMAIN_CATEGORIES.map((domain) => {
              const iconSrc =
                DOMAIN_ICONS[domain] || DOMAIN_ICONS.default;
              const courseCount = courses.filter(
                (c) => c.category === domain
              ).length;
              return (
                <Link
                  key={domain}
                  href={`/internships?category=${encodeURIComponent(domain)}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80 p-2.5 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={iconSrc}
                      alt={domain}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {domain}
                    </p>
                    {courseCount > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {courseCount} Track{courseCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 7. CERTIFICATE VERIFICATION ───────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 p-8 md:p-12 overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tamper-Proof Verification
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verify Any Certificate Instantly
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                  Every CodeElevate certificate features a unique credential ID that can be verified instantly by employers, universities, and recruitment platforms worldwide.
                </p>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unique Certificate Number (e.g. CE-COMP-0001/2026)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Student name, domain, duration & issue date displayed</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>QR code verification for printed certificates</span>
                  </div>
                </div>

                <Link href="/verify">
                  <Button
                    size="lg"
                    className="gap-2 font-bold shadow-lg shadow-blue-500/20 mt-2"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Verify a Certificate
                  </Button>
                </Link>
              </div>

              <div className="flex justify-center">
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100 max-w-sm w-full space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Search className="h-4 w-4 text-blue-600" />
                    Example Format
                  </div>
                  <div className="space-y-2.5">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Completion Certificate
                      </p>
                      <p className="text-sm font-mono font-bold text-blue-600 mt-1">
                        CE-COMP-0001/2026
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Confirmation Letter
                      </p>
                      <p className="text-sm font-mono font-bold text-blue-600 mt-1">
                        CE-CONF-0001/2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── 8. FINAL CTA ───────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Tech Career?
          </h2>
          <p className="text-base text-blue-100 leading-relaxed">
            Join students and graduates across the nation gaining practical development experience with CodeElevate.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/internships">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg"
              >
                Browse All Internships
              </Button>
            </Link>
            <Link href="/verify">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white font-bold transition-all shadow-sm"
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Verify Certificate
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
