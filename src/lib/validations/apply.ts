import { z } from "zod";

// Phone: Exactly 10 digits, starts with 6, 7, 8, or 9
const phoneRegex = /^[6-9]\d{9}$/;
// Pincode: Exactly 6 digits
const pincodeRegex = /^\d{6}$/;

export const step1PersonalSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required"),
  lastName: z.string().trim().min(1, "Last Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Phone must be exactly 10 digits starting with 6, 7, 8, or 9"),
  email: z.string().trim().email("Please enter a valid email address"),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "WhatsApp number must be 10 digits starting with 6, 7, 8, or 9"
    )
    .or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().trim().min(1, "Resume / CV is required. Please upload your resume."),
  resumeFileName: z.string().optional().or(z.literal("")),
});

export const step2AddressSchema = z.object({
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required").default("India"),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, "Pincode must be exactly 6 digits"),
});

export const step3EducationSchema = z.object({
  college: z.string().trim().min(1, "College/University is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  department: z.string().trim().min(1, "Department / Branch is required"),
  passoutYear: z.string().trim().min(1, "Passout Year is required"),
});

export const step4InternshipSchema = z.object({
  internshipId: z.string().min(1, "Internship selection is required"),
  domain: z.string().min(1, "Domain is required"),
  type: z.string().default("Internship"),
  mode: z.string().default("Remote"),
  startDate: z
    .string()
    .min(1, "Start Date is required")
    .refine((val) => {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Start Date must be today or later"),
  endDate: z.string().min(1, "End Date is required"),
});

export const fullApplicationSchema = z.object({
  // Step 1: Personal (authoritative first/last name & email are derived from authenticated user on server)
  firstName: z.string().trim().min(1, "First Name is required"),
  lastName: z.string().trim().min(1, "Last Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Phone must be exactly 10 digits starting with 6, 7, 8, or 9"),
  email: z.string().trim().email("Please enter a valid email address"),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "WhatsApp number must be 10 digits starting with 6, 7, 8, or 9"
    )
    .or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
  photoBase64: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().trim().min(1, "Resume / CV is required. Please upload your resume."),
  resumeFileName: z.string().optional().or(z.literal("")),
  resumeBase64: z.string().optional().or(z.literal("")),

  // Step 2: Address
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required").default("India"),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, "Pincode must be exactly 6 digits"),

  // Step 3: Education
  college: z.string().trim().min(1, "College/University is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  department: z.string().trim().min(1, "Department is required"),
  passoutYear: z.string().trim().min(1, "Passout Year is required"),

  // Step 4: Internship
  internshipId: z.string().min(1, "Internship selection is required"),
  domain: z.string().min(1, "Domain is required"),
  type: z.string().default("Internship"),
  mode: z.string().default("Remote"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});

export type Step1PersonalData = z.infer<typeof step1PersonalSchema>;
export type Step2AddressData = z.infer<typeof step2AddressSchema>;
export type Step3EducationData = z.infer<typeof step3EducationSchema>;
export type Step4InternshipData = z.infer<typeof step4InternshipSchema>;
export type FullApplicationData = z.infer<typeof fullApplicationSchema>;

