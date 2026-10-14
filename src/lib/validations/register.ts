import { z } from "zod";

// Allowed name characters: letters, spaces, dots, hyphens, apostrophes
const nameRegex = /^[A-Za-z\s.\-']+$/;

// Password: min 8 chars, at least 1 letter and 1 number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First Name is required")
      .regex(nameRegex, "Name can only contain letters, spaces, dots, hyphens and apostrophes"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last Name is required")
      .regex(nameRegex, "Name can only contain letters, spaces, dots, hyphens and apostrophes"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters and contain at least one letter and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the Terms & Conditions and Privacy Policy",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
