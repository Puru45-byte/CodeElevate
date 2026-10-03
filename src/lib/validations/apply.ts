import { z } from "zod";

// Phone: Exactly 10 digits, starts with 6, 7, 8, or 9
const phoneRegex = /^[6-9]\d{9}$/;
// Pincode: Exactly 6 digits
const pincodeRegex = /^\d{6}$/;
// Password: Min 8 chars, at least 1 letter and 1 number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

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

export const step5AccountSchema = z
  .object({
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters and contain at least one letter and one number"
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    referralCode: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Composite schema for new user registration & application
export const fullApplicationSchema = z
  .object({
    // Step 1
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

    // Step 2
    address: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    country: z.string().trim().min(1, "Country is required").default("India"),
    pincode: z
      .string()
      .trim()
      .regex(pincodeRegex, "Pincode must be exactly 6 digits"),

    // Step 3
    college: z.string().trim().min(1, "College/University is required"),
    degree: z.string().trim().min(1, "Degree is required"),
    department: z.string().trim().min(1, "Department is required"),
    passoutYear: z.string().trim().min(1, "Passout Year is required"),

    // Step 4
    internshipId: z.string().min(1, "Internship selection is required"),
    domain: z.string().min(1, "Domain is required"),
    type: z.string().default("Internship"),
    mode: z.string().default("Remote"),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),

    // Step 5 (Optional if already logged in)
    password: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    referralCode: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If password provided, validate match
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type Step1PersonalData = z.infer<typeof step1PersonalSchema>;
export type Step2AddressData = z.infer<typeof step2AddressSchema>;
export type Step3EducationData = z.infer<typeof step3EducationSchema>;
export type Step4InternshipData = z.infer<typeof step4InternshipSchema>;
export type Step5AccountData = z.infer<typeof step5AccountSchema>;
export type FullApplicationData = z.infer<typeof fullApplicationSchema>;
