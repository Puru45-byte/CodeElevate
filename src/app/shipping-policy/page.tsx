import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { BusinessValue } from "@/components/legal/BusinessPlaceholder";
import { LegalPageLayout, LegalSection, TocItem } from "@/components/legal/LegalPageLayout";
import {
  Truck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | CodeElevate",
  description:
    "Information regarding 100% digital service delivery, course access provisioning, submission processing, and electronic certificate generation on CodeElevate.",
  openGraph: {
    title: "Shipping & Delivery Policy | CodeElevate",
    description:
      "CodeElevate provides purely online, digital internship programs and digital credentials. Learn about our delivery timelines and instant electronic access.",
  },
};

const TOC: TocItem[] = [
  { id: "digital-summary", title: "1. 100% Digital Delivery & No Physical Shipping" },
  { id: "delivery-table", title: "2. Digital Delivery Schedule & Fulfillment Table" },
  { id: "no-physical-goods", title: "3. No Physical Deliveries, Couriers, or Shipping Charges" },
  { id: "delivery-issues", title: "4. Resolving Digital Access & Notification Issues" },
  { id: "service-availability", title: "5. Service Availability & Third-Party Delays" },
  { id: "support-contact", title: "6. Customer Support & Contact Details" },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping & Delivery Policy"
      intro="All services, learning materials, internship curriculum tracks, and completion credentials provided by CodeElevate are 100% digital and delivered online. We do not dispatch or deliver physical goods."
      badge="100% Digital Fulfillment"
      toc={TOC}
      activeRoute="/shipping-policy"
    >
      {/* Top Summary Box */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-indigo-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
          <Truck className="h-5 w-5 text-blue-600 shrink-0" />
          <span>Summary: Purely Digital Delivery</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Zero Physical Shipping:</strong> No physical parcels, courier packages, or postal dispatches are involved.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Instant Online Access:</strong> Application confirmation, task lists, and dashboard tools are available immediately upon approval.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Downloadable PDF Certificates:</strong> Issued digitally with verifiable QR codes directly in your student dashboard upon review approval.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-white/80 rounded-xl p-3 border border-blue-100 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">No Shipping Fees:</strong> You will never be charged shipping, freight, courier, or packaging fees.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <LegalSection id="digital-summary" title="1. 100% Digital Delivery & No Physical Shipping">
        <p>
          <strong>{business.brandName}</strong>, operated by <BusinessValue value={business.legalName} />, is an online practical educational technology platform.
        </p>
        <p>
          All products, services, study resources, internship task assignments, and credentials provided on our platform are <strong>entirely digital</strong>. Service delivery takes place through our secure cloud web application at{" "}
          <Link href="/" className="text-blue-600 font-semibold underline hover:text-blue-800">{business.domain}</Link> and via registered email notifications.
        </p>
      </LegalSection>

      {/* Section 2 */}
      <LegalSection id="delivery-table" title="2. Digital Delivery Schedule & Fulfillment Table">
        <p>
          The table below outlines each service component, how it is digitally fulfilled, and the expected delivery timeframe:
        </p>

        {/* Responsive Fulfillment Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-900">
                <th className="p-3.5 font-bold">Item / Service Component</th>
                <th className="p-3.5 font-bold">Delivered How</th>
                <th className="p-3.5 font-bold">Delivery Timeframe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Account & Application Confirmation</td>
                <td className="p-3.5">On-screen notification & automated email confirmation</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Immediate (within seconds)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Course & Task List Access</td>
                <td className="p-3.5">Unlocked inside the Student Dashboard upon administrative review</td>
                <td className="p-3.5">
                  Usually within <strong>2 to 3 working days</strong> of application submission (estimated, subject to review)
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Curriculum & Learning Materials</td>
                <td className="p-3.5">Directly viewable and downloadable in the online dashboard</td>
                <td className="p-3.5">
                  Instant access upon track approval
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Project Submission Confirmation</td>
                <td className="p-3.5">On-screen receipt & dashboard status changes to &quot;Under Review&quot;</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Immediate upon verified ₹{business.submissionFeeInr} payment
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Mentor Review & Feedback Report</td>
                <td className="p-3.5">Visible in Student Dashboard & sent via email notification</td>
                <td className="p-3.5">
                  Estimated <strong>5 to 7 working days</strong> from payment confirmation (estimate only; may vary by volume)
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-semibold text-slate-900">Certificate of Completion</td>
                <td className="p-3.5">High-resolution downloadable PDF in &quot;My Certificates&quot; + public QR verification URL</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                    Immediate upon mentor review approval
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          * Note: Delivery turnaround times are estimates provided for planning purposes and may vary slightly during peak submission windows or public holidays.
        </p>
      </LegalSection>

      {/* Section 3 */}
      <LegalSection id="no-physical-goods" title="3. No Physical Deliveries, Couriers, or Shipping Charges">
        <p>
          Because CodeElevate operates exclusively as a digital learning and credentialing platform:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
          <li>We do NOT use couriers, postal services (India Post), or freight carriers.</li>
          <li>We do NOT print or ship physical paper certificates or hard-copy study kits.</li>
          <li>Students will never be billed for shipping fees, delivery charges, fuel surcharges, or customs duties.</li>
          <li>If CodeElevate introduces optional physical framed certificate delivery in the future, this policy will be amended with explicit shipping rates and delivery partners prior to accepting physical orders.</li>
        </ul>
      </LegalSection>

      {/* Section 4 */}
      <LegalSection id="delivery-issues" title="4. Resolving Digital Access & Notification Issues">
        <p>
          If your course access, submission confirmation, review feedback, or certificate does not appear within the estimated timelines:
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs sm:text-sm text-slate-700">
          <p className="font-bold text-slate-900">Recommended Troubleshooting Steps:</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Check Dashboard Direct Status:</strong> Log in to your <Link href="/dashboard" className="text-blue-600 font-medium hover:underline">Student Dashboard</Link> to view real-time status updates directly.
            </li>
            <li>
              <strong>Check Email Spam/Promotions Folders:</strong> Automated delivery notifications may occasionally be routed to your &quot;Spam&quot;, &quot;Updates&quot;, or &quot;Promotions&quot; folders by your email provider.
            </li>
            <li>
              <strong>Contact Support Desk:</strong> If you cannot locate your access or certificate after the stated timeframe, email our support team at <a href={`mailto:${business.supportEmail}`} className="text-blue-600 font-bold hover:underline">{business.supportEmail}</a> with your registered email address and student ID. Our support team will resolve your access ticket promptly.
            </li>
          </ol>
        </div>
      </LegalSection>

      {/* Section 5 */}
      <LegalSection id="service-availability" title="5. Service Availability & Third-Party Delays">
        <p>
          While we strive for 99.9% platform uptime:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
          <li>Occasional scheduled maintenance, server upgrades, or unexpected cloud provider outages (Supabase, Vercel) may temporarily delay digital provisioning.</li>
          <li>CodeElevate is not liable for digital delivery delays caused by third-party network outages, email server rejections, or the student&apos;s personal internet connection or device limitations.</li>
        </ul>
      </LegalSection>

      {/* Section 6 */}
      <LegalSection id="support-contact" title="6. Customer Support & Contact Details">
        <p>
          For any questions regarding digital fulfillment, course access, or credential downloads, please contact us:
        </p>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Support Email</p>
              <p className="font-bold text-blue-700 text-base">
                <a href={`mailto:${business.supportEmail}`} className="hover:underline">{business.supportEmail}</a>
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Helpline Number</p>
              <p className="font-bold text-slate-900 text-base">
                <BusinessValue value={business.supportPhone} />
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Operational Hours</p>
              <p className="text-xs text-slate-700">{business.supportHours}</p>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase tracking-wider">Grievance Redressal</p>
              <p className="text-xs text-slate-700">
                <BusinessValue value={business.grievanceOfficer.name} /> ({business.grievanceOfficer.email})
              </p>
            </div>
          </div>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
}
