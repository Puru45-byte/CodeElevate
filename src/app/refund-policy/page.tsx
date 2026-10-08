import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { LegalPageLayout, LegalSection, TocItem } from "@/components/legal/LegalPageLayout";
import {
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | CodeElevate",
  description:
    "Official Refund & Cancellation Policy for CodeElevate internship project evaluation fees (₹99), duplicate debit refunds, and free resubmissions under Indian Consumer Protection Regulations.",
  openGraph: {
    title: "Refund & Cancellation Policy | CodeElevate",
    description:
      "Details on our ₹99 project evaluation fee, 100% free learning, duplicate payment refunds, and 5-7 business day turnaround.",
  },
};

const TOC: TocItem[] = [
  { id: "fee-nature", title: "1. What the ₹99 Evaluation Fee Covers" },
  { id: "cancellation-policy", title: "2. Cancellation & Application Withdrawal" },
  { id: "eligible-refunds", title: "3. Refund Eligibility (100% Full Refunds)" },
  { id: "non-refundable", title: "4. Non-Refundable Scenarios" },
  { id: "failed-pending-payments", title: "5. Failed or Pending Transactions" },
  { id: "how-to-request", title: "6. How to Request a Refund (Step-by-Step)" },
  { id: "review-timelines", title: "7. Review & Refund Processing Timelines (5–7 Days)" },
  { id: "after-refund-status", title: "8. Status of Submissions After Refund" },
  { id: "disputes-chargebacks", title: "9. Payment Disputes & Chargebacks" },
  { id: "taxes-gst", title: "10. Applicable Taxes & GST Disclosures" },
  { id: "billing-contact", title: "11. Billing Support & Grievance Redressal" },
  { id: "policy-updates", title: "12. Policy Updates & Effective Date" },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      intro="CodeElevate maintains a student-first, transparent fee and refund policy. Read our explicit guidelines regarding the ₹99 evaluation fee, free resubmissions, and refund turnaround timelines."
      badge="Consumer Protection & Razorpay Compliant"
      toc={TOC}
      activeRoute="/refund-policy"
    >
      {/* Top Summary Box */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
          <RotateCcw className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Summary in Plain Words (Quick Fee & Refund Rules)</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">100% Free Learning:</strong> Applying, enrolling, accessing task lists, and building projects is completely free (₹0).
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">₹{business.submissionFeeInr} One-Time Fee:</strong> Charged ONLY when you submit your completed GitHub repository for mentor evaluation and certification.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Free Resubmission Guarantee:</strong> If rejected, you receive mentor feedback and can resubmit your improved repo without paying again.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Full Duplicate Refund:</strong> Technical duplicate charges are refunded 100% to the original source in {business.refundProcessingDays}.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <LegalSection id="fee-nature" title="1. What the ₹99 Evaluation Fee Covers">
        <p>
          Enrolling, accessing curriculum resources, milestone task specifications, and learning on CodeElevate is completely free (₹0).
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">One-Time Project Submission & Evaluation Fee</span>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">₹{business.submissionFeeInr}.00 INR</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs">
            <strong>What the Fee Covers:</strong> When you complete your 1-month practical tasks and submit your public GitHub repository, this fee covers manual mentor review hours, automated code analysis, anti-plagiarism repository verification, and permanent cryptographic credential generation.
          </p>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-950 font-medium space-y-1">
            <p>
              • <strong>Service-Based Evaluation:</strong> You are paying for the professional evaluation service. The fee applies to the review process itself and is not contingent on the outcome (approval or rejection).
            </p>
            <p>
              • <strong>Free Resubmission Policy:</strong> If your project is marked as rejected, you receive detailed feedback and can fix your code to resubmit <strong>100% free of charge (₹0 additional fee)</strong>.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Section 2 */}
      <LegalSection id="cancellation-policy" title="2. Cancellation & Application Withdrawal">
        <p>
          Because creating an account and enrolling in an internship track is 100% free, students may withdraw their application, leave the platform, or pause their learning at any time at <strong>zero financial cost</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
          <li><strong>No Pre-Submission Fees:</strong> No fee is ever charged or collected prior to the student voluntarily choosing to submit their final GitHub repository link.</li>
          <li><strong>Account Closure:</strong> You may close your student account or withdraw an application at any time by sending an email from your registered email address to <a href={`mailto:${business.supportEmail}`} className="text-blue-600 hover:underline">{business.supportEmail}</a>.</li>
        </ul>
      </LegalSection>

      {/* Section 3 */}
      <LegalSection id="eligible-refunds" title="3. Refund Eligibility (100% Full Refunds)">
        <p>
          CodeElevate provides a <strong>100% full refund</strong> in the following verified circumstances:
        </p>
        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-2xs">
            <h4 className="font-bold text-slate-900">A. Duplicate / Multiple Debits</h4>
            <p className="text-slate-600">If a network timeout, double-clicking, or payment gateway lag causes you to be charged more than once for the same submission, 100% of the duplicate amount(s) will be refunded immediately.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-2xs">
            <h4 className="font-bold text-slate-900">B. Payment Debited but Submission Not Recorded</h4>
            <p className="text-slate-600">If money was successfully deducted by Razorpay but a server error or gateway disruption prevented your submission from being created on CodeElevate, you may choose an instant full refund or manual activation of your submission.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-2xs">
            <h4 className="font-bold text-slate-900">C. Unauthorized Transaction Reported Within 7 Days</h4>
            <p className="text-slate-600">If a payment was made by mistake or without authorization and is reported to our support team within <strong>seven (7) calendar days</strong> of the transaction date (subject to verification).</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-2xs">
            <h4 className="font-bold text-slate-900">D. Inability to Provide Review Service</h4>
            <p className="text-slate-600">If CodeElevate is unable to evaluate your submission due to platform discontinuation, extended server failure, or operational fault on our part.</p>
          </div>
        </div>
      </LegalSection>

      {/* Section 4 */}
      <LegalSection id="non-refundable" title="4. Non-Refundable Scenarios">
        <p>
          Because the evaluation fee covers immediate computational scans and dedicated mentor time, refunds cannot be granted in the following scenarios:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Review Process Commenced:</strong> Once your GitHub repository has been successfully submitted, validated, and entered the mentor review queue, the evaluation service has commenced and the fee is non-refundable.</li>
          <li><strong>Rejection of Submission:</strong> Rejection due to incomplete tasks, bugs, or failing technical requirements is not a ground for a refund, because the review was fully performed. (You receive free resubmission privileges).</li>
          <li><strong>Academic Dishonesty & Terms Breach:</strong> If your submission is rejected or your certificate is revoked due to verified code plagiarism, purchased projects, fraudulent payments, or violation of our <Link href="/terms" className="text-blue-600 font-semibold underline hover:text-blue-800">Terms & Conditions</Link>.</li>
          <li><strong>Change of Mind or Non-Completion:</strong> If you voluntarily decide not to continue the internship after paying and submitting for review.</li>
          <li><strong>Failed Transactions (No Money Debited):</strong> If a payment attempt fails and no funds were deducted from your bank or card, there is no transaction to refund. Any temporary bank holds or gateway reversal charges outside our control are handled by your issuing bank.</li>
        </ul>
      </LegalSection>

      {/* Section 5 */}
      <LegalSection id="failed-pending-payments" title="5. Failed or Pending Transactions">
        <p>
          In cases where money is deducted from your bank account or UPI app but the payment status on CodeElevate displays &quot;Pending&quot; or &quot;Failed&quot;:
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Automatic Bank Reversals:</p>
          <p className="text-slate-600 leading-relaxed">
            Payment aggregators and banks initiate automatic reconciliations for interrupted payments. In most cases, the deducted amount is automatically reversed to your bank account within <strong>5 to 7 business days</strong>.
          </p>
          <p className="text-slate-600 leading-relaxed">
            If the amount has not been refunded after 7 business days, please email our support team at <a href={`mailto:${business.supportEmail}`} className="text-blue-600 font-medium hover:underline">{business.supportEmail}</a> with your Razorpay Payment ID, and we will trace the transaction directly with Razorpay.
          </p>
        </div>
      </LegalSection>

      {/* Section 6 */}
      <LegalSection id="how-to-request" title="6. How to Request a Refund (Step-by-Step)">
        <p>
          To request a refund for an eligible scenario (such as a duplicate charge):
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-xs sm:text-sm text-slate-700 shadow-2xs">
          <p className="font-bold text-slate-900">Email Submission Instructions:</p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-xs">
            <li>
              Send an email to <a href={`mailto:${business.supportEmail}`} className="text-blue-600 font-bold hover:underline">{business.supportEmail}</a> with the subject line: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-900">&quot;Refund Request - [Your Name] - [Order ID]&quot;</code>.
            </li>
            <li>
              Include your <strong>registered student email address</strong> and <strong>full name</strong>.
            </li>
            <li>
              Provide the <strong>Razorpay Payment ID</strong> (e.g. <code>pay_...</code>) or <strong>Order ID</strong> (found in your SMS/email confirmation).
            </li>
            <li>
              State the <strong>transaction date, amount paid (₹{business.submissionFeeInr})</strong>, and a brief explanation of the issue (e.g. duplicate deduction).
            </li>
            <li>
              Attach a bank debit screenshot or payment receipt if available to expedite verification.
            </li>
          </ol>
          <div className="pt-2 border-t border-slate-100 text-xs text-blue-900 font-medium">
            ⏱️ <strong>Acknowledgment Timeline:</strong> Our billing team will acknowledge receipt of your refund request within <strong>48 hours</strong>.
          </div>
        </div>
      </LegalSection>

      {/* Section 7 */}
      <LegalSection id="review-timelines" title="7. Review & Refund Processing Timelines (5–7 Days)">
        <p>
          Once your refund request is received:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="font-bold text-slate-900">1. Verification & Approval</p>
            <p className="text-slate-600">Our billing team verifies the Razorpay ledger and approves/rejects the request within <strong>5 to 7 business days</strong>.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="font-bold text-slate-900">2. Original Payment Source Only</p>
            <p className="text-slate-600">Refunds are issued exclusively back to the <strong>ORIGINAL payment method</strong> used during checkout (same UPI ID, debit card, or net banking account). No cash or third-party transfers are permitted.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 sm:col-span-2">
            <p className="font-bold text-slate-900">3. Bank Settlement Timeline ({business.refundProcessingDays})</p>
            <p className="text-slate-600">After approval, the refund is processed via Razorpay. It typically takes <strong>{business.refundProcessingDays}</strong> to reflect on your bank account statement or UPI app, depending on your bank&apos;s processing cycles.</p>
          </div>
        </div>
      </LegalSection>

      {/* Section 8 */}
      <LegalSection id="after-refund-status" title="8. Status of Submissions After Refund">
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
          <li><strong>Duplicate Payment Refunds:</strong> If you were charged twice and the duplicate fee is refunded, your original valid submission remains active and continues through normal mentor evaluation without interruption.</li>
          <li><strong>Uncreated Submission Refunds:</strong> If a refund was issued because a technical error prevented submission creation, your project is not evaluated. You may log in, pay the ₹{business.submissionFeeInr} review fee, and resubmit when ready.</li>
        </ul>
      </LegalSection>

      {/* Section 9 */}
      <LegalSection id="disputes-chargebacks" title="9. Payment Disputes & Chargebacks">
        <p>
          We encourage students to contact our dedicated support team directly at <a href={`mailto:${business.supportEmail}`} className="text-blue-600 font-semibold hover:underline">{business.supportEmail}</a> before filing a dispute or chargeback with their bank.
        </p>
        <p className="text-xs text-slate-600">
          Most billing concerns, duplicate debits, and technical issues can be resolved rapidly through our support desk. Initiating fraudulent or bad-faith chargebacks may result in immediate student account suspension and credential revocation.
        </p>
      </LegalSection>

      {/* Section 10 */}
      <LegalSection id="taxes-gst" title="10. Applicable Taxes & GST Disclosures">
        <p>
          The project evaluation fee of ₹{business.submissionFeeInr} is inclusive of all applicable taxes under Indian taxation regulations.{business.gstin ? <> GSTIN: <BusinessValue value={business.gstin} />.</> : <> CodeElevate is currently not registered under GST.</>}
        </p>
        <p className="text-xs text-slate-600">
          When an eligible refund is processed, the <strong>full 100% amount paid</strong> (inclusive of all applicable taxes) is refunded back to the student.
        </p>
      </LegalSection>

      {/* Section 11 */}
      <LegalSection id="billing-contact" title="11. Billing Support & Grievance Redressal">
        <p>
          For any payment questions, refund assistance, or transaction queries, please reach out to our team:
        </p>
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-6 space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider">Customer Care & Billing Email</p>
              <p className="font-bold text-blue-700 text-base">
                <a href={`mailto:${business.supportEmail}`} className="hover:underline">{business.supportEmail}</a>
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider">Customer Helpline</p>
              <p className="font-bold text-slate-900 text-base">
                <BusinessValue value={business.supportPhone} />
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider">Working Hours</p>
              <p className="text-xs text-slate-700">{business.supportHours}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider">Grievance Officer Contact</p>
              <p className="text-xs text-slate-700">
                <BusinessValue value={business.grievanceOfficer.name} /> ({business.grievanceOfficer.email})
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-200/80 text-xs text-slate-600">
            <strong>Turnaround Commitment:</strong> We acknowledge all billing grievances within <strong>48 hours</strong> and provide complete resolution within <strong>one (1) month (30 days)</strong>.
          </div>
        </div>
      </LegalSection>

      {/* Section 12 */}
      <LegalSection id="policy-updates" title="12. Policy Updates & Effective Date">
        <p>
          We reserve the right to amend this Refund & Cancellation Policy periodically to ensure alignment with banking norms, payment aggregator guidelines, and consumer protection laws.
        </p>
        <p className="text-xs text-slate-600">
          The <strong>&quot;Last updated&quot;</strong> date at the top of this document indicates the effective date of the latest revisions. Changes will be posted on this page and apply to transactions initiated after the update date.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
