// ─── Payment ────────────────────────────────────────────────────────
/** Server-side constant. Amount in paise (₹99 = 9900p). Never accept from client. */
export const SUBMISSION_FEE_PAISE = 9900;
export const SUBMISSION_FEE_RUPEES = SUBMISSION_FEE_PAISE / 100;
export const PAYMENT_CURRENCY = "INR";
/** Config constant: whether resubmission after rejection requires another fee */
export const REQUIRE_PAYMENT_ON_RESUBMIT = false;

// ─── Internship rules ───────────────────────────────────────────────
export const INTERNSHIP_DURATION_MONTHS = 1;
export const DEFAULT_MODE = "Remote" as const;

// ─── Branding ───────────────────────────────────────────────────────
export const APP_NAME = "CodeElevate";
export const APP_TAGLINE = "Learn. Build. Get Certified.";
export const APP_DESCRIPTION =
  "The premier practical internship and career acceleration platform. " +
  "Gain real-world engineering experience with curated milestones, " +
  "verified project reviews, and industry-recognized certificates.";
export const APP_ORG = "CodeElevate Inc.";

// ─── Status enums ───────────────────────────────────────────────────
export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const ENROLLMENT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
} as const;

export const SUBMISSION_STATUS = {
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const PAYMENT_STATUS = {
  CREATED: "CREATED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
} as const;

export const CERTIFICATE_STATUS = {
  VALID: "VALID",
  REVOKED: "REVOKED",
} as const;

// ─── Domain categories & icons ──────────────────────────────────────
export const DOMAIN_CATEGORIES = [
  "Web Development",
  "Artificial Intelligence",
  "Cloud Computing",
  "Software Engineering",
  "Data Science",
  "Cybersecurity",
] as const;

export type DomainCategory = (typeof DOMAIN_CATEGORIES)[number];

export const DOMAIN_ICONS: Record<string, string> = {
  "Web Development": "/icons/react.png",
  "Artificial Intelligence": "/icons/python.png",
  "Cloud Computing": "/icons/blue-cloud.png",
  "Software Engineering": "/icons/java.png",
  "Data Science": "/icons/ai-brain.png",
  "Cybersecurity": "/icons/blue-shield.png",
  default: "/icons/open-book.png",
};

// ─── Dropdown Options for Application ─────────────────────────────
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const DEGREES = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "BCA",
  "MCA",
  "MBA",
  "M.Tech",
  "Diploma",
  "Other",
] as const;

export const GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
] as const;

export const PASSOUT_YEARS = [
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
] as const;

// ─── Navigation links ───────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Internships", href: "/internships" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Verify Certificate", href: "/verify" },
  { label: "About Us", href: "/about" },
] as const;
