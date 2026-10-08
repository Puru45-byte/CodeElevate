import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { LegalPageLayout, LegalSection, TocItem } from "@/components/legal/LegalPageLayout";
import {
  Cookie,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  Layers,
  AlertCircle,
  ExternalLink,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | CodeElevate",
  description:
    "Learn about the cookies and local storage mechanisms CodeElevate uses to provide secure authentication, payment processing, and essential platform functionality.",
  openGraph: {
    title: "Cookie Policy | CodeElevate",
    description:
      "Transparent breakdown of essential authentication cookies, session storage, and third-party payment gateway cookies used by CodeElevate.",
  },
};

const TOC: TocItem[] = [
  { id: "what-are-cookies", title: "1. What Are Cookies & Web Storage?" },
  { id: "how-we-use-cookies", title: "2. How CodeElevate Uses Cookies (Detailed Table)" },
  { id: "third-party-services", title: "3. Third-Party Cookies & Integrations" },
  { id: "no-ad-tracking", title: "4. No Advertising or Tracking Pixels" },
  { id: "manage-cookies", title: "5. How to Control & Delete Cookies in Your Browser" },
  { id: "policy-changes", title: "6. Changes & Updates to This Cookie Policy" },
  { id: "contact-us", title: "7. Contact Us & Grievance Information" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      intro="This Cookie Policy explains how CodeElevate uses cookies, session storage, and related technologies to deliver secure authentication, track internship submissions, and maintain platform integrity in accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023."
      badge="DPDP Act 2023 & IT Act Compliant"
      toc={TOC}
      activeRoute="/cookies"
    >
      {/* Overview Notice Box */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-indigo-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
          <Cookie className="h-5 w-5 text-blue-600 shrink-0" />
          <span>Our Cookie & Tracking Transparency Commitments</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Strictly Essential Focus:</strong> We only place cookies necessary for secure user authentication, dashboard access, and session integrity.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Zero Advertising Trackers:</strong> We do NOT deploy third-party advertising cookies, data-broker tracking scripts, or marketing pixels.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Secure Payment Isolation:</strong> Razorpay checkout modal operates within isolated, PCI-DSS Level 1 compliant secure frames.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">User Control:</strong> You can manage, block, or clear cookies directly through your browser preferences at any time.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 1: What are cookies */}
      <LegalSection id="what-are-cookies" title="1. What Are Cookies & Web Storage?">
        <p>
          Cookies are small text files placed on your computer, tablet, or mobile device by websites that you visit. They are widely used by web applications to authenticate users, ensure security, remember user choices, and make web platforms operate smoothly.
        </p>
        <p>
          In addition to cookies, modern web browsers offer related web storage technologies:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>HTTP Cookies</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              Sent automatically between your browser and our servers with every request to verify identity, protect against Cross-Site Request Forgery (CSRF), and maintain active login sessions.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              <span>Session Storage (Web Storage)</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              Temporary client-side browser storage isolated to a single active browser tab. It clears automatically when you close the tab and is never transmitted to advertisers.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Section 2: How CodeElevate uses cookies */}
      <LegalSection id="how-we-use-cookies" title="2. How CodeElevate Uses Cookies (Detailed Table)">
        <p>
          <strong>{business.brandName}</strong> uses cookies and browser storage strictly to operate the platform reliably. Below is an exhaustive list of the cookies and storage mechanisms used across our website:
        </p>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-900">
                <th className="p-3.5 font-bold">Cookie / Key Name</th>
                <th className="p-3.5 font-bold">Category</th>
                <th className="p-3.5 font-bold">Purpose & Technical Function</th>
                <th className="p-3.5 font-bold">Duration</th>
                <th className="p-3.5 font-bold">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-mono font-semibold text-blue-900">
                  sb-*-auth-token<br />
                  <span className="text-[10px] text-slate-500 font-sans">(including chunked .0, .1)</span>
                </td>
                <td className="p-3.5 font-semibold text-slate-900">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Strictly Essential
                  </span>
                </td>
                <td className="p-3.5">
                  Stores secure JSON Web Tokens (JWT) to authenticate students and administrators across server components and middleware. Essential for protecting access to the student dashboard and admin console.
                </td>
                <td className="p-3.5">Session / Up to 7 days (refreshed automatically)</td>
                <td className="p-3.5 font-semibold">Supabase Auth / First-Party</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-mono font-semibold text-blue-900">
                  apply_form_draft_*
                </td>
                <td className="p-3.5 font-semibold text-slate-900">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Functional Storage
                  </span>
                </td>
                <td className="p-3.5">
                  Temporarily caches draft internship application inputs in <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">sessionStorage</code> so your form progress is not lost if the page is refreshed before submission. Automatically deleted upon successful submission or tab closure.
                </td>
                <td className="p-3.5">Browser Tab Session (Cleared on tab close)</td>
                <td className="p-3.5 font-semibold">CodeElevate Client</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-mono font-semibold text-blue-900">
                  rzp_* / checkout session
                </td>
                <td className="p-3.5 font-semibold text-slate-900">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                    Payment Gateway
                  </span>
                </td>
                <td className="p-3.5">
                  Loaded within the Razorpay checkout overlay when paying the evaluation fee (₹{business.submissionFeeInr}). Used for fraud prevention, order session verification, and secure bank payment handshakes.
                </td>
                <td className="p-3.5">Session / Short-term</td>
                <td className="p-3.5 font-semibold">Razorpay (Third-Party)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-1.5 text-xs text-blue-950">
          <p className="font-bold text-blue-900 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Why Strictly Essential Cookies Do Not Require Prior Consent:</span>
          </p>
          <p className="leading-relaxed">
            Under international privacy standards and Indian data protection guidelines, strictly necessary authentication cookies that are essential to fulfill an explicit user request (e.g. logging into your account or submitting a form) operate under legitimate and lawful grounds for processing.
          </p>
        </div>
      </LegalSection>

      {/* Section 3: Third party cookies */}
      <LegalSection id="third-party-services" title="3. Third-Party Cookies & Integrations">
        <p>
          To maintain high reliability, fast page loading, and secure financial transactions, CodeElevate integrates with trusted infrastructure partners:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Razorpay Checkout</span>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-slate-600 leading-relaxed">
              When you initiate project evaluation fee payment, the Razorpay script (<code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">checkout.razorpay.com</code>) loads a secure modal. Razorpay may set session cookies strictly for transactional routing and fraud monitoring.
            </p>
            <a
              href="https://razorpay.com/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline pt-1"
            >
              <span>Razorpay Privacy Policy</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Supabase Authentication</span>
              <Lock className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-slate-600 leading-relaxed">
              Supabase manages encrypted session cookies to authenticate student and administrator accounts. These cookies are marked with <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">HttpOnly</code> and <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">SameSite=Lax</code> for maximum browser security.
            </p>
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline pt-1"
            >
              <span>Supabase Privacy Policy</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </LegalSection>

      {/* Section 4: No Ad Tracking */}
      <LegalSection id="no-ad-tracking" title="4. No Advertising or Tracking Pixels">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 text-emerald-950 space-y-2 text-xs sm:text-sm">
          <p className="font-bold text-emerald-900 flex items-center gap-2 text-sm sm:text-base">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Clear Promise: Zero Cross-Site Commercial Tracking</span>
          </p>
          <p className="leading-relaxed text-slate-700">
            CodeElevate operates an educational internship and certification platform. We believe student data must remain private:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs sm:text-sm">
            <li>We do <strong>NOT</strong> use Google Analytics, Facebook / Meta Pixel, TikTok Pixels, or third-party behavioral advertising scripts.</li>
            <li>We do <strong>NOT</strong> sell, trade, or share your browsing history or session data with data brokers.</li>
            <li>We do <strong>NOT</strong> track you across other websites or engage in behavioral profiling.</li>
          </ul>
        </div>
      </LegalSection>

      {/* Section 5: How to control cookies in browser */}
      <LegalSection id="manage-cookies" title="5. How to Control & Delete Cookies in Your Browser">
        <p>
          You have full control over cookies stored on your device. Most modern web browsers allow you to view, manage, restrict, or delete cookies through their settings menus.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>Google Chrome</span>
            </p>
            <p className="text-slate-600">
              Go to <strong>Settings</strong> &gt; <strong>Privacy and security</strong> &gt; <strong>Third-party cookies</strong>. Here you can clear existing cookies or block third-party cookies.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>Microsoft Edge</span>
            </p>
            <p className="text-slate-600">
              Go to <strong>Settings</strong> &gt; <strong>Cookies and site permissions</strong> &gt; <strong>Manage and delete cookies and site data</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-600" />
              <span>Mozilla Firefox</span>
            </p>
            <p className="text-slate-600">
              Go to <strong>Settings</strong> &gt; <strong>Privacy & Security</strong> &gt; <strong>Cookies and Site Data</strong> to clear or manage stored cookie data.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              <span>Apple Safari (macOS / iOS)</span>
            </p>
            <p className="text-slate-600">
              Go to <strong>Settings / Preferences</strong> &gt; <strong>Privacy</strong> &gt; Manage Website Data or toggle <em>Block all cookies</em>.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-1">
          <p className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Important Note Regarding Essential Cookies:</span>
          </p>
          <p className="leading-relaxed">
            If you choose to block all cookies in your browser settings, you will not be able to log in to your student dashboard, view confidential internship feedback, or access administrative tools, as essential session tokens cannot be maintained.
          </p>
        </div>
      </LegalSection>

      {/* Section 6: Policy changes */}
      <LegalSection id="policy-changes" title="6. Changes & Updates to This Cookie Policy">
        <p>
          We may update this Cookie Policy from time to time to reflect technical upgrades, adjustments in our service providers, or regulatory guidelines under the Digital Personal Data Protection Act, 2023.
        </p>
        <p className="text-xs text-slate-600">
          The <strong>&quot;Last updated&quot;</strong> date displayed at the top of this page indicates the effective date of any modifications. We encourage students to review this page periodically.
        </p>
      </LegalSection>

      {/* Section 7: Contact Us */}
      <LegalSection id="contact-us" title="7. Contact Us & Grievance Information">
        <p>
          If you have any questions or require further clarification regarding our use of cookies and data privacy practices, please reach out to us:
        </p>

        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Support & Inquiries Email</p>
              <p className="font-bold text-blue-700 text-base">
                <BusinessValue value={business.supportEmail} />
              </p>
              <p className="text-xs text-slate-600">Response within 24–48 business hours</p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Data Protection & Grievance Officer</p>
              <p className="font-bold text-slate-900 text-base">
                <BusinessValue value={business.grievanceOfficer.name} />
              </p>
              <p className="text-xs text-slate-600">
                Email: <BusinessValue value={business.grievanceOfficer.email} />
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              For complete details on how we protect your personal data, read our full{" "}
              <Link href="/privacy" className="text-blue-600 font-bold underline hover:text-blue-800">
                Privacy Policy
              </Link>.
            </span>
            <Link
              href="/contact"
              className="text-blue-600 font-bold hover:underline"
            >
              Direct Support Form &rarr;
            </Link>
          </div>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
}
