import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const CONTACT_TOPICS = [
  "Application",
  "Payment/Refund",
  "Certificate",
  "Technical issue",
  "Other",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "Phone must be a valid 10-digit Indian number starting with 6, 7, 8, or 9"
    )
    .or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS, {
    errorMap: () => ({ message: "Please select a valid topic" }),
  }),
  paymentIdRef: z
    .string()
    .trim()
    .max(100, "Payment ID cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters long")
    .max(2000, "Message cannot exceed 2,000 characters"),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to the processing of your data to submit this inquiry",
    }),
  }),
  // Honeypot field for anti-bot protection
  website_hp: z.string().optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
