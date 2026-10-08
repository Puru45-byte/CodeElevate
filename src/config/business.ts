/**
 * Central Business & Regulatory Configuration for CodeElevate
 *
 * All entity details, contact information, regulatory disclosures,
 * and grievance officer details are maintained in this single file.
 */

export interface BusinessAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface GrievanceOfficer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface BusinessConfig {
  legalName: string;
  brandName: string;
  address: BusinessAddress;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  grievanceOfficer: GrievanceOfficer;
  domain: string;
  gstin?: string;
  jurisdictionCity: string;
  jurisdictionState: string;
  submissionFeeInr: number;
  refundProcessingDays: string;
  lastUpdated: string;
}

export const business: BusinessConfig = {
  legalName: "Sanika Deore",
  brandName: "CodeElevate",
  address: {
    line1: "Pune",
    line2: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    country: "India",
  },
  supportEmail: "codeelevate.team@outlook.com",
  supportPhone: "+91 7972399690",
  supportHours: "Mon–Fri, 10:00 AM – 6:00 PM IST",
  grievanceOfficer: {
    name: "Sanika Deore",
    email: "codeelevate.team@outlook.com",
    phone: "+91 7972399690",
    address: "Pune, Maharashtra, India – 411028",
  },
  domain: "https://code-elevate-mu.vercel.app",
  gstin: undefined,
  jurisdictionCity: "Pune",
  jurisdictionState: "Maharashtra",
  submissionFeeInr: 99,
  refundProcessingDays: "5-7 business days",
  lastUpdated: "October 2026",
};

// Aliases for compatibility
export const businessConfig = business;
export const LEGAL_LAST_UPDATED = business.lastUpdated;

export const isPlaceholderValue = isPlaceholder;

/**
 * Returns true if a given value is the placeholder "[TO BE ADDED]" or is empty.
 */
export function isPlaceholder(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" || trimmed.includes("[TO BE ADDED]");
  }
  return false;
}

/**
 * Formats address into a readable string or returns "[TO BE ADDED]" if placeholder
 */
export function formatAddress(addr: BusinessAddress): string {
  if (
    isPlaceholder(addr.line1) &&
    isPlaceholder(addr.city) &&
    isPlaceholder(addr.state)
  ) {
    return "[TO BE ADDED]";
  }
  const parts = [
    !isPlaceholder(addr.line1) ? addr.line1 : "",
    !isPlaceholder(addr.line2) ? addr.line2 : "",
    !isPlaceholder(addr.city) ? addr.city : "",
    !isPlaceholder(addr.state) ? addr.state : "",
    !isPlaceholder(addr.pincode) ? addr.pincode : "",
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}
