-- ========================================================
-- CodeElevate Database Schema: 007_single_submission.sql
-- Description: Overhaul submission model to ONE submission per internship.
-- ========================================================

-- 1. Make task_id nullable in payments table
alter table if exists public.payments 
  alter column task_id drop not null;

-- 2. Create internship_submissions table
create table if not exists public.internship_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  internship_id uuid references public.internships(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  github_url text not null,
  comments text,
  status text not null check (status in ('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_PAYMENT')) default 'UNDER_REVIEW',
  attempt_no int not null default 1,
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by enrollment & user
create index if not exists idx_internship_submissions_enrollment on public.internship_submissions(enrollment_id);
create index if not exists idx_internship_submissions_user on public.internship_submissions(user_id);
create index if not exists idx_internship_submissions_status on public.internship_submissions(status);

-- 3. Enable RLS on internship_submissions
alter table public.internship_submissions enable row level security;

-- Policy: Students can view their own submissions
drop policy if exists "Students can view own internship submissions" on public.internship_submissions;
create policy "Students can view own internship submissions"
  on public.internship_submissions
  for select
  using (auth.uid() = user_id);

-- Policy: Students can insert their own submissions
drop policy if exists "Students can insert own internship submissions" on public.internship_submissions;
create policy "Students can insert own internship submissions"
  on public.internship_submissions
  for insert
  with check (auth.uid() = user_id);

-- Policy: Admins have full access
drop policy if exists "Admins have full access to internship submissions" on public.internship_submissions;
create policy "Admins have full access to internship submissions"
  on public.internship_submissions
  for all
  using (public.is_admin());

-- 4. Atomic Payment Verification & Single Internship Submission Finalizer
create or replace function public.finalize_internship_submission(
  p_order_id text,
  p_payment_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_submission public.internship_submissions%rowtype;
  v_enrollment public.enrollments%rowtype;
  v_attempt int := 1;
  v_internship_title text;
begin
  -- 1. Fetch and lock payment row
  select * into v_payment
  from public.payments
  where razorpay_order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('error', 'Payment order not found');
  end if;

  -- 2. Fetch enrollment
  select * into v_enrollment
  from public.enrollments
  where id = v_payment.enrollment_id;

  -- 3. Idempotent check: if already PAID, return existing submission
  if v_payment.status = 'PAID' then
    select * into v_submission from public.internship_submissions where payment_id = v_payment.id;
    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'submission_id', v_submission.id,
      'payment_id', v_payment.id,
      'status', 'UNDER_REVIEW'
    );
  end if;

  -- 4. Calculate attempt number for this enrollment
  select coalesce(max(attempt_no), 0) + 1 into v_attempt
  from public.internship_submissions
  where enrollment_id = v_payment.enrollment_id;

  -- 5. Mark payment as PAID
  update public.payments
  set
    status = 'PAID',
    razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
    paid_at = coalesce(paid_at, now())
  where id = v_payment.id;

  -- 6. Create internship submission row
  insert into public.internship_submissions (
    enrollment_id,
    user_id,
    internship_id,
    payment_id,
    github_url,
    comments,
    status,
    attempt_no,
    submitted_at
  ) values (
    v_payment.enrollment_id,
    v_payment.user_id,
    v_enrollment.internship_id,
    v_payment.id,
    v_payment.github_url,
    v_payment.comments,
    'UNDER_REVIEW',
    v_attempt,
    now()
  )
  returning * into v_submission;

  -- 7. Fetch internship title for notification
  select title into v_internship_title from public.internships where id = v_enrollment.internship_id;

  -- 8. Create notifications
  insert into public.notifications (
    user_id,
    title,
    body,
    type,
    link
  ) values
  (
    v_payment.user_id,
    'Payment Successful 💳',
    'Evaluation fee received for "' || coalesce(v_internship_title, 'Internship') || '".',
    'PAYMENT',
    '/dashboard/submissions'
  ),
  (
    v_payment.user_id,
    'Internship Work Submitted 🚀',
    'Your final project work for "' || coalesce(v_internship_title, 'Internship') || '" has been queued for mentor review. Status: Under Review.',
    'TASK',
    '/dashboard/submissions'
  );

  return jsonb_build_object(
    'success', true,
    'submission_id', v_submission.id,
    'payment_id', v_payment.id,
    'attempt_no', v_attempt,
    'status', 'UNDER_REVIEW'
  );
end;
$$;
