import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ApplicationStatus, SubmissionStatus, EnrollmentStatus } from "@/types/database";

interface StatusBadgeProps {
  status: ApplicationStatus | SubmissionStatus | EnrollmentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
    case "VALID":
      return (
        <Badge variant="default" className={`bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status === "APPROVED" ? "Approved" : status === "COMPLETED" ? "Completed" : "Verified"}
        </Badge>
      );
    case "PENDING":
    case "UNDER_REVIEW":
      return (
        <Badge variant="warning" className={`bg-amber-50 text-amber-700 border-amber-200 gap-1 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {status === "PENDING" ? "Pending Review" : "Under Review"}
        </Badge>
      );
    case "ACTIVE":
      return (
        <Badge variant="info" className={`bg-blue-50 text-blue-700 border-blue-200 gap-1 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Active
        </Badge>
      );
    case "REJECTED":
    case "FAILED":
    case "REVOKED":
      return (
        <Badge variant="destructive" className={`bg-red-50 text-red-700 border-red-200 gap-1 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          {status === "REJECTED" ? "Rejected" : status === "FAILED" ? "Failed" : "Revoked"}
        </Badge>
      );
    case "FREE":
      return (
        <Badge variant="free" className={`bg-emerald-50 text-emerald-700 border-emerald-200 font-bold ${className}`}>
          FREE
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          {status}
        </Badge>
      );
  }
}
