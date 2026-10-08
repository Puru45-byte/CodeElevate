import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { ContactForm } from "./contact-form";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  Award,
  CreditCard,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Grievance Redressal | CodeElevate",
  description:
    "Get in touch with CodeElevate student support, access grievance redressal contacts, and find fast assistance for applications, certificates, and payments.",
  openGraph: {
    title: "Contact Us & Grievance Redressal | CodeElevate",
    description:
      "Direct support channels, official business address, grievance officer contact, and inquiry submission for CodeElevate.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-10 sm:pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student & Customer Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Contact CodeElevate
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Have questions about an internship track, your project submission, payment verification, or certification? We&apos;re here to help.{" "}
            <strong className="text-slate-900 font-semibold">We usually reply within 1–2 working days.</strong>
          </p>
        </div>

        {/* Top Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/refund-policy"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  Payment & Refund Policy
                </p>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Read our explicit 5–7 business days refund rules, duplicate transaction resolution, and free resubmission terms.
              </p>
            </div>
          </Link>

          <Link
            href="/verify"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                  Certificate Verification
                </p>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Instantly verify any student credential or digital certificate issued by CodeElevate using its unique ID or QR code.
              </p>
            </div>
          </Link>
        </div>

        {/* Main 2-Column Grid: Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Business Details & Grievance Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Business Contact Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Official Business Details
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Direct Contact Channels
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Legal Entity */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Operating Entity</p>
                    <p className="font-bold text-slate-900">
                      <BusinessValue value={business.legalName} />
                    </p>
                    <p className="text-xs text-slate-500">Brand: {business.brandName}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Support Email</p>
                    <p className="font-bold text-blue-600">
                      <a href={`mailto:${business.supportEmail}`} className="hover:underline">
                        {business.supportEmail}
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-400">Official desk for queries & verification</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Helpline Telephone</p>
                    <p className="font-bold text-slate-900">
                      <a href={`tel:${business.supportPhone}`} className="hover:underline">
                        <BusinessValue value={business.supportPhone} />
                      </a>
                    </p>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Operating Hours</p>
                    <p className="font-semibold text-slate-800">{business.supportHours}</p>
                    <p className="text-[11px] text-slate-400">Excluding National & Public Holidays</p>
                  </div>
                </div>

                {/* Registered Address */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Registered Address</p>
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
            </div>

            {/* Grievance Redressal Officer Card */}
            <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-slate-50 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                <span>Grievance Redressal Officer</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pursuant to the <strong>Information Technology Act, 2000</strong>, the <strong>IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>:
              </p>

              <div className="rounded-2xl bg-white/90 border border-indigo-100 p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Designated Officer:</span>
                  <span className="font-bold text-slate-900"><BusinessValue value={business.grievanceOfficer.name} /></span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-indigo-600">
                    <a href={`mailto:${business.grievanceOfficer.email}`} className="hover:underline">
                      <BusinessValue value={business.grievanceOfficer.email} />
                    </a>
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Telephone:</span>
                  <span className="font-bold text-slate-900"><BusinessValue value={business.grievanceOfficer.phone} /></span>
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <span className="text-slate-500">Postal Address:</span>
                  <span className="font-medium text-slate-800"><BusinessValue value={business.grievanceOfficer.address} /></span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-indigo-100/70 rounded-xl p-3 text-indigo-950 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
                <span>
                  We acknowledge complaints within 48 hours and resolve them within one month.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Common Inquiries</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Quick answers to frequent student inquiries before you submit a ticket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
              <p className="font-bold text-slate-900">How do I apply for an internship?</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Browse our <Link href="/internships" className="text-blue-600 font-medium hover:underline">Internships catalog</Link>, pick a track, and submit the application form. Enrollment is 100% free with no upfront payments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
              <p className="font-bold text-slate-900">Where is my certificate after completing tasks?</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Once our mentor team approves your project submission (usually within 5–7 working days), your certificate is automatically generated in your <Link href="/dashboard/certificates" className="text-blue-600 font-medium hover:underline">My Certificates</Link> tab with a downloadable PDF and QR verification.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
              <p className="font-bold text-slate-900">What if my payment was debited but the status didn&apos;t update?</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Payment webhooks process within a few minutes. If your status hasn&apos;t changed after 15 minutes, select &quot;Payment/Refund&quot; in the form above and provide your Razorpay Payment ID or check our <Link href="/refund-policy" className="text-blue-600 font-medium hover:underline">Refund Policy</Link>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
              <p className="font-bold text-slate-900">Are project resubmissions charged extra?</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                No. If your project submission needs revisions after mentor feedback, resubmission is completely free (₹0). You never pay a second review fee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
