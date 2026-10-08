import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { Button } from "@/components/ui/button";
import {
  Code2,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  GitBranch,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Laptop,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & Platform Principles | CodeElevate",
  description:
    "Learn about CodeElevate's mission for practical, project-based engineering internships, verifiable credentials, and transparent operations.",
  openGraph: {
    title: "About Us & Platform Principles | CodeElevate",
    description:
      "Honest, project-driven practical internships for college students across India. Free enrollment, verified GitHub submissions, and transparent pricing.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-16 md:py-24 border-b border-slate-100">
        <div className="container max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practical Engineering & Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Bridging Theory and Practice Through{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Real Project Engineering
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            CodeElevate is an online skill-development platform designed for college students and aspiring developers across India. We focus on hands-on task execution, genuine GitHub code submissions, and verifiable digital credentials.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all gap-2"
            >
              <Link href="/internships">
                Explore Internships
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-2xs"
            >
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Mission & What We Offer */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Our Mission */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Our Mission
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Too many engineering graduates complete college with textbook definitions but without practical repository experience. Our mission is straightforward: <strong>Learn, Build, and Get Certified</strong>.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We empower students from every college and background to build substantial software projects locally on their PCs, commit version-controlled code, and demonstrate proven problem-solving ability.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Practice-driven & 100% remote skill building</span>
              </div>
            </div>

            {/* What We Offer */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Laptop className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  What We Offer
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1-Month Remote Programs:</strong> Self-paced internships across web development, full-stack, and software engineering tracks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Structured Problem Tasks:</strong> Real engineering specifications that you implement in code on your computer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Single GitHub Submission:</strong> Deliver all milestone code in one public GitHub repository link for review.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tamper-Proof Verification:</strong> Issue verifiable PDF certificates backed by public lookup and QR codes.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <GitBranch className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>GitHub-native portfolio development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works in 5 Short Steps */}
      <section className="py-16 md:py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="container max-w-5xl space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              The Learning Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How CodeElevate Works in 5 Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              A clear, transparent roadmap from application to verified completion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Apply Online",
                desc: "Choose an internship domain and submit your application. Enrolling is 100% free with no upfront cost.",
                icon: FileCheck2,
              },
              {
                step: "02",
                title: "Approval & Access",
                desc: "Our team reviews your application (usually 2–3 working days) and unlocks your curriculum dashboard.",
                icon: BookOpen,
              },
              {
                step: "03",
                title: "Build Projects",
                desc: "Develop required features locally on your computer and commit your code to a public GitHub repo.",
                icon: Code2,
              },
              {
                step: "04",
                title: "Submit & Review",
                desc: "Submit your GitHub repository link and pay the one-time ₹99 review fee. Mentors review your work in 5–7 days.",
                icon: CreditCard,
              },
              {
                step: "05",
                title: "Get Certified",
                desc: "Upon approval, download your PDF certificate with a unique certificate ID and QR code for public verification.",
                icon: Award,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between relative hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Step {s.step}
                    </span>
                    <s.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Our Core Principles */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Our Values
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Our Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We operate with strict academic integrity, transparency, and respect for students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Honest Learning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe skill acquisition requires actual problem-solving, not mindless multiple-choice quizzes or watching passive videos. You learn by writing, debugging, and testing real code.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Original Work</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All submissions must represent your own authentic development efforts committed to GitHub. We enforce strict anti-plagiarism standards to maintain genuine credential value.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verifiable Certificates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every credential issued by CodeElevate can be validated in real time by employers, colleges, or recruiters at <Link href="/verify" className="text-blue-600 font-semibold underline hover:text-blue-800">/verify</Link> with zero ambiguities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transparent Pricing Note */}
      <section className="py-12 bg-blue-50/50 border-y border-blue-100">
        <div className="container max-w-4xl">
          <div className="rounded-3xl border-2 border-blue-200 bg-white p-7 sm:p-9 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Honest & Simple Pricing
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Transparent Fee Model
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="text-base font-semibold text-slate-900">
                Enrolling and learning are free. A one-time ₹{business.submissionFeeInr} fee applies when you submit your final work for review.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  <strong>Free Access:</strong> Browsing curriculum tracks, viewing tasks, and downloading learning materials cost ₹0.
                </li>
                <li>
                  <strong>Review & Verification Fee:</strong> The nominal one-time ₹{business.submissionFeeInr} charge covers human evaluation of your repository, code review feedback, and cryptographic certificate generation.
                </li>
                <li>
                  <strong>Free Resubmissions:</strong> If your initial submission requires revisions, you can resubmit after making improvements at <strong>no extra charge (₹0)</strong>.
                </li>
                <li>
                  <strong>Full Refund Protection:</strong> Duplicate payment debits or technical errors are refunded in full within 5–7 business days under our policy.
                </li>
              </ul>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                For complete legal details, please read our{" "}
                <Link href="/terms" className="text-blue-600 font-bold underline hover:text-blue-800">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy" className="text-blue-600 font-bold underline hover:text-blue-800">
                  Refund & Cancellation Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What a Certificate Means (and What It Doesn't) */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl space-y-6">
          <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/40 p-7 sm:p-9 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <span>What a CodeElevate Certificate Means</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white/90 rounded-2xl p-4 border border-amber-200/70 space-y-2">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  What It Confirms:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Proof that the student completed a 1-month practical internship program on CodeElevate.</li>
                  <li>Proof of submitting an approved project repository fulfilling specified task requirements.</li>
                  <li>An authentic, verifiable credential with an immutable public verification URL.</li>
                </ul>
              </div>

              <div className="bg-white/90 rounded-2xl p-4 border border-amber-200/70 space-y-2">
                <p className="font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  What It Is Not:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>It is <strong>NOT</strong> an academic degree, diploma, or government college qualification.</li>
                  <li>It is <strong>NOT</strong> an offer of employment, salary, or employee relationship.</li>
                  <li>It does <strong>NOT</strong> guarantee a job, placement, or hiring outcome.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Official Business Details Block */}
      <section className="py-14 bg-slate-50 border-t border-slate-200/80">
        <div className="container max-w-4xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Corporate Governance
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Business & Operating Information
            </h2>
            <p className="text-xs text-slate-500">
              CodeElevate is committed to full regulatory transparency under Indian Law.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs text-xs sm:text-sm text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Operating Legal Entity</span>
                    <strong className="text-slate-900 text-sm"><BusinessValue value={business.legalName} /></strong>
                    <span className="text-xs text-slate-500 block">Brand: {business.brandName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Registered Address</span>
                    <div className="text-slate-700 leading-relaxed text-xs">
                      <p><BusinessValue value={business.address.line1} /></p>
                      <p>
                        <BusinessValue value={business.address.city} />, <BusinessValue value={business.address.state} /> - <BusinessValue value={business.address.pincode} />
                      </p>
                      <p>{business.address.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Support Email</span>
                    <a href={`mailto:${business.supportEmail}`} className="text-blue-600 font-bold hover:underline">
                      {business.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Support Helpline</span>
                    <a href={`tel:${business.supportPhone}`} className="text-slate-800 font-bold hover:underline">
                      <BusinessValue value={business.supportPhone} />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Operating Hours</span>
                    <span className="text-slate-700">{business.supportHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Jurisdiction: {business.jurisdictionCity}, {business.jurisdictionState}, India</span>
              <Link href="/contact" className="text-blue-600 font-bold hover:underline">
                View Grievance Redressal Officer Contact →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Build Your Engineering Portfolio?
          </h2>
          <p className="text-base text-blue-100 leading-relaxed">
            Browse our domain tracks, start developing real projects on your machine, and earn transparently verifiable credentials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg gap-2"
            >
              <Link href="/internships">
                Explore Internships
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white font-bold rounded-xl transition-all shadow-sm gap-2"
            >
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
