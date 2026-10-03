-- ========================================================
-- CodeElevate Database Schema: 002_rls.sql
-- Description: Row Level Security (RLS) policies for all tables.
-- ========================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = auth, public
stable
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

-- ────────────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ────────────────────────────────────────────────────────
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
alter table public.certificate_counters enable row level security;
alter table public.certificate_verification_logs enable row level security;
alter table public.notifications enable row level security;

-- ────────────────────────────────────────────────────────
-- 1. PROFILES POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Profiles viewable by self or admin" on public.profiles;
create policy "Profiles viewable by self or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles editable by self or admin" on public.profiles;
create policy "Profiles editable by self or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    -- Prevent students from escalating their own role to 'admin'
    (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- ────────────────────────────────────────────────────────
-- 2. INTERNSHIPS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Internships viewable by everyone if published" on public.internships;
create policy "Internships viewable by everyone if published"
  on public.internships for select
  using (status = 'PUBLISHED' or public.is_admin());

drop policy if exists "Admins manage internships" on public.internships;
create policy "Admins manage internships"
  on public.internships for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 3. INTERNSHIP MODULES POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Modules viewable if internship published" on public.internship_modules;
create policy "Modules viewable if internship published"
  on public.internship_modules for select
  using (
    exists (
      select 1 from public.internships
      where internships.id = internship_modules.internship_id
        and (internships.status = 'PUBLISHED' or public.is_admin())
    )
  );

drop policy if exists "Admins manage modules" on public.internship_modules;
create policy "Admins manage modules"
  on public.internship_modules for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 4. TASKS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Tasks viewable if published" on public.tasks;
create policy "Tasks viewable if published"
  on public.tasks for select
  using (
    (status = 'PUBLISHED' and exists (
      select 1 from public.internships
      where internships.id = tasks.internship_id
        and internships.status = 'PUBLISHED'
    ))
    or public.is_admin()
  );

drop policy if exists "Admins manage tasks" on public.tasks;
create policy "Admins manage tasks"
  on public.tasks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 5. TASK RESOURCES POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Resources viewable by enrolled students or admin" on public.task_resources;
create policy "Resources viewable by enrolled students or admin"
  on public.task_resources for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.tasks
      join public.enrollments on enrollments.internship_id = tasks.internship_id
      where tasks.id = task_resources.task_id
        and enrollments.user_id = auth.uid()
        and enrollments.status = 'ACTIVE'
    )
  );

drop policy if exists "Admins manage resources" on public.task_resources;
create policy "Admins manage resources"
  on public.task_resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 6. APPLICATIONS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own applications or admin" on public.applications;
create policy "Users view own applications or admin"
  on public.applications for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own application" on public.applications;
create policy "Users can insert own application"
  on public.applications for insert
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage applications" on public.applications;
create policy "Admins manage applications"
  on public.applications for update
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 7. ENROLLMENTS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own enrollments or admin" on public.enrollments;
create policy "Users view own enrollments or admin"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage enrollments" on public.enrollments;
create policy "Admins manage enrollments"
  on public.enrollments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 8. TASK UNLOCKS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own task unlocks or admin" on public.task_unlocks;
create policy "Users view own task unlocks or admin"
  on public.task_unlocks for select
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_unlocks.enrollment_id
        and enrollments.user_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "Admins manage task unlocks" on public.task_unlocks;
create policy "Admins manage task unlocks"
  on public.task_unlocks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 9. PAYMENTS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own payments or admin" on public.payments;
create policy "Users view own payments or admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage payments" on public.payments;
create policy "Admins manage payments"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 10. TASK SUBMISSIONS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own submissions or admin" on public.task_submissions;
create policy "Users view own submissions or admin"
  on public.task_submissions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage submissions" on public.task_submissions;
create policy "Admins manage submissions"
  on public.task_submissions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 11. CERTIFICATE TEMPLATES POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Certificate templates viewable by authenticated" on public.certificate_templates;
create policy "Certificate templates viewable by authenticated"
  on public.certificate_templates for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admins manage certificate templates" on public.certificate_templates;
create policy "Admins manage certificate templates"
  on public.certificate_templates for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 12. CERTIFICATES POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own certificates or admin" on public.certificates;
create policy "Users view own certificates or admin"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage certificates" on public.certificates;
create policy "Admins manage certificates"
  on public.certificates for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 13. CERTIFICATE COUNTERS & LOGS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Admins manage certificate counters" on public.certificate_counters;
create policy "Admins manage certificate counters"
  on public.certificate_counters for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage verification logs" on public.certificate_verification_logs;
create policy "Admins manage verification logs"
  on public.certificate_verification_logs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────
-- 14. NOTIFICATIONS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can mark own notifications as read" on public.notifications;
create policy "Users can mark own notifications as read"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
