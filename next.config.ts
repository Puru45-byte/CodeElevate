import type { NextConfig } from "next";

// ────────────────────────────────────────────────────────────────────────────
// Content-Security-Policy — single source of truth.
// Set DISABLE_CSP=true in .env to skip the CSP header entirely for debugging.
// ────────────────────────────────────────────────────────────────────────────
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + Razorpay checkout & CDN
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://*.razorpay.com",
  // Frames: Razorpay checkout & API (3-D Secure, risk-detection)
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
  // XHR / fetch / WebSocket
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://lumberjack-ext.razorpay.com https://*.razorpay.com",
  // Images
  "img-src 'self' data: blob: https:",
  // Styles
  "style-src 'self' 'unsafe-inline' https:",
  // Fonts
  "font-src 'self' data: https:",
  // Form submissions (Razorpay 3-D Secure bank redirects)
  "form-action 'self' https:",
];

const cspHeaderValue = cspDirectives.join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    const securityHeaders: { key: string; value: string }[] = [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
    ];

    // Append CSP unless explicitly disabled for debugging
    if (process.env.DISABLE_CSP !== "true") {
      securityHeaders.push({
        key: "Content-Security-Policy",
        value: cspHeaderValue,
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
