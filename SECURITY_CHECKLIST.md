# Security & Hardening Checklist

## 1. Secrets Management
- [x] Verified `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client (only accessed in `src/lib/supabase/admin.ts`).
- [x] Verified `RAZORPAY_KEY_SECRET` is never exposed to the client (only accessed in `src/lib/razorpay.ts`).
- [x] Ensured no `.env` files containing secrets are committed to the repository (using `.env.example`).

## 2. Row Level Security (RLS)
- [x] `profiles`: Read self, Update self (admins can do all).
- [x] `applications`: Read self, Insert self, no update/delete.
- [x] `enrollments`: Read self.
- [x] `tasks`: Read active tasks if enrolled and prerequisites met.
- [x] `task_submissions`: Read self, Insert self, Update self (only if UNDER_REVIEW).
- [x] `certificates`: Read self (or admin).
- [x] Storage `course-materials`: Read for enrolled students or admins.
- [x] Storage `certificates`: Read for certificate owner or admins.

## 3. Server-Side Role Validation
- [x] All API routes under `/api/admin/*` invoke `verifyAdminApi()` to check `role === 'admin'`.
- [x] All page routes under `/admin/*` invoke `requireAdmin()` to enforce role on the server before rendering.
- [x] The service-role Supabase client (`createAdminClient`) is ONLY used in trusted server contexts where the role has already been explicitly validated or is intentionally acting on behalf of the system (e.g., cron jobs, webhooks).

## 4. Payment Security
- [x] Orders are created strictly on the server (`/api/payments/create-order`). Client cannot manipulate the ₹99 price.
- [x] Razorpay Webhook signatures are validated using `crypto.timingSafeEqual` in `src/app/api/payments/webhook/route.ts` to prevent timing attacks.
- [x] Database transitions via `finalize_paid_submission` are atomic, preventing race conditions or double-counting payments.

## 5. Web Security Headers (in `next.config.ts`)
- [x] `X-Frame-Options: DENY` (prevents clickjacking)
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [x] `Content-Security-Policy` properly restricting domains, allowing only Razorpay and Supabase.

## 6. Rate Limiting
- [x] In-memory rate limiting applied to `/login`, `/api/applications/apply`, `/api/verify`, and `/api/payments/create-order` via `middleware.ts` to prevent brute force attacks.

## 7. Input Validation & File Uploads
- [x] Strict Zod schemas used on all server endpoints to sanitize inputs.
- [x] Profile photo bucket restricted to `image/jpeg`, `image/png`, `image/webp` with a strict 5MB limit.
- [x] Certificate PDF bucket restricted strictly to `application/pdf`.
- [x] Download routes generate short-lived (1 hour) signed URLs instead of using public buckets.

## 8. Cron Jobs
- [x] System tasks (expiring enrollments, reminder emails) are executed via `/api/cron/daily` protected by `CRON_SECRET`.
