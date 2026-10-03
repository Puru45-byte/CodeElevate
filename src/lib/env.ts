import { z } from "zod";

/**
 * Validates that all required environment variable NAMES are present.
 * Never logs or returns the actual values – only the names.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Call once at server startup (e.g. in instrumentation.ts or a route handler).
 * Throws a descriptive error listing every MISSING key – never prints values.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map(
      (issue) => `  • ${issue.path.join(".")}: ${issue.message}`
    );
    throw new Error(
      `❌ Missing or invalid environment variables:\n${missing.join("\n")}\n\n` +
        "Check your .env file and ensure all required keys are set."
    );
  }

  return result.data;
}
