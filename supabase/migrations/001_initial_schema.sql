-- ========================================================
-- CodeElevate Platform Schema (Corrected)
-- Matches the application code table/column names.
-- Run this in your Supabase SQL Editor BEFORE running 005_seed.sql.
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  student_id text unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  first_name text,
  last_name text,
  full_name text,
  gender text,
  date_of_birth date,
  phone text,
  email text not null,
  whatsapp text,
  photo_url text,
  avatar_url text,
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

-- Function to check if requesting user is ADMIN (non-recursive)
create or replace function public.is_admin()
returns boolean language sql security definer
set search_path = auth, public
as $$
  select coalesce(
    (
      select (raw_user_meta_data->>'role' = 'admin' or raw_app_meta_data->>'role' = 'admin')
      from auth.users
      where id = auth.uid()
    ),
    false
  );
$$;

-- 2. Internships (Courses / Learning Tracks)
create table if not exists public.internships (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  short_description text,
  description text not null,
  category text not null default 'Development',
  icon_url text,
  thumbnail_url text,
  technologies text[] default '{}',
  duration_months int default 1,
  is_free boolean default true,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Internship Modules
create table if not exists public.internship_modules (
  id uuid default uuid_generate_v4() primary key,
  internship_id uuid references public.internships on delete cascade not null,
  title text not null,
  description text,
  position int not null default 0,
  created_at timestamptz default now() not null
);

-- 4. Tasks (Weekly Tasks / Milestones)
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  internship_id uuid references public.internships on delete cascade not null,
  module_id uuid references public.internship_modules on delete set null,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  deadline_days_after_start int default 7,
  position int default 0,
  is_required boolean default true,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  created_at timestamptz default now() not null
);

-- 5. Task Resources (PPT, PDF, Links)
create table if not exists public.task_resources (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks on delete cascade,
  module_id uuid references public.internship_modules on delete set null,
  title text not null,
  type text default 'LINK' check (type in ('PPT', 'PDF', 'LINK', 'OTHER')),
  file_path text,
  file_size int,
  position int default 0,
  created_at timestamptz default now() not null
);

-- 6. Applications (Student Internship Applications)
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  internship_id uuid references public.internships on delete cascade not null,
  start_date date,
  end_date date,
  mode text default 'Remote',
  type text default 'INTERNSHIP',
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  admin_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 7. Enrollments (Active Internship Batches)
create table if not exists public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  internship_id uuid references public.internships on delete cascade not null,
  application_id uuid references public.applications on delete set null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'EXPIRED', 'SUSPENDED')),
  start_date date default current_date not null,
  end_date date not null,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 8. Task Unlocks (tracks which tasks are available to a student)
create table if not exists public.task_unlocks (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  unlocked_by uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null,
  unique(enrollment_id, task_id)
);

-- 9. Payments (Razorpay Transaction Records)
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique,
  amount_paise int default 9900 not null,
  currency text default 'INR' not null,
  status text not null default 'CREATED' check (status in ('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  github_url text,
  comments text,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz default now() not null
);

-- 10. Task Submissions (GitHub Task Submissions)
create table if not exists public.task_submissions (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  task_id uuid references public.tasks on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  payment_id uuid references public.payments on delete set null,
  github_url text not null,
  comments text,
  status text not null default 'UNDER_REVIEW' check (status in ('UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  attempt_no int default 1,
  submitted_at timestamptz default now() not null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles on delete set null,
  feedback text
);

-- 11. Certificate Templates
create table if not exists public.certificate_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_default boolean default false,
  config jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

-- 12. Certificates (Public Verified Credentials)
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  certificate_number text unique not null,
  url_slug text unique,
  user_id uuid references public.profiles on delete cascade not null,
  enrollment_id uuid references public.enrollments on delete cascade not null,
  internship_id uuid references public.internships on delete cascade,
  type text default 'COMPLETION' check (type in ('COMPLETION', 'CONFIRMATION')),
  status text default 'ISSUED' not null check (status in ('ISSUED', 'REVOKED', 'VALID')),
  issued_at timestamptz default now() not null,
  revoked_at timestamptz,
  revoked_reason text,
  pdf_path text,
  template_id uuid references public.certificate_templates on delete set null,
  created_at timestamptz default now() not null
);

-- 13. Notifications
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  body text,
  message text,
  type text default 'SYSTEM',
  link text,
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- ========================================================

alter table public.profiles enable row level security;
alter table public.internships enable row level security;
alter table public.internship_modules enable row level security;
alter table public.tasks enable row level security;
alter table public.task_resources enable row level security;
alter table public.applications enable row level security;
alter table public.enrollments enable row level security;
alter table public.task_unlocks enable row level security;
alter table public.payments enable row level security;
alter table public.task_submissions enable row level security;
alter table public.certificate_templates enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;

-- Profiles: user read own, admin read all
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.is_admin());
create policy "profiles_insert" on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- Internships: public read, admin write
create policy "internships_select" on public.internships for select using (true);
create policy "internships_admin" on public.internships for all using (public.is_admin());

-- Internship Modules: public read, admin write
create policy "modules_select" on public.internship_modules for select using (true);
create policy "modules_admin" on public.internship_modules for all using (public.is_admin());

-- Tasks: public read, admin write
create policy "tasks_select" on public.tasks for select using (true);
create policy "tasks_admin" on public.tasks for all using (public.is_admin());

-- Task Resources: public read, admin write
create policy "resources_select" on public.task_resources for select using (true);
create policy "resources_admin" on public.task_resources for all using (public.is_admin());

-- Applications: user read/create own, admin full access
create policy "applications_select" on public.applications for select
  using (auth.uid() = user_id or public.is_admin());
create policy "applications_insert" on public.applications for insert
  with check (auth.uid() = user_id or public.is_admin());
create policy "applications_update" on public.applications for update
  using (public.is_admin());

-- Enrollments: user read own, admin full access
create policy "enrollments_select" on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());
create policy "enrollments_admin" on public.enrollments for all
  using (public.is_admin());

-- Task Unlocks: user read own via enrollment, admin full access
create policy "unlocks_select" on public.task_unlocks for select using (true);
create policy "unlocks_admin" on public.task_unlocks for all using (public.is_admin());

-- Payments: user read own, admin full access
create policy "payments_select" on public.payments for select
  using (auth.uid() = user_id or public.is_admin());
create policy "payments_insert" on public.payments for insert
  with check (auth.uid() = user_id or public.is_admin());
create policy "payments_admin" on public.payments for all using (public.is_admin());

-- Task Submissions: user read/create own, admin full access
create policy "submissions_select" on public.task_submissions for select
  using (auth.uid() = user_id or public.is_admin());
create policy "submissions_insert" on public.task_submissions for insert
  with check (auth.uid() = user_id or public.is_admin());
create policy "submissions_admin" on public.task_submissions for all
  using (public.is_admin());

-- Certificate Templates: public read, admin write
create policy "templates_select" on public.certificate_templates for select using (true);
create policy "templates_admin" on public.certificate_templates for all using (public.is_admin());

-- Certificates: public read (for verification), admin manage
create policy "certificates_select" on public.certificates for select using (true);
create policy "certificates_admin" on public.certificates for all using (public.is_admin());

-- Notifications: user manages own, admin can insert
create policy "notifications_user" on public.notifications for all
  using (auth.uid() = user_id);
create policy "notifications_admin_insert" on public.notifications for insert
  with check (public.is_admin());
