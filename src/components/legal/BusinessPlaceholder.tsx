import React from "react";
import { isPlaceholderValue } from "@/config/business";

interface BusinessValueProps {
  value: string | undefined;
  fallback?: string;
  className?: string;
}

/**
 * Renders a business value from config.
 * In development, if the value is missing or "[TO BE ADDED]", it renders
 * an eye-catching inline tag "[TO BE ADDED]" to alert maintainers.
 */
export function BusinessValue({
  value,
  fallback = "[TO BE ADDED]",
  className = "",
}: BusinessValueProps) {
  const isPlaceholder = isPlaceholderValue(value);

  if (isPlaceholder) {
    return (
      <span
        title="Business value pending configuration in src/config/business.ts"
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 print:bg-transparent print:border-none print:p-0 ${className}`}
      >
        {fallback}
      </span>
    );
  }

  return <span className={className}>{value}</span>;
}
