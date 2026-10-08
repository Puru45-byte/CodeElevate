import React from "react";
import { CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { business } from "@/config/business";

export function RefundSummary({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2.5 text-xs text-slate-700 ${className}`}
    >
      <div className="flex items-center gap-1.5 font-bold text-blue-900 text-sm">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
        <span>Refund & Submission Fee Summary</span>
      </div>
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>100% Free Learning:</strong> Enrolling and accessing courses is ₹0. The ₹{business.submissionFeeInr} fee is charged only when submitting your project for review.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <RotateCcw className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Free Resubmissions:</strong> If your project is rejected, you receive mentor feedback and can resubmit for ₹0 extra.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Guaranteed Duplicate Refunds:</strong> Double debits or technical errors are refunded 100% to your original payment source within {business.refundProcessingDays}.
          </span>
        </li>
      </ul>
    </div>
  );
}
