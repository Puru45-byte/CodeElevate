export type UserRole = "student" | "admin";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "EXPIRED" | "SUSPENDED";

export type TaskStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type SubmissionStatus = TaskStatus;

export type PaymentStatus = "CREATED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type CertificateStatus = "ISSUED" | "REVOKED" | "VALID";

export type CertificateType = "COMPLETION" | "CONFIRMATION";

export type InternshipCategory =
  | "Development"
  | "AI/ML"
  | "Cloud"
  | "Data"
  | "Cyber Security"
  | "Design"
  | "Other";

export type InternshipStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ResourceType = "PPT" | "PDF" | "LINK" | "OTHER";

export interface Profile {
  id: string;
  student_id: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  email: string;
  whatsapp?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  college?: string | null;
  degree?: string | null;
  department?: string | null;
  passout_year?: string | null;
  referral_code?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Internship {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string | null;
  category: InternshipCategory | string;
  domain?: string; // UI alias
  icon_url?: string | null;
  icon?: string; // UI alias
  thumbnail_url?: string | null;
  technologies?: string[];
  skills?: string[]; // UI alias
  duration_months?: number;
  duration_weeks?: number; // UI alias
  is_free?: boolean;
  status: InternshipStatus | string;
  created_at: string;
  updated_at?: string;
  modules?: InternshipModule[];
  tasks?: Task[];
}

/** Backward compatibility alias */
export type Course = Internship;

export interface InternshipModule {
  id: string;
  internship_id: string;
  title: string;
  description?: string | null;
  position: number;
  created_at: string;
  tasks?: Task[];
}

export interface TaskResource {
  id?: string;
  task_id?: string | null;
  module_id?: string | null;
  title: string;
  type?: ResourceType | string;
  file_path?: string;
  url?: string; // UI alias
  file_size?: number | null;
  position?: number;
  created_at?: string;
}

export interface Task {
  id: string;
  internship_id?: string;
  course_id?: string; // UI alias
  module_id?: string | null;
  title: string;
  description: string;
  requirements?: string[];
  deadline_days_after_start?: number;
  deadline_days?: number; // UI alias
  position?: number;
  task_number?: number; // UI alias
  is_required?: boolean;
  status?: "DRAFT" | "PUBLISHED" | string;
  created_at: string;
  resources?: TaskResource[];
  module?: InternshipModule;
}

export interface Application {
  id: string;
  user_id: string;
  internship_id?: string;
  course_id?: string; // UI alias
  start_date?: string;
  end_date?: string;
  mode?: string;
  type?: string;
  status: ApplicationStatus;
  admin_note?: string | null;
  created_at: string;
  applied_at?: string; // UI alias
  updated_at?: string;
  internship?: Internship;
  course?: Internship; // UI alias
  profile?: Profile;
}

export interface Enrollment {
  id: string;
  user_id: string;
  internship_id?: string;
  course_id?: string; // UI alias
  application_id?: string | null;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string;
  internship?: Internship;
  course?: Internship; // UI alias
  profile?: Profile;
  submissions?: TaskSubmission[];
}

export interface TaskUnlock {
  id: string;
  enrollment_id: string;
  task_id: string;
  unlocked_by?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  enrollment_id: string;
  task_id?: string | null;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  github_url?: string | null;
  comments?: string | null;
  paid_at?: string | null;
  failure_reason?: string | null;
  created_at: string;
}

export interface InternshipSubmission {
  id: string;
  enrollment_id: string;
  user_id: string;
  internship_id?: string | null;
  payment_id?: string | null;
  github_url: string;
  comments?: string | null;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PENDING_PAYMENT" | string;
  attempt_no?: number;
  feedback?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at?: string;
  updated_at?: string;
  enrollment?: Enrollment;
  internship?: Internship;
  profile?: Profile;
  payment?: Payment;
}

export interface TaskSubmission {
  id: string;
  enrollment_id: string;
  task_id: string;
  user_id: string;
  payment_id?: string | null;
  github_url: string;
  github_repo_url?: string; // UI alias
  comments?: string | null;
  status: TaskStatus;
  attempt_no?: number;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  feedback?: string | null;
  admin_feedback?: string | null; // UI alias
  task?: Task;
  profile?: Profile;
  enrollment?: Enrollment;
  payment?: Payment;
}

/** Backward compatibility alias */
export type Submission = TaskSubmission;



export interface CertificateTemplate {
  id: string;
  name: string;
  is_default: boolean;
  config: {
    heading?: string;
    subheading?: string;
    body_text?: string;
    organization?: string;
    signatory_name?: string;
    signatory_title?: string;
    logo_url?: string;
    signature_url?: string;
    primary_color?: string;
    secondary_color?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  url_slug?: string;
  user_id: string;
  enrollment_id: string;
  internship_id?: string;
  course_id?: string; // UI alias
  type?: CertificateType;
  certificate_type?: string; // UI alias
  status: CertificateStatus;
  issued_at: string;
  issue_date?: string; // UI alias
  student_name?: string; // Joined alias
  student_code?: string; // Joined alias
  course_title?: string; // Joined alias
  duration?: string; // Joined alias
  organization?: string; // Joined alias
  verification_url?: string; // Joined alias
  revoked_at?: string | null;
  revoked_reason?: string | null;
  pdf_path?: string | null;
  pdf_url?: string | null;
  template_id?: string | null;
  created_at?: string;
  internship?: Internship;
  profile?: Profile;
  template?: CertificateTemplate;
}

export interface PublicCertificateVerification {
  certificate_number: string;
  url_slug?: string;
  student_name: string;
  student_id: string;
  student_code?: string; // UI alias
  internship_title?: string;
  course_title?: string; // UI alias
  certificate_type: string;
  issue_date: string;
  duration: string;
  status: CertificateStatus;
  organization: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  message?: string; // UI alias
  type: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface ComputedTaskStatus {
  task_id: string;
  module_id: string;
  task_title: string;
  module_title: string;
  module_position: number;
  task_position: number;
  is_required: boolean;
  deadline_date: string;
  submission_status?: TaskStatus | null;
  computed_status: TaskStatus;
  github_url?: string | null;
  feedback?: string | null;
  submission_id?: string | null;
}

export interface EnrollmentProgress {
  approved_required: number;
  total_required: number;
  percent: number;
}
