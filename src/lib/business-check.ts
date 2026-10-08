import { business, isPlaceholder } from "@/config/business";

/**
 * Checks all fields in the business config object and returns the keys
 * that are still equal to "[TO BE ADDED]".
 */
export function getMissingBusinessFields(): string[] {
  const missing: string[] = [];

  function traverse(obj: Record<string, unknown>, prefix = "") {
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        traverse(value as Record<string, unknown>, fieldPath);
      } else if (isPlaceholder(value)) {
        missing.push(fieldPath);
      }
    }
  }

  traverse(business as unknown as Record<string, unknown>);
  return missing;
}

/**
 * Logs a formatted console warning during build/dev if any business fields
 * are still set to "[TO BE ADDED]".
 */
export function checkBusinessConfig(): void {
  const missingFields = getMissingBusinessFields();
  if (missingFields.length > 0) {
    console.warn(
      `\n⚠️  [CodeElevate Business Config Warning] The following business configuration fields are still set to "[TO BE ADDED]":\n` +
        missingFields.map((field) => `   • ${field}`).join("\n") +
        `\n   Please update these values in "src/config/business.ts" before production launch.\n`
    );
  }
}

// Automatically execute check on server-side during build/dev runtime
if (typeof window === "undefined") {
  checkBusinessConfig();
}
