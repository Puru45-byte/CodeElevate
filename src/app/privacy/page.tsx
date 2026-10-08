import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business, formatAddress } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { LegalPageLayout, LegalSection, TocItem } from "@/components/legal/LegalPageLayout";
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Cookie,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | CodeElevate",
  description:
    "Comprehensive Privacy Policy under the Digital Personal Data Protection Act, 2023 (DPDP Act) and Information Technology Act, 2000. Learn how CodeElevate protects your student personal data.",
  openGraph: {
    title: "Privacy Policy | CodeElevate",
    description:
      "Understand how CodeElevate collects, processes, stores, and protects student data, public certificate verification boundaries, and your DPDP Act rights.",
  },
};

const TOC: TocItem[] = [
  { id: "introduction", title: "1. Introduction & Data Fiduciary Details" },
  { id: "data-we-collect", title: "2. Personal Data We Collect (Data Table)" },
  { id: "purposes-legal-basis", title: "3. Purposes & Lawful Grounds for Processing" },
  { id: "consent-withdrawal", title: "4. Student Consent & Right to Withdraw" },
  { id: "certificate-verification", title: "5. Public Certificate Verification Transparency" },
  { id: "data-sharing", title: "6. Who We Share Data With (No Data Selling)" },
  { id: "storage-security", title: "7. Data Storage, Location & Security Measures" },
  { id: "data-retention", title: "8. Data Retention & Erasure Schedule" },
  { id: "dpdp-rights", title: "9. Your Statutory Rights Under the DPDP Act 2023" },
  { id: "children-policy", title: "10. Children & Minors (Under 18 Years)" },
  { id: "cookies", title: "11. Cookies & Local Storage Practices" },
  { id: "third-party-links", title: "12. Third-Party Websites & Links" },
  { id: "policy-changes", title: "13. Updates & Changes to This Policy" },
  { id: "grievance-officer", title: "14. Grievance Officer & Contact Details" },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro="Your privacy and personal data protection are foundational to CodeElevate. This policy details how we collect, handle, store, and safeguard your information in full compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000."
      badge="DPDP Act 2023 Compliant"
      toc={TOC}
      activeRoute="/privacy"
    >
      {/* Overview Notice Box */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-indigo-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <span>Our Core Privacy & Data Protection Principles</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Zero Payment Data Storage:</strong> We never receive, process, or store credit/debit card numbers, CVVs, or UPI PINs (handled via Razorpay PCI-DSS Level 1).
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Strict Verification Scope:</strong> Public certificate verification displays only 9 non-sensitive credential fields.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">No Selling of Data:</strong> We never sell, rent, or monetize your personal information or share it with third-party advertisers.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">DPDP Act 2023 Rights:</strong> Access, correct, erase, or nominate representatives for your data with 48-hour grievance response.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <LegalSection id="introduction" title="1. Introduction & Data Fiduciary Details">
        <p>
          This Privacy Policy explains how <strong>{business.brandName}</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by{" "}
          <BusinessValue value={business.legalName} />, acts as a <strong>Data Fiduciary</strong> under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act 2023)</strong> and the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)</em>.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Data Fiduciary Identification:</p>
          <ul className="space-y-1">
            <li><strong>Brand / Platform Name:</strong> {business.brandName}</li>
            <li><strong>Legal Entity Name:</strong> <BusinessValue value={business.legalName} /></li>
            <li><strong>Registered Address:</strong> <BusinessValue value={formatAddress(business.address)} /></li>
            <li><strong>Official Website:</strong> {business.domain}</li>
            <li><strong>Data Protection & Grievance Email:</strong> <BusinessValue value={business.grievanceOfficer.email} /></li>
          </ul>
        </div>
        <p className="text-xs text-slate-600">
          <strong>Scope of Policy:</strong> This policy applies to all visitors, applicants, registered students, and certificate holders accessing our website, student portal, internship tasks, evaluation workflows, and verification services.
        </p>
      </LegalSection>

      {/* Section 2 */}
      <LegalSection id="data-we-collect" title="2. Personal Data We Collect (Data Table)">
        <p>
          We collect only the minimum necessary personal data required to register your account, manage internship enrollment, evaluate your practical GitHub submissions, and issue verifiable digital credentials.
        </p>
        
        {/* Responsive Table of Data Collected */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-900">
                <th className="p-3.5 font-bold">Category</th>
                <th className="p-3.5 font-bold">Examples of Data Fields</th>
                <th className="p-3.5 font-bold">Why We Need It</th>
                <th className="p-3.5 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Identity & Contact</td>
                <td className="p-3.5">Full name, email address, phone number, WhatsApp number</td>
                <td className="p-3.5">Account creation, identity verification, important program alerts, and certificate naming</td>
                <td className="p-3.5">Provided by you during application</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Profile Details</td>
                <td className="p-3.5">Gender, date of birth (DOB), optional profile photograph</td>
                <td className="p-3.5">Student record management, age eligibility verification, and personalized dashboard display</td>
                <td className="p-3.5">Provided by you in application / profile</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Residential Address</td>
                <td className="p-3.5">State, city, pincode, country (India)</td>
                <td className="p-3.5">Demographic record keeping and regional student reporting</td>
                <td className="p-3.5">Provided by you in application</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Education Details</td>
                <td className="p-3.5">College / university name, degree (e.g. B.Tech, BCA), department, passout year</td>
                <td className="p-3.5">Academic eligibility assessment, internship track matching, and curriculum level calibration</td>
                <td className="p-3.5">Provided by you in application</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Account Credentials</td>
                <td className="p-3.5">Encrypted authentication tokens & hashed passwords (handled via Supabase Auth)</td>
                <td className="p-3.5">Secure dashboard access. <strong>We never see or store plaintext passwords.</strong></td>
                <td className="p-3.5">Generated during authentication</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Program & Submission Data</td>
                <td className="p-3.5">Applied track, task progression, public GitHub repository link, submission notes, mentor feedback</td>
                <td className="p-3.5">Assessing code quality, reviewing task completion, tracking progress, and deciding certificate approval</td>
                <td className="p-3.5">Submitted by you and mentors</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Payment Records (Non-Sensitive)</td>
                <td className="p-3.5">Razorpay Order ID, Payment ID, amount (₹{business.submissionFeeInr}), transaction timestamp, payment status</td>
                <td className="p-3.5">Payment confirmation, invoice generation, duplicate debit reconciliation, and statutory tax compliance</td>
                <td className="p-3.5">Provided via Razorpay webhook</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Certificate Records</td>
                <td className="p-3.5">Unique certificate ID, issue date, track name, completion duration (1 month), status (Valid/Revoked)</td>
                <td className="p-3.5">Issuing verifiable digital certificates and maintaining public credential verification for employers</td>
                <td className="p-3.5">Generated by platform on approval</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Technical & Log Data</td>
                <td className="p-3.5">IP address, browser & device type, operating system, page views, error logs, session cookies</td>
                <td className="p-3.5">Security monitoring, DDoS prevention, troubleshooting technical errors, and session maintenance</td>
                <td className="p-3.5">Collected automatically by servers</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Communications</td>
                <td className="p-3.5">Support tickets, emails sent to support or the Grievance Officer, platform notifications</td>
                <td className="p-3.5">Responding to inquiries, resolving grievances, and communicating review outcomes</td>
                <td className="p-3.5">Direct student interactions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1.5 text-xs text-emerald-950">
          <p className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>Zero Collection of Financial Passwords & Card Numbers:</span>
          </p>
          <p className="leading-relaxed">
            All monetary transactions are executed securely through <strong>Razorpay</strong>. CodeElevate <strong>DOES NOT collect, receive, process, or store</strong> credit/debit card numbers, CVVs, expiry dates, net banking passwords, or UPI PINs.
          </p>
        </div>
      </LegalSection>

      {/* Section 3 */}
      <LegalSection id="purposes-legal-basis" title="3. Purposes & Lawful Grounds for Processing">
        <p>
          In accordance with Section 4 and Section 6 of the DPDP Act 2023, we process your personal data only for lawful, specified, and transparent purposes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">1. Service Delivery & Account Management</p>
            <p className="text-slate-600">Registering your account, granting access to courses and milestone tasks, and managing dashboard settings.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">2. Evaluation & Practical Review</p>
            <p className="text-slate-600">Inspecting submitted GitHub code, automated linting, checking originality, and providing mentor feedback.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">3. Certification & Public Verification</p>
            <p className="text-slate-600">Generating cryptographic digital credentials and maintaining employer verification registries.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">4. Payment Confirmation & Anti-Fraud</p>
            <p className="text-slate-600">Verifying Razorpay transaction webhooks, preventing duplicate fees, and protecting against identity fraud.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">5. Communications & Support</p>
            <p className="text-slate-600">Sending application approval emails, review results, invoice receipts, and responding to help queries.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="font-bold text-slate-900">6. Legal & Statutory Compliance</p>
            <p className="text-slate-600">Complying with applicable Indian tax accounting rules, the IT Act 2000, and DPDP Act obligations.</p>
          </div>
        </div>
      </LegalSection>

      {/* Section 4 */}
      <LegalSection id="consent-withdrawal" title="4. Student Consent & Right to Withdraw">
        <p>
          <strong>Giving Consent:</strong> When you complete our application form and register an account, you must check a mandatory consent checkbox that directly links to this Privacy Policy. By ticking this box, you provide freely given, specific, informed, and unambiguous consent under the DPDP Act 2023.
        </p>
        <p>
          <strong>Withdrawing Consent:</strong> You have the legal right to withdraw your consent at any time by sending an email from your registered email address to our Grievance Officer at <a href={`mailto:${business.grievanceOfficer.email}`} className="text-blue-600 font-medium hover:underline">{business.grievanceOfficer.email}</a>.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-1">
          <p className="font-bold text-amber-900">Effects of Consent Withdrawal:</p>
          <p className="leading-relaxed">
            If you withdraw consent for essential processing (e.g. account authentication or code evaluation), we will no longer be able to deliver internship services, review your project tasks, or issue certificates. Withdrawal of consent does not affect the lawfulness of processing carried out prior to withdrawal.
          </p>
        </div>
      </LegalSection>

      {/* Section 5 */}
      <LegalSection id="certificate-verification" title="5. Public Certificate Verification Transparency">
        <p>
          To protect the academic value and industry credibility of CodeElevate credentials, we maintain a publicly accessible certificate verification system at <Link href="/verify" className="text-blue-600 font-semibold underline hover:text-blue-800">codeelevate.com/verify</Link>.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs text-slate-700">
          <p className="font-bold text-slate-900">
            Exactly What is Displayed on Public Verification (Only 9 Fields):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">1. Student Full Name</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">2. Student ID</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">3. Internship Course / Track</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">4. Unique Certificate ID</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">5. Certificate Type</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">6. Date of Issuance</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">7. Program Duration (1 Month)</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">8. Status (Valid / Revoked)</div>
            <div className="bg-white p-2 rounded border border-slate-200 font-medium text-slate-900">9. Issuing Organization (CodeElevate)</div>
          </div>
          <div className="pt-2 border-t border-slate-200 text-slate-600">
            <strong className="text-slate-900">What is NEVER Shown Publicly:</strong> Your phone number, email address, physical residential address, date of birth, gender, payment details, college marks, or raw code are strictly protected and <strong>never rendered on the public verification page</strong>.
          </div>
        </div>
      </LegalSection>

      {/* Section 6 */}
      <LegalSection id="data-sharing" title="6. Who We Share Data With (No Data Selling)">
        <p>
          We share personal data strictly on a need-to-know basis with trusted service providers who help us deliver the platform:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Razorpay Software Private Limited:</strong> For payment gateway processing, order status confirmation, and tax invoice generation.</li>
          <li><strong>Supabase Inc.:</strong> For encrypted cloud database hosting, student authentication sessions, and secure file storage buckets.</li>
          <li><strong>Vercel Inc.:</strong> For serverless frontend and API hosting, edge routing, and global CDN delivery.</li>
          <li><strong>Email Delivery Providers (Resend/SMTP):</strong> For sending transactional application updates, password resets, review results, and payment receipts.</li>
          <li><strong>Law Enforcement & Regulatory Authorities:</strong> When strictly required by applicable Indian law, court order, or formal investigative notice under the IT Act 2000.</li>
        </ul>
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 font-medium">
          🛡️ <strong>Zero Commercial Sharing:</strong> CodeElevate does NOT sell, rent, monetize, or trade student personal information with any third-party marketing companies, advertisers, or data brokers.
        </div>
      </LegalSection>

      {/* Section 7 */}
      <LegalSection id="storage-security" title="7. Data Storage, Location & Security Measures">
        <p>
          Our platform data is hosted on enterprise cloud infrastructure provided by Supabase and Vercel. These providers may process data across globally distributed, ISO 27001 and SOC 2 Type II certified data centers with stringent contractual and technical safeguards.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Technical & Organizational Safeguards:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Encryption:</strong> All network traffic is encrypted in transit using TLS 1.3 (HTTPS), and all database records and storage objects are encrypted at rest using AES-256.</li>
            <li><strong>Row-Level Security (RLS):</strong> Granular database access policies ensure students can access only their own profile and task records.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Strict administrative credentials and multi-factor authentication are enforced for mentor and evaluation dashboards.</li>
            <li><strong>Breach Notification Protocol:</strong> In the unlikely event of a personal data breach, CodeElevate will notify affected Data Principals and the Data Protection Board of India in accordance with Section 8(6) of the DPDP Act 2023.</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          * Note: While we enforce state-of-the-art security practices, no method of transmission over the internet or electronic storage is 100% impenetrable.
        </p>
      </LegalSection>

      {/* Section 8 */}
      <LegalSection id="data-retention" title="8. Data Retention & Erasure Schedule">
        <p>
          We retain your personal data according to the following schedule:
        </p>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Active Accounts:</strong> Retained for the duration of your active registration and learning tracks.</li>
          <li><strong>Certificate Records:</strong> Retained permanently so that employers, recruiters, and academic institutions can verify your credentials on the public portal at any time.</li>
          <li><strong>Financial & Payment Transaction Logs:</strong> Retained for up to <strong>eight (8) years</strong> in compliance with Indian corporate accounting, GST, and tax regulations.</li>
          <li><strong>Account Deletion:</strong> When an account is closed and retention obligations expire, personal data is either securely deleted or irreversibly anonymized.</li>
        </ul>
      </LegalSection>

      {/* Section 9 */}
      <LegalSection id="dpdp-rights" title="9. Your Statutory Rights Under the DPDP Act 2023">
        <p>
          As a <strong>Data Principal</strong> under Chapter III of the Digital Personal Data Protection Act, 2023, you have the following enforceable statutory rights:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <p className="font-bold text-slate-900">1. Right to Access Information</p>
            <p className="text-slate-600">Request a summary of your personal data being processed and the identities of data processors with whom it has been shared.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <p className="font-bold text-slate-900">2. Right to Correction & Updating</p>
            <p className="text-slate-600">Request correction of inaccurate, out-of-date, or incomplete personal data in your student profile.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <p className="font-bold text-slate-900">3. Right to Erasure</p>
            <p className="text-slate-600">Request deletion of personal data that is no longer necessary for the purpose it was collected, subject to legal and certificate validation needs.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <p className="font-bold text-slate-900">4. Right to Nominate</p>
            <p className="text-slate-600">Nominate another individual to exercise your data principal rights in the event of death or medical incapacity.</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 pt-2">
          <strong>How to Exercise Your Rights:</strong> Submit a request in writing to our Grievance Officer at <a href={`mailto:${business.grievanceOfficer.email}`} className="text-blue-600 font-semibold hover:underline">{business.grievanceOfficer.email}</a>. We will verify your identity and respond within a reasonable timeframe (targeting 30 days).
        </p>
      </LegalSection>

      {/* Section 10 */}
      <LegalSection id="children-policy" title="10. Children & Minors (Under 18 Years)">
        <p>
          The CodeElevate platform is primarily intended for college students, graduates, and adults aged 18 and above.
        </p>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Parental Consent:</strong> Individuals under 18 years of age may use CodeElevate only with verifiable parental or legal guardian consent.</li>
          <li><strong>No Behavioural Tracking:</strong> In compliance with Section 9 of the DPDP Act 2023, CodeElevate does NOT engage in tracking, behavioural monitoring, or targeted advertising directed at children.</li>
          <li><strong>Parental Inquiries:</strong> Parents or legal guardians may contact us at <a href={`mailto:${business.supportEmail}`} className="text-blue-600 hover:underline">{business.supportEmail}</a> to review, update, or request the deletion of their child&apos;s personal data.</li>
        </ul>
      </LegalSection>

      {/* Section 11 */}
      <LegalSection id="cookies" title="11. Cookies & Local Storage Practices">
        <p>
          Cookies are small text files stored on your device that help web applications function smoothly.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <Cookie className="h-4 w-4 text-amber-600" />
            <span>Cookies We Use & How We Use Them:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1 leading-relaxed">
            <li><strong>Strictly Essential Cookies:</strong> Secure session authentication cookies managed by Supabase to keep you logged in to your student dashboard.</li>
            <li><strong>Functional Preferences:</strong> Local storage keys used to remember UI states (such as theme preferences or collapsible sidebar states).</li>
            <li><strong>No Tracking / Ad Cookies:</strong> We do NOT use third-party advertising cookies, cross-site trackers, or data-broker pixels.</li>
          </ul>
        </div>
        <p className="text-xs text-slate-600">
          <strong>Managing Cookies:</strong> You can manage, block, or clear cookies through your browser settings. Please note that disabling essential authentication cookies will prevent you from logging in to your student dashboard.
        </p>
      </LegalSection>

      {/* Section 12 */}
      <LegalSection id="third-party-links" title="12. Third-Party Websites & Links">
        <p>
          Our platform contains links to external third-party services, such as <strong>GitHub</strong> (for code hosting) and <strong>Razorpay</strong> (for payment checkouts).
        </p>
        <p className="text-xs text-slate-600">
          CodeElevate does not control and is not responsible for the privacy practices, content, or policies of third-party platforms. We encourage you to review the privacy policies of any third-party websites you visit.
        </p>
      </LegalSection>

      {/* Section 13 */}
      <LegalSection id="policy-changes" title="13. Updates & Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically to reflect enhancements to our internship workflow, regulatory changes under the DPDP Act 2023, or operational improvements.
        </p>
        <p className="text-xs text-slate-600">
          The <strong>&quot;Last updated&quot;</strong> date at the top of this document indicates the effective date of the latest revisions. For significant changes, we will notify registered students through platform notices or email.
        </p>
      </LegalSection>

      {/* Section 14 */}
      <LegalSection id="grievance-officer" title="14. Grievance Officer & Contact Details">
        <p>
          In accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong>, if you have any questions, concerns, complaints, or wish to exercise your data principal rights, please contact our designated Grievance Redressal Officer:
        </p>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Grievance & Data Protection Officer</p>
              <p className="font-bold text-slate-900 text-base">
                <BusinessValue value={business.grievanceOfficer.name} />
              </p>
              <p className="text-xs text-slate-600">Data Protection & Grievance Officer</p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Direct Grievance Email</p>
              <p className="font-bold text-blue-700 text-base">
                <BusinessValue value={business.grievanceOfficer.email} />
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Helpline Number</p>
              <p className="text-xs text-slate-700">
                <BusinessValue value={business.grievanceOfficer.phone} />
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Postal / Redressal Address</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                <BusinessValue value={business.grievanceOfficer.address} />
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-200/80 text-xs text-slate-600">
            <strong>Response Timelines:</strong> Our Grievance Officer will acknowledge receipt of your complaint within <strong>48 hours</strong> and provide a resolution within <strong>one (1) month (30 days)</strong>.
          </div>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
}
