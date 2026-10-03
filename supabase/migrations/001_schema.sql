-- ========================================================
-- CodeElevate Database Schema: 001_schema.sql
-- Description: Core extensions, custom ENUM types, sequences, tables, constraints, and indexes.
-- ========================================================

-- Enable necessary Postgres extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────

do $$ begin
  create type public.user_role as enum ('student', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.application_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.enrollment_status as enum ('ACTIVE', 'COMPLETED', 'EXPIRED', 'SUSPENDED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('LOCKED', 'AVAILABLE', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.certificate_status as enum ('ISSUED', 'REVOKED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.certificate_type as enum ('COMPLETION', 'CONFIRMATION');
exception when duplicate_object then null;
end $$;

-- Sequence for generating student IDs (e.g., CE20260001)
create sequence if not exists public.student_id_seq start 1001;

-- ────────────────────────────────────────────────────────
-- 2. PROFILES TABLE (Extends auth.users)
-- ────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  student_id text unique not null,
  role public.user_role default 'student'::public.user_role not null,
  first_name text,
  last_name text,
  gender text,
  date_of_birth date,
  phone text,
  email text not null,
  whatsapp text,
  photo_url text,
  address text,
  city text,
  state text,
  country text default 'India',
  pincode text,
  college text,
  degree text,
  department text,
  passout_year text,
  referral_code text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 3. INTERNSHIPS (Catalog / Programs)
-- ────────────────────────────────────────────────────────
create table if not exists public.internships (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  short_description text,
  category text not null check (category in ('Development', 'AI/ML', 'Cloud', 'Data', 'Cyber Security', 'Design', 'Other')),
  icon_url text,
  thumbnail_url text,
  technologies text[] default '{}'::text[] not null,
  duration_months int default 1 not null,
  is_free boolean default true not null,
  status text default 'PUBLISHED' not null check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 4. INTERNSHIP MODULES (Weekly tracks)
-- ────────────────────────────────────────────────────────
create table if not exists public.internship_modules (
  id uuid default gen_random_uuid() primary key,
  internship_id uuid references public.internships on delete cascade not null,
  title text not null,
  description text,
  position int not null default 1,
  created_at timestamptz default now() not null,
  unique(internship_id, position)
);

-- ────────────────────────────────────────────────────────
-- 5. TASKS (Practical local-deliverable milestones)
-- ────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  internship_id uuid references public.internships on delete cascade not null,
  module_id uuid references public.internship_modules on delete set null,
  title text not null,
  description text not null,
  requirements text[] default '{}'::text[] not null,
  deadline_days_after_start int default 7 not null,
  position int not null default 1,
  is_required boolean default true not null,
  status text default 'PUBLISHED' not null check (status in ('DRAFT', 'PUBLISHED')),
  created_at timestamptz default now() not null,
  unique(internship_id, module_id, position)
);

-- ────────────────────────────────────────────────────────
-- 6. TASK RESOURCES (Learning materials / guides)
-- ────────────────────────────────────────────────────────
create table if not exists public.task_resources (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks on delete cascade,
  module_id uuid references public.internship_modules on delete cascade,
  title text not null,
  type text default 'LINK' not null check (type in ('PPT', 'PDF', 'LINK', 'OTHER')),
  file_path text not null,
  file_size bigint,
  position int default 1 not null,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 7. APPLICATIONS (Student Internship Applications)
-- ────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  internship_id uuid references public.internships on delete cascade not null,
  start_date date default current_date not null,
  end_date date default (current_date + interval '1 month' - interval '1 day')::date not null,
  mode text default 'Remote' not null,
  type text default 'INTERNSHIP' not null,
  status public.application_status default 'PENDING'::public.application_status not null,
  admin_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Unique partial index: exactly one active PENDING or APPROVED application per user per internship
create unique index if not exists idx_unique_active_application 
  on public.applications (user_id, internship_id) 
  where status in ('PENDING', 'APPROVED');

-- ────────────────────────────────────────────────────────
-- 8. ENROLLMENTS (Active Student Batches)
-- ────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  internship_id uuid references public.internships on delete cascade not null,
  application_id uuid references public.applications on delete set null,
  start_date date default current_date not null,
  end_date date not null,
  status public.enrollment_status default 'ACTIVE'::public.enrollment_status not null,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, internship_id)
);

-- ────────────────────────────────────────────────────────
-- 9. TASK UNLOCKS (Manual admin unlocks)
-- ────────────────────────────────────────────────────────
create table if not exists public.task_unlocks (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  unlocked_by uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null,
  unique(enrollment_id, task_id)
);

-- ────────────────────────────────────────────────────────
-- 10. PAYMENTS (Fixed ₹99 review fee ledger)
-- ────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique,
  amount_paise int default 9900 not null,
  currency text default 'INR' not null,
  status public.payment_status default 'CREATED'::public.payment_status not null,
  github_url text,
  comments text,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 11. TASK SUBMISSIONS (Evaluated GitHub repos)
-- ────────────────────────────────────────────────────────
create table if not exists public.task_submissions (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  payment_id uuid references public.payments on delete set null unique,
  github_url text not null,
  comments text,
  status public.task_status default 'UNDER_REVIEW'::public.task_status not null check (status in ('UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  attempt_no int default 1 not null,
  submitted_at timestamptz default now() not null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles on delete set null,
  feedback text,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 12. CERTIFICATE TEMPLATES
-- ────────────────────────────────────────────────────────
create table if not exists public.certificate_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  is_default boolean default false not null,
  config jsonb default '{"heading": "Certificate of Internship Completion", "organization": "CodeElevate Inc.", "signatory_title": "Academic Director", "accent_color": "#1D4ED8"}'::jsonb not null,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 13. CERTIFICATES & NUMBER COUNTERS
-- ────────────────────────────────────────────────────────
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  certificate_number text unique not null,
  url_slug text unique not null,
  user_id uuid references public.profiles on delete cascade not null,
  enrollment_id uuid references public.enrollments on delete cascade not null unique,
  internship_id uuid references public.internships on delete cascade not null,
  type public.certificate_type default 'COMPLETION'::public.certificate_type not null,
  status public.certificate_status default 'ISSUED'::public.certificate_status not null,
  issued_at timestamptz default now() not null,
  revoked_at timestamptz,
  revoked_reason text,
  pdf_path text,
  template_id uuid references public.certificate_templates on delete set null,
  created_at timestamptz default now() not null
);

create table if not exists public.certificate_counters (
  year int not null,
  type public.certificate_type not null,
  last_number int default 0 not null,
  primary key (year, type)
);

create table if not exists public.certificate_verification_logs (
  id uuid default gen_random_uuid() primary key,
  certificate_id uuid references public.certificates on delete set null,
  searched_number text not null,
  found boolean not null,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 14. NOTIFICATIONS
-- ────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  body text not null,
  type text default 'SYSTEM' not null,
  is_read boolean default false not null,
  link text,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────
-- 15. PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_internships_slug on public.internships(slug);
create index if not exists idx_internships_status on public.internships(status);
create index if not exists idx_modules_internship_pos on public.internship_modules(internship_id, position);
create index if not exists idx_tasks_internship_pos on public.tasks(internship_id, position);
create index if not exists idx_tasks_module on public.tasks(module_id);
create index if not exists idx_applications_user on public.applications(user_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_status on public.enrollments(status);
create index if not exists idx_submissions_enrollment on public.task_submissions(enrollment_id);
create index if not exists idx_submissions_user on public.task_submissions(user_id);
create index if not exists idx_payments_order on public.payments(razorpay_order_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);
create index if not exists idx_certificates_number on public.certificates(certificate_number);
create index if not exists idx_certificates_slug on public.certificates(url_slug);
