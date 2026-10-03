-- ========================================================
-- CodeElevate Database Schema: 003_functions.sql
-- Description: Core business logic functions, triggers, and atomic procedures.
-- ========================================================

-- ────────────────────────────────────────────────────────
-- 1. AUTH TRIGGER: Automatic Profile Creation on Sign Up
-- ────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year text;
  v_seq_val bigint;
  v_student_id text;
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_role public.user_role;
begin
  v_year := to_char(now(), 'YYYY');
  v_seq_val := nextval('public.student_id_seq');
  v_student_id := 'CE' || v_year || lpad(v_seq_val::text, 4, '0');

  v_first_name := coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1), '');
  v_last_name := coalesce(new.raw_user_meta_data->>'last_name', substring(new.raw_user_meta_data->>'full_name' from position(' ' in coalesce(new.raw_user_meta_data->>'full_name', '')) + 1), '');
  v_phone := new.raw_user_meta_data->>'phone';
  
  -- Allow admin role only if explicitly set via metadata by service role
  if (new.raw_user_meta_data->>'role') = 'admin' then
    v_role := 'admin'::public.user_role;
  else
    v_role := 'student'::public.user_role;
  end if;

  insert into public.profiles (
    id,
    student_id,
    role,
    first_name,
    last_name,
    email,
    phone,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    v_student_id,
    v_role,
    v_first_name,
    v_last_name,
    coalesce(new.email, ''),
    v_phone,
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

-- Trigger attached to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────
-- 2. CERTIFICATE NUMBER GENERATOR (Gap-free & Concurrency-safe)
-- ────────────────────────────────────────────────────────
create or replace function public.next_certificate_number(p_type public.certificate_type)
returns table(certificate_number text, url_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int;
  v_prefix text;
  v_next_val int;
  v_cert_no text;
  v_slug text;
begin
  v_year := extract(year from current_date)::int;
  v_prefix := case when p_type = 'COMPLETION' then 'COMP' else 'CONF' end;

  -- Row lock on certificate_counters for the given year & type
  insert into public.certificate_counters (year, type, last_number)
  values (v_year, p_type, 1)
  on conflict (year, type) do update
  set last_number = public.certificate_counters.last_number + 1
  returning last_number into v_next_val;

  -- Format: CE-COMP-0001/2026
  v_cert_no := 'CE-' || v_prefix || '-' || lpad(v_next_val::text, 4, '0') || '/' || v_year::text;
  -- URL slug: CE-COMP-0001-2026
  v_slug := 'CE-' || v_prefix || '-' || lpad(v_next_val::text, 4, '0') || '-' || v_year::text;

  return query select v_cert_no, v_slug;
end;
$$;

-- ────────────────────────────────────────────────────────
-- 3. COMPUTED TASK STATUSES PER ENROLLMENT
-- ────────────────────────────────────────────────────────
create or replace function public.get_task_statuses(p_enrollment_id uuid)
returns table (
  task_id uuid,
  module_id uuid,
  task_title text,
  module_title text,
  module_position int,
  task_position int,
  is_required boolean,
  deadline_date date,
  submission_status public.task_status,
  computed_status public.task_status,
  github_url text,
  feedback text,
  submission_id uuid
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_enrollment record;
  v_prev_task_approved boolean := true;
begin
  -- Fetch enrollment details
  select * into v_enrollment from public.enrollments where id = p_enrollment_id;
  if not found then
    return;
  end if;

  return query
  with ordered_tasks as (
    select
      t.id as t_id,
      t.module_id as t_mod_id,
      t.title as t_title,
      m.title as m_title,
      coalesce(m.position, 1) as m_pos,
      t.position as t_pos,
      t.is_required as t_req,
      (v_enrollment.start_date + (t.deadline_days_after_start || ' days')::interval)::date as t_deadline,
      row_number() over (order by coalesce(m.position, 1) asc, t.position asc) as seq_num
    from public.tasks t
    left join public.internship_modules m on m.id = t.module_id
    where t.internship_id = v_enrollment.internship_id
      and t.status = 'PUBLISHED'
  ),
  latest_submissions as (
    select distinct on (ts.task_id)
      ts.id as s_id,
      ts.task_id as s_task_id,
      ts.status as s_status,
      ts.github_url as s_github_url,
      ts.feedback as s_feedback
    from public.task_submissions ts
    where ts.enrollment_id = p_enrollment_id
    order by ts.task_id, ts.submitted_at desc
  ),
  manual_unlocks as (
    select tu.task_id as u_task_id
    from public.task_unlocks tu
    where tu.enrollment_id = p_enrollment_id
  )
  select
    ot.t_id as task_id,
    ot.t_mod_id as module_id,
    ot.t_title as task_title,
    ot.m_title as module_title,
    ot.m_pos as module_position,
    ot.t_pos as task_position,
    ot.t_req as is_required,
    ot.t_deadline as deadline_date,
    ls.s_status as submission_status,
    case
      -- 1. Evaluated or pending states take precedence
      when ls.s_status = 'APPROVED' then 'APPROVED'::public.task_status
      when ls.s_status = 'UNDER_REVIEW' then 'UNDER_REVIEW'::public.task_status
      when ls.s_status = 'REJECTED' then 'REJECTED'::public.task_status
      -- 2. First task or manually unlocked
      when ot.seq_num = 1 or mu.u_task_id is not null then 'AVAILABLE'::public.task_status
      -- 3. Sequentially unlocked if all previous required tasks are APPROVED
      when not exists (
        select 1 from ordered_tasks prev_ot
        where prev_ot.seq_num < ot.seq_num
          and prev_ot.t_req = true
          and not exists (
            select 1 from public.task_submissions prev_sub
            where prev_sub.enrollment_id = p_enrollment_id
              and prev_sub.task_id = prev_ot.t_id
              and prev_sub.status = 'APPROVED'
          )
      ) then 'AVAILABLE'::public.task_status
      -- 4. Otherwise locked
      else 'LOCKED'::public.task_status
    end as computed_status,
    ls.s_github_url as github_url,
    ls.s_feedback as feedback,
    ls.s_id as submission_id
  from ordered_tasks ot
  left join latest_submissions ls on ls.s_task_id = ot.t_id
  left join manual_unlocks mu on mu.u_task_id = ot.t_id
  order by ot.m_pos asc, ot.t_pos asc;
end;
$$;

-- ────────────────────────────────────────────────────────
-- 4. ENROLLMENT PROGRESS CALCULATION (Database-enforced)
-- ────────────────────────────────────────────────────────
create or replace function public.get_enrollment_progress(p_enrollment_id uuid)
returns table (
  approved_required int,
  total_required int,
  percent int
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_enrollment record;
  v_total_req int := 0;
  v_approved_req int := 0;
  v_pct int := 0;
  v_has_approved_submission boolean := false;
begin
  select * into v_enrollment
  from public.enrollments
  where id = p_enrollment_id;

  if not found then
    return query select 0, 0, 0;
    return;
  end if;

  -- Total required tasks in this internship
  select count(*) into v_total_req
  from public.tasks
  where internship_id = v_enrollment.internship_id
    and is_required = true
    and status = 'PUBLISHED';

  if v_total_req = 0 then
    select count(*) into v_total_req
    from public.tasks
    where internship_id = v_enrollment.internship_id
      and status = 'PUBLISHED';
  end if;

  -- Check if enrollment is COMPLETED or has an APPROVED internship_submissions
  if v_enrollment.status = 'COMPLETED' then
    v_has_approved_submission := true;
  else
    select exists (
      select 1 from public.internship_submissions
      where enrollment_id = p_enrollment_id
        and status = 'APPROVED'
    ) into v_has_approved_submission;
  end if;

  if v_has_approved_submission then
    v_approved_req := coalesce(v_total_req, 8);
    v_pct := 100;
  else
    -- Total approved required tasks submitted by student
    select count(distinct ts.task_id) into v_approved_req
    from public.task_submissions ts
    join public.tasks t on t.id = ts.task_id
    where ts.enrollment_id = p_enrollment_id
      and ts.status = 'APPROVED'
      and t.is_required = true;

    if v_total_req > 0 then
      v_pct := least(100, round((v_approved_req::numeric / v_total_req::numeric) * 100)::int);
    else
      v_pct := 0;
    end if;
  end if;

  return query select coalesce(v_approved_req, 0), coalesce(v_total_req, 0), coalesce(v_pct, 0);
end;
$$;

-- ────────────────────────────────────────────────────────
-- 5. ATOMIC APPLICATION APPROVAL & ENROLLMENT ACTIVATION
-- ────────────────────────────────────────────────────────
create or replace function public.approve_application(
  p_app_id uuid,
  p_admin_id uuid default null
)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.applications%rowtype;
  v_enrollment public.enrollments%rowtype;
  v_start_date date;
  v_end_date date;
begin
  -- Fetch and lock application row
  select * into v_app
  from public.applications
  where id = p_app_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if v_app.status = 'APPROVED' then
    select * into v_enrollment from public.enrollments where application_id = p_app_id;
    return v_enrollment;
  end if;

  -- Set dates
  v_start_date := current_date;
  v_end_date := (v_start_date + interval '1 month' - interval '1 day')::date;

  -- Update application
  update public.applications
  set
    status = 'APPROVED',
    reviewed_at = now(),
    reviewed_by = coalesce(p_admin_id, auth.uid()),
    updated_at = now()
  where id = p_app_id;

  -- Upsert enrollment
  insert into public.enrollments (
    user_id,
    internship_id,
    application_id,
    start_date,
    end_date,
    status,
    created_at,
    updated_at
  ) values (
    v_app.user_id,
    v_app.internship_id,
    p_app_id,
    v_start_date,
    v_end_date,
    'ACTIVE',
    now(),
    now()
  )
  on conflict (user_id, internship_id) do update set
    status = 'ACTIVE',
    application_id = p_app_id,
    start_date = v_start_date,
    end_date = v_end_date,
    updated_at = now()
  returning * into v_enrollment;

  -- Create in-app notification
  insert into public.notifications (
    user_id,
    title,
    body,
    type,
    link
  ) values (
    v_app.user_id,
    'Application Approved! 🎉',
    'Your internship application has been approved. Your 1-month learning curriculum is now active.',
    'APPLICATION',
    '/my-learning/' || v_enrollment.id
  );

  return v_enrollment;
end;
$$;

-- ────────────────────────────────────────────────────────
-- 6. ENROLLMENT COMPLETION & CERTIFICATE ISSUANCE CHECK
-- ────────────────────────────────────────────────────────
create or replace function public.check_enrollment_completion(p_enrollment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_progress record;
  v_enrollment record;
  v_template_id uuid;
  v_cert_record record;
  v_student record;
begin
  select * into v_progress from public.get_enrollment_progress(p_enrollment_id);

  if v_progress.approved_required = v_progress.total_required and v_progress.total_required > 0 then
    -- Mark enrollment completed
    update public.enrollments
    set
      status = 'COMPLETED',
      completed_at = coalesce(completed_at, now()),
      updated_at = now()
    where id = p_enrollment_id and status != 'COMPLETED';

    select * into v_enrollment from public.enrollments where id = p_enrollment_id;

    -- Issue certificate if not already issued
    if not exists (select 1 from public.certificates where enrollment_id = p_enrollment_id) then
      select id into v_template_id from public.certificate_templates where is_default = true limit 1;
      select * into v_cert_record from public.next_certificate_number('COMPLETION'::public.certificate_type);

      insert into public.certificates (
        certificate_number,
        url_slug,
        user_id,
        enrollment_id,
        internship_id,
        type,
        status,
        issued_at,
        template_id
      ) values (
        v_cert_record.certificate_number,
        v_cert_record.url_slug,
        v_enrollment.user_id,
        p_enrollment_id,
        v_enrollment.internship_id,
        'COMPLETION',
        'ISSUED',
        now(),
        v_template_id
      );

      -- Send congratulatory notification
      insert into public.notifications (
        user_id,
        title,
        body,
        type,
        link
      ) values (
        v_enrollment.user_id,
        'Internship Completed & Certified! 🎓',
        'Congratulations! You have completed all required milestone tasks. Your official Certificate of Completion is ready.',
        'CERTIFICATE',
        '/certificates'
      );
    end if;

    return true;
  end if;

  return false;
end;
$$;

-- ────────────────────────────────────────────────────────
-- 7. NOTIFICATION TRIGGERS
-- ────────────────────────────────────────────────────────

-- Trigger on application status change
create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_internship_title text;
begin
  if (old.status is distinct from new.status) then
    select title into v_internship_title from public.internships where id = new.internship_id;

    if new.status = 'REJECTED' then
      insert into public.notifications (
        user_id,
        title,
        body,
        type,
        link
      ) values (
        new.user_id,
        'Application Update',
        'Your application for ' || coalesce(v_internship_title, 'Internship') || ' was not approved at this time.',
        'APPLICATION',
        '/applications'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_status_changed on public.applications;
create trigger on_application_status_changed
  after update on public.applications
  for each row execute procedure public.notify_application_status_change();

-- Trigger on submission status change
create or replace function public.notify_submission_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_title text;
begin
  if (old.status is distinct from new.status) then
    select title into v_task_title from public.tasks where id = new.task_id;

    if new.status = 'APPROVED' then
      insert into public.notifications (
        user_id,
        title,
        body,
        type,
        link
      ) values (
        new.user_id,
        'Task Approved! 🌟',
        'Your submission for "' || coalesce(v_task_title, 'Task') || '" has been approved by the mentor team.',
        'TASK',
        '/my-learning/' || new.enrollment_id
      );

      -- Check if this completes the full internship
      perform public.check_enrollment_completion(new.enrollment_id);

    elsif new.status = 'REJECTED' then
      insert into public.notifications (
        user_id,
        title,
        body,
        type,
        link
      ) values (
        new.user_id,
        'Task Feedback Received',
        'Your submission for "' || coalesce(v_task_title, 'Task') || '" needs improvement. Check feedback and resubmit.',
        'TASK',
        '/my-learning/' || new.enrollment_id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_submission_status_changed on public.task_submissions;
create trigger on_submission_status_changed
  after update on public.task_submissions
  for each row execute procedure public.notify_submission_status_change();

-- ────────────────────────────────────────────────────────
-- 8. ATOMIC PAYMENT VERIFICATION & SUBMISSION FINALIZATION
-- ────────────────────────────────────────────────────────
create or replace function public.finalize_paid_submission(
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
  v_submission public.task_submissions%rowtype;
  v_attempt int := 1;
  v_task_title text;
begin
  -- 1. Fetch and lock payment row
  select * into v_payment
  from public.payments
  where razorpay_order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('error', 'Payment order not found');
  end if;

  -- 2. Idempotent check: if already PAID, return existing submission
  if v_payment.status = 'PAID' then
    select * into v_submission from public.task_submissions where payment_id = v_payment.id;
    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'submission_id', v_submission.id,
      'payment_id', v_payment.id,
      'status', 'UNDER_REVIEW'
    );
  end if;

  -- 3. Calculate attempt number
  select coalesce(max(attempt_no), 0) + 1 into v_attempt
  from public.task_submissions
  where enrollment_id = v_payment.enrollment_id
    and task_id = v_payment.task_id;

  -- 4. Mark payment as PAID
  update public.payments
  set
    status = 'PAID',
    razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
    paid_at = coalesce(paid_at, now())
  where id = v_payment.id;

  -- 5. Create task submission row (UNDER_REVIEW, attempt_no, payment_id unique)
  insert into public.task_submissions (
    enrollment_id,
    task_id,
    user_id,
    payment_id,
    github_url,
    comments,
    status,
    attempt_no,
    submitted_at
  ) values (
    v_payment.enrollment_id,
    v_payment.task_id,
    v_payment.user_id,
    v_payment.id,
    v_payment.github_url,
    v_payment.comments,
    'UNDER_REVIEW',
    v_attempt,
    now()
  )
  returning * into v_submission;

  -- 6. Fetch task title for notification
  select title into v_task_title from public.tasks where id = v_payment.task_id;

  -- 7. Create notifications
  insert into public.notifications (
    user_id,
    title,
    body,
    type,
    link
  ) values
  (
    v_payment.user_id,
    'Payment Successful (₹99) 💳',
    'Evaluation fee received for "' || coalesce(v_task_title, 'Milestone Task') || '".',
    'PAYMENT',
    '/dashboard/tasks'
  ),
  (
    v_payment.user_id,
    'Task Submitted for Review 🚀',
    'Your task "' || coalesce(v_task_title, 'Milestone Task') || '" has been queued for mentor review. Status: Under Review.',
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

