import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
  Globe,
  Users,
  Heart,
  GitBranch,
  Lightbulb,
  Rocket,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | CodeElevate",
  description:
    "CodeElevate is a practical learning and internship platform empowering students with real-world projects and verified credentials.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        id="about"
        className="bg-gradient-to-b from-blue-50/60 via-white to-white py-14 md:py-20 border-b border-slate-100"
      >
        <div className="container text-center max-w-3xl space-y-5">
          <Badge
            variant="default"
            className="bg-blue-50 text-blue-700 font-bold border-blue-200"
          >
            About CodeElevate
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Empowering the Next Generation of{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Software Engineers
            </span>
          </h1>
          <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
            CodeElevate bridges the gap between academic theory and industry-ready engineering through practical, project-driven internships and verified digital credentials.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 md:py-20">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                To provide every student and aspiring developer — regardless of their
                college, city, or background — access to structured, industry-relevant
                practical learning experiences that build real skills and produce
                verifiable credentials employers trust.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                A world where every engineering student graduates with a portfolio of
                real projects, expert-reviewed code on GitHub, and globally verifiable
                certificates — making them immediately employable from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-14 md:py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="container max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What Makes CodeElevate Different
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              We&apos;re not another video-course platform. We&apos;re a practice-first, project-driven
              learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: "Build, Don't Just Watch",
                desc: "Every internship requires you to write code, push it to GitHub, and get it reviewed. No passive video lectures.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: GitBranch,
                title: "GitHub-Native Workflow",
                desc: "Submissions are real GitHub repositories. Mentors review your code like a real-world pull request.",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                icon: Award,
                title: "Verifiable Credentials",
                desc: "Each certificate has a unique credential ID, QR code, and is publicly verifiable by any employer or university.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: BookOpen,
                title: "Structured Curriculum",
                desc: "Week-by-week progressive modules. Each task builds on the previous one, just like a real engineering project.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: Globe,
                title: "100% Remote & Flexible",
                desc: "Learn from anywhere. No fixed schedule, no commute. Self-paced learning that fits your life.",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                icon: Heart,
                title: "Affordable for Everyone",
                desc: "Free enrollment. You only pay a small review fee per task submission — making quality learning accessible.",
                color: "bg-rose-50 text-rose-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3 hover:shadow-card-hover hover:border-blue-200 transition-all duration-300"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} transition-transform group-hover:scale-110`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 md:py-20">
        <div className="container max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Rocket,
                title: "Practice Over Theory",
                desc: "We believe the best way to learn engineering is by doing — building real projects from scratch.",
              },
              {
                icon: ShieldCheck,
                title: "Trust & Transparency",
                desc: "Every step of the process is transparent. Verified credentials ensure trust between students and employers.",
              },
              {
                icon: Users,
                title: "Community First",
                desc: "We're building a community of learners who help each other grow. Your peers are your best teachers.",
              },
              {
                icon: Globe,
                title: "Access for All",
                desc: "Quality education shouldn't depend on your college's brand. Anyone, anywhere can learn and earn credentials.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Join the CodeElevate Community
          </h2>
          <p className="text-base text-blue-100 leading-relaxed">
            Start your practical learning journey today. Browse our internship tracks and earn verified credentials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg gap-2"
            >
              <Link href="/internships">
                Browse Internships
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white font-bold transition-all shadow-sm gap-2"
            >
              <Link href="/verify">
                <ShieldCheck className="h-5 w-5" />
                Verify Certificate
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
