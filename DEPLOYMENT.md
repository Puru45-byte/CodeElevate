# Deployment Guide for Vercel

## 1. Prerequisites
- A GitHub repository containing the CodeElevate source code.
- A Vercel account linked to your GitHub.
- A Supabase project (Live/Prod instance).
- A Razorpay account (Live mode).

## 2. Environment Variables in Vercel
When importing the project in Vercel, add the following Environment Variables before deploying:

- `NEXT_PUBLIC_SITE_URL` (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Live Key ID)
- `RAZORPAY_KEY_SECRET` (Live Key Secret)
- `RAZORPAY_WEBHOOK_SECRET` (Your chosen secure string for webhook validation)
- `CRON_SECRET` (A secure random string, e.g., `openssl rand -hex 32`)

*Note: For email support, optionally add `ENABLE_EMAILS=true` and `RESEND_API_KEY`.*

## 3. Supabase Auth Configuration
In your Supabase Dashboard -> Authentication -> URL Configuration:
1. Set the **Site URL** to your production domain (e.g., `https://yourdomain.com`).
2. Add to **Redirect URLs**: `https://yourdomain.com/auth/callback` and `https://yourdomain.com/dashboard`.

## 4. Razorpay Webhook Setup
1. Go to Razorpay Dashboard (Live mode).
2. Navigate to Account & Settings -> Webhooks.
3. Click "Add New Webhook".
4. **Webhook URL**: `https://yourdomain.com/api/payments/webhook`
5. **Secret**: Enter the exact string you used for `RAZORPAY_WEBHOOK_SECRET` in Vercel.
6. **Active Events**: Check `order.paid` and `payment.failed`.
7. Save.

## 5. Go-Live Checklist
- [ ] Database Migrations: Run all `supabase/migrations/*.sql` files sequentially in the Prod Supabase SQL Editor.
- [ ] Seed Data (Optional): Run `005_seed.sql` to populate default admins or certificate templates.
- [ ] Storage Buckets: Ensure `004_storage.sql` ran correctly and bucket RLS is active.
- [ ] Vercel Build: Check Vercel deployments tab to ensure a successful build (`next build`).
- [ ] Test Transaction: Complete one end-to-end task submission (can use Razorpay test keys temporarily if needed before full go-live).
