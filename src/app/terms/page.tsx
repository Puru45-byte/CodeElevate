import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { LegalPageLayout, LegalSection, TocItem } from "@/components/legal/LegalPageLayout";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building2,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | CodeElevate",
  description:
    "Comprehensive Terms & Conditions governing use of CodeElevate's remote practical internship programs, GitHub project submissions, ₹99 evaluation fee, and verified digital certificates under Indian Law.",
  openGraph: {
    title: "Terms & Conditions | CodeElevate",
    description:
      "Read our student agreement, submission rules, free resubmission guarantee, anti-plagiarism guidelines, and legal disclosures.",
  },
};

const TOC: TocItem[] = [
  { id: "acceptance", title: "1. Acceptance of Terms & Legal Capacity" },
  { id: "about-definitions", title: "2. About CodeElevate & Definitions" },
  { id: "eligibility-account", title: "3. Eligibility & Account Security" },
  { id: "internship-program", title: "4. The Internship Program & No Job Guarantee" },
  { id: "learning-materials-ip", title: "5. Learning Materials & Intellectual Property" },
  { id: "student-work-submissions", title: "6. Student Work, GitHub Submissions & Anti-Plagiarism" },
  { id: "submission-fee-payments", title: "7. Submission Fee (₹99) & Payment Processing" },
  { id: "review-certification", title: "8. Review, Free Resubmissions & Certificate Revocation" },
  { id: "acceptable-use", title: "9. Acceptable Platform Use" },
  { id: "termination-suspension", title: "10. Termination & Account Suspension" },
  { id: "third-party-services", title: "11. Third-Party Services (Razorpay, Supabase, Vercel, GitHub)" },
  { id: "disclaimers", title: "12. Platform Disclaimers & Service Availability" },
  { id: "limitation-liability", title: "13. Limitation of Liability" },
  { id: "indemnity", title: "14. Indemnification" },
  { id: "changes-to-terms", title: "15. Changes & Updates to These Terms" },
  { id: "governing-law-jurisdiction", title: "16. Governing Law & Jurisdiction" },
  { id: "grievance-contact", title: "17. Grievance Redressal & Contact" },
  { id: "miscellaneous", title: "18. Miscellaneous Provisions" },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      intro="These Terms & Conditions constitute a legally binding electronic contract under Indian law between you (the student/learner) and CodeElevate regarding access to our remote practical internship platform, project submissions, and credential verification."
      badge="Student Agreement"
      toc={TOC}
      activeRoute="/terms"
    >
      {/* Summary in plain words box (5 bullets) */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-indigo-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
          <span>Summary in Plain Words (Key Highlights)</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">100% Free Learning:</strong> Applying, enrolling, and accessing curriculum resources is completely free (₹0).
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Hands-on GitHub Projects:</strong> You complete tasks on your PC and submit ONE public GitHub repository link for the entire internship.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">₹{business.submissionFeeInr} One-Time Review Fee:</strong> Charged only when you submit your completed work for mentor assessment and verification.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Free Resubmission Guarantee:</strong> If rejected, you get mentor feedback and can resubmit your improved repo without paying again.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs md:col-span-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Skill Simulation, Not Employment:</strong> This is an experiential learning program. We do not offer salary, stipends, or guaranteed job placements.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <LegalSection id="acceptance" title="1. Acceptance of Terms & Legal Capacity">
        <p>
          Welcome to <strong>{business.brandName}</strong>, owned and operated by{" "}
          <BusinessValue value={business.legalName} /> (&quot;CodeElevate&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          By creating an account, browsing our website, applying for an internship, accessing course task lists, pushing code repositories, or paying a submission fee, you explicitly agree to be bound by these Terms & Conditions (&quot;Terms&quot;), our{" "}
          <Link href="/privacy" className="text-blue-600 font-semibold underline hover:text-blue-800">Privacy Policy</Link>, and our{" "}
          <Link href="/refund-policy" className="text-blue-600 font-semibold underline hover:text-blue-800">Refund & Cancellation Policy</Link>.
        </p>
        <p>
          This document is an electronic contract governed by the <strong>Information Technology Act, 2000</strong> and the <strong>Indian Contract Act, 1872</strong>. It does not require any physical or digital signatures.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Age & Legal Capacity Requirements:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least 18 years of age to enter into this contract independently.</li>
            <li>If you are under 18 years of age (a minor), you may use CodeElevate only under the supervision and with the express consent of a parent or legal guardian who agrees to these Terms on your behalf.</li>
            <li>Obtaining parental or guardian consent is solely the responsibility of the minor user.</li>
          </ul>
        </div>
      </LegalSection>

      {/* Section 2 */}
      <LegalSection id="about-definitions" title="2. About CodeElevate & Definitions">
        <p>
          For the purposes of these Terms, the following definitions apply:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Platform:</span>
            <p className="text-slate-600">The website, web applications, portal, APIs, and services operated under {business.brandName} ({business.domain}).</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Student / User:</span>
            <p className="text-slate-600">Any individual who visits, applies, enrolls, or submits engineering work on the Platform.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Internship:</span>
            <p className="text-slate-600">A 1-month, remote, practical project-based engineering learning simulation track.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Task:</span>
            <p className="text-slate-600">An individual practical milestone, project specification, or feature checklist within a curriculum.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Submission:</span>
            <p className="text-slate-600">The single public GitHub repository link, documentation, and notes submitted by the student for final evaluation.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="font-bold text-slate-900">Certificate:</span>
            <p className="text-slate-600">The verifiable digital Certificate of Completion with a unique credential ID and QR code issued upon approved review.</p>
          </div>
        </div>
      </LegalSection>

      {/* Section 3 */}
      <LegalSection id="eligibility-account" title="3. Eligibility & Account Security">
        <p>
          When registering or submitting an application on CodeElevate, you agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
          <li><strong>Provide Accurate Information:</strong> Submit true, current, and complete details regarding your identity, college, degree, contact number, and email.</li>
          <li><strong>One Account Per Person:</strong> Maintain only one student account. Creating duplicate, fraudulent, or multi-identity accounts is strictly forbidden.</li>
          <li><strong>Account Confidentiality:</strong> Keep your login links, passwords, and tokens confidential. You are solely responsible for all activities occurring under your account.</li>
          <li><strong>Right to Suspend:</strong> We reserve the right to suspend or terminate any account that contains inaccurate, false, or impersonated information.</li>
        </ul>
      </LegalSection>

      {/* Section 4 */}
      <LegalSection id="internship-program" title="4. The Internship Program & No Job Guarantee">
        <div className="space-y-3">
          <p>
            CodeElevate offers <strong>1-month, remote, practical tech internships</strong> designed to provide structured engineering practice in tracks such as Full Stack Web Development, Python & AI, Cloud & DevOps, and Enterprise Java.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Strict Educational & Non-Employment Disclaimer</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              <li><strong>Not Employment:</strong> This program is strictly an online practical learning and skill-enablement simulation. It does NOT constitute employment or an apprenticeship under the Apprentices Act, 1961.</li>
              <li><strong>No Salary or Stipend:</strong> There is no salary, stipend, wage, or monetary compensation paid to students.</li>
              <li><strong>No Employer-Employee Relationship:</strong> Participation does not establish an agency, employment, joint venture, or partnership relationship with CodeElevate.</li>
              <li><strong>No Guarantee of Jobs or Placements:</strong> CodeElevate does NOT guarantee jobs, job interviews, campus recruitment, hiring outcomes, or minimum salary packages.</li>
              <li><strong>Discretionary Application Approval:</strong> Submitting an application does not automatically guarantee admission. Applications are reviewed by administrators and may be approved or rejected at our sole discretion.</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* Section 5 */}
      <LegalSection id="learning-materials-ip" title="5. Learning Materials & Intellectual Property">
        <p>
          All curriculum outlines, milestone task guides, instructional notes, project rubrics, software assets, logos, trademarks, and platform software are the exclusive intellectual property of <BusinessValue value={business.legalName} /> (&quot;CodeElevate IP&quot;).
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
          <li><strong>Personal Learning Licence:</strong> You are granted a limited, non-exclusive, non-transferable, revocable licence to access learning materials solely for your individual, non-commercial education.</li>
          <li><strong>Prohibitions:</strong> You may not copy, record, redistribute, publish, sell, or commercialize any CodeElevate curriculum, prompts, or proprietary assessment frameworks.</li>
        </ul>
      </LegalSection>

      {/* Section 6 */}
      <LegalSection id="student-work-submissions" title="6. Student Work, GitHub Submissions & Anti-Plagiarism">
        <p>
          All practical engineering tasks must be executed on your local computer and version-controlled on a public GitHub repository.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Student Ownership & Review Licence:</p>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li><strong>You Own Your Code:</strong> You retain 100% copyright and ownership of the original software source code that you write.</li>
            <li><strong>Limited Licence to Review:</strong> By submitting your GitHub link, you grant CodeElevate and its evaluation team a worldwide, royalty-free licence to access, clone, inspect, run automated linters, and review the repository for grading and verification.</li>
            <li><strong>Public Accessibility:</strong> Your repository must remain publicly accessible until evaluation is complete. Private repositories cannot be evaluated.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-2 text-xs text-red-950">
          <div className="flex items-center gap-1.5 font-bold text-red-900 text-sm">
            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
            <span>Anti-Plagiarism, AI & Malware Policies</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 leading-relaxed">
            <li><strong>Zero Tolerance for Plagiarism:</strong> Submitting someone else&apos;s code, copying repos from batchmates, or purchasing pre-made projects is strictly prohibited.</li>
            <li><strong>Ethical Use of AI:</strong> You may use AI assistance for research or syntax help, but you must understand and author your implementation. Submitting uncomprehended, copied AI dumps that fail requirements will result in rejection.</li>
            <li><strong>No Harmful Code:</strong> Submissions containing malicious code, ransomware, malware, keyloggers, or destructive scripts will result in immediate permanent disqualification.</li>
            <li><strong>Consequences:</strong> Violations will result in immediate rejection, account suspension, and revocation of any issued credentials.</li>
          </ul>
        </div>
      </LegalSection>

      {/* Section 7 */}
      <LegalSection id="submission-fee-payments" title="7. Submission Fee (₹99) & Payment Processing">
        <p>
          Learning on CodeElevate is 100% free. When you complete your internship milestones and submit your GitHub project repository for formal review, a one-time administrative fee is charged:
        </p>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 text-xs text-emerald-950">
          <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
            <span className="font-bold text-emerald-900 text-sm">One-Time Project Evaluation Fee</span>
            <span className="font-extrabold text-emerald-900 text-lg">₹{business.submissionFeeInr}.00 INR</span>
          </div>
          <p className="leading-relaxed">
            <strong>What the Fee Covers:</strong> The fee covers mentor evaluation time, anti-plagiarism repository scanning, code review feedback, and cryptographic verification infrastructure. <strong>You are paying for the review and verification service, not &quot;purchasing&quot; a certificate.</strong>
          </p>
          <p className="leading-relaxed">
            <strong>Taxes:</strong> All fees are stated in Indian Rupees (INR) and are inclusive of applicable taxes.{business.gstin ? <> GSTIN: <BusinessValue value={business.gstin} />.</> : <> CodeElevate is currently not registered under GST.</>}
          </p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          All payments are processed securely by <strong>Razorpay Software Private Limited</strong> and are subject to Razorpay&apos;s terms of service. CodeElevate <strong>never sees, captures, or stores</strong> your credit/debit card numbers, CVVs, net banking credentials, or UPI PINs.
        </p>
        <p className="text-xs text-slate-600">
          For refund terms, duplicate debit reimbursements, and payment grievance timelines, please review our full{" "}
          <Link href="/refund-policy" className="text-blue-600 font-semibold underline hover:text-blue-800">Refund & Cancellation Policy</Link>.
        </p>
      </LegalSection>

      {/* Section 8 */}
      <LegalSection id="review-certification" title="8. Review, Free Resubmissions & Certificate Revocation">
        <p>
          Upon payment and submission, our evaluation team assesses your entire GitHub repository against our technical rubric:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Approval or Rejection:</strong> Submissions are approved or rejected as a whole. If rejected, you receive constructive mentor feedback detailing areas for improvement.</li>
          <li><strong>Free Resubmission:</strong> If rejected, you can fix your code and resubmit your updated repository <strong>for free with no second payment</strong>.</li>
          <li><strong>Digital Certificate Issuance:</strong> Upon approval, you receive a tamper-proof digital Certificate of Completion featuring a unique Certificate Number and a verifiable QR code.</li>
          <li><strong>Public Verification:</strong> Anyone can verify your certificate at <Link href="/verify" className="text-blue-600 font-semibold underline hover:text-blue-800">codeelevate.com/verify</Link>. Public verification shows only limited non-sensitive information (see our <Link href="/privacy" className="text-blue-600 font-semibold underline hover:text-blue-800">Privacy Policy</Link> for exact fields).</li>
          <li><strong>Right of Revocation:</strong> CodeElevate reserves the unconditional right to revoke any certificate if subsequent evidence of plagiarism, academic dishonesty, unauthorized access, or fraudulent payment is uncovered. Revoked certificates are permanently marked as <strong>&quot;REVOKED&quot;</strong> on the public verification portal.</li>
          <li><strong>Non-Degree Status:</strong> Certificates represent completion of an independent practical learning program and do NOT represent an academic degree from a government body, university, UGC, or AICTE.</li>
        </ul>
      </LegalSection>

      {/* Section 9 */}
      <LegalSection id="acceptable-use" title="9. Acceptable Platform Use">
        <p>
          You agree not to use the Platform for any unlawful, harmful, or disruptive activities, including:
        </p>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li>Engaging in illegal acts, hate speech, defamation, or harassment against staff, mentors, or students.</li>
          <li>Attempting to probe, scan, breach, or exploit vulnerabilities in our server infrastructure, APIs, or database.</li>
          <li>Automated scraping, crawling, or extracting platform curriculum or certificate data without prior written permission.</li>
          <li>Impersonating another person, creating fake student accounts, or forging referral codes.</li>
          <li>Tampering with Razorpay payment webhooks, transaction hashes, or verification tokens.</li>
          <li>Uploading files containing viruses, corrupted archives, or destructive scripts.</li>
        </ul>
      </LegalSection>

      {/* Section 10 */}
      <LegalSection id="termination-suspension" title="10. Termination & Account Suspension">
        <p>
          <strong>Termination by CodeElevate:</strong> We may suspend, freeze, or terminate your account and access to internship tracks immediately, without prior notice, if you breach these Terms, commit plagiarism, or engage in fraudulent activities.
        </p>
        <p>
          <strong>Termination by Student:</strong> You may close your student account at any time by contacting support at <a href={`mailto:${business.supportEmail}`} className="text-blue-600 hover:underline">{business.supportEmail}</a>.
        </p>
        <p>
          <strong>Effect of Termination:</strong> Upon termination, your right to access active learning tracks ceases immediately. Previously issued valid certificates will remain verifiable on the public portal unless revoked for cause.
        </p>
      </LegalSection>

      {/* Section 11 */}
      <LegalSection id="third-party-services" title="11. Third-Party Services (Razorpay, Supabase, Vercel, GitHub)">
        <p>
          Our platform integrates with trusted third-party cloud infrastructure:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
            <strong className="text-slate-900">Razorpay:</strong> Payment gateway and RBI-compliant transaction processing.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
            <strong className="text-slate-900">Supabase:</strong> Cloud database, authentication tokens, and secure file storage.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
            <strong className="text-slate-900">Vercel:</strong> Edge hosting, DDoS defense, and serverless compute.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
            <strong className="text-slate-900">GitHub:</strong> Code repository hosting and version control.
          </div>
        </div>
        <p className="text-xs text-slate-500">
          CodeElevate is not liable for temporary service interruptions, network downtime, or policy changes initiated by these independent third-party vendors.
        </p>
      </LegalSection>

      {/* Section 12 */}
      <LegalSection id="disclaimers" title="12. Platform Disclaimers & Service Availability">
        <p>
          The Platform, curriculum materials, and services are provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, statutory, or implied.
        </p>
        <p>
          We do not warrant that the website will operate uninterrupted or error-free, that bugs will be corrected instantly, or that the curriculum materials meet all individual academic curricula or specific corporate job requirements.
        </p>
      </LegalSection>

      {/* Section 13 */}
      <LegalSection id="limitation-liability" title="13. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable Indian law:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
          <li><strong>Liability Cap:</strong> In no event shall the total cumulative liability of CodeElevate, its directors, employees, or mentors exceed the total fee actually paid by you to CodeElevate in the preceding twelve (12) months (i.e. maximum ₹{business.submissionFeeInr}).</li>
          <li><strong>No Consequential Damages:</strong> We shall not be liable for any indirect, incidental, special, punitive, or consequential damages, including loss of profits, data, employment opportunities, or educational admission outcomes.</li>
          <li><strong>Statutory Rights:</strong> Nothing in these Terms shall exclude or limit liability for any matter that cannot be excluded under applicable Indian consumer protection or contract laws.</li>
        </ul>
      </LegalSection>

      {/* Section 14 */}
      <LegalSection id="indemnity" title="14. Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless <BusinessValue value={business.legalName} />, its directors, officers, mentors, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
          <li>Your breach or violation of any provision of these Terms;</li>
          <li>Any plagiarism, copyright infringement, or intellectual property violation in your submitted code; or</li>
          <li>Your violation of any applicable law or regulation.</li>
        </ul>
      </LegalSection>

      {/* Section 15 */}
      <LegalSection id="changes-to-terms" title="15. Changes & Updates to These Terms">
        <p>
          We reserve the right to revise or modify these Terms at any time to reflect platform enhancements, operational changes, or new legal obligations.
        </p>
        <p>
          The <strong>&quot;Last updated&quot;</strong> date at the top of this page indicates the effective date of the latest version. Your continued use of the Platform after changes are published constitutes your acceptance of the revised Terms. Material modifications will be announced through platform notifications or sent to your registered email address.
        </p>
      </LegalSection>

      {/* Section 16 */}
      <LegalSection id="governing-law-jurisdiction" title="16. Governing Law & Jurisdiction">
        <p>
          These Terms and any contractual disputes arising out of or relating to your use of CodeElevate shall be governed by and interpreted in accordance with the laws of the <strong>Republic of India</strong>.
        </p>
        <p>
          Subject to prior informal grievance resolution, the courts of competent jurisdiction situated at{" "}
          <strong className="text-slate-900">
            <BusinessValue value={business.jurisdictionCity} />, <BusinessValue value={business.jurisdictionState} />, India
          </strong>{" "}
          shall have exclusive jurisdiction over all legal proceedings.
        </p>
        <p className="text-xs text-slate-600">
          Both parties agree to first attempt an amicable, informal resolution by contacting our designated Grievance Officer before initiating any formal legal proceedings.
        </p>
      </LegalSection>

      {/* Section 17 */}
      <LegalSection id="grievance-contact" title="17. Grievance Redressal & Contact">
        <p>
          In accordance with <strong>Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, our Grievance Redressal Officer details are:
        </p>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Officer Name & Designation</p>
              <p className="font-bold text-slate-900 text-base">
                <BusinessValue value={business.grievanceOfficer.name} />
              </p>
              <p className="text-xs text-slate-600">Grievance & Compliance Officer</p>
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
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Turnaround Timelines</p>
              <p className="text-xs text-slate-700">Acknowledgment within 48 hours; resolution within 15–30 days.</p>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-200/80 text-xs">
            <Link href="/contact" className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline">
              <Building2 className="h-4 w-4" />
              <span>Visit our full Business Information & Grievance Redressal page</span>
            </Link>
          </div>
        </div>
      </LegalSection>

      {/* Section 18 */}
      <LegalSection id="miscellaneous" title="18. Miscellaneous Provisions">
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Entire Agreement:</strong> These Terms, alongside our Privacy Policy and Refund Policy, constitute the complete agreement between you and CodeElevate regarding platform usage.</li>
          <li><strong>Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable by an Indian court of competent jurisdiction, such provision shall be enforced to the maximum extent permissible, and the remaining provisions shall continue in full force and effect.</li>
          <li><strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right.</li>
          <li><strong>Assignment:</strong> You may not assign or transfer your rights under these Terms without our prior written consent. CodeElevate may assign its rights and obligations in connection with a corporate reorganization, merger, or asset acquisition.</li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
