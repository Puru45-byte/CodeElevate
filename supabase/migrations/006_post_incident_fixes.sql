-- ========================================================
-- CodeElevate Post-Incident Fixes: 006_post_incident_fixes.sql
-- Description: Idempotent migration to harden auth functions, break RLS recursion,
--              and sanitize token columns in auth.users.
-- Note: Already applied manually to the live DB on 2026-10-02.
-- ========================================================

-- ────────────────────────────────────────────────────────
-- 1. NON-RECURSIVE is_admin() FUNCTION
-- Reads user metadata without performing recursive queries on public.profiles
-- ────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = auth, public
stable
as $$
  select coalesce(
    (
      select (
        (raw_user_meta_data->>'role') = 'admin' 
        or (raw_app_meta_data->>'role') = 'admin'
      )
      from auth.users
      where id = auth.uid()
    ),
    false
  );
$$;

-- Grant execution to all connection roles
grant execute on function public.is_admin() to postgres, anon, authenticated, service_role, supabase_auth_admin;

-- ────────────────────────────────────────────────────────
-- 2. ROBUST handle_new_user() TRIGGER FUNCTION
-- Populates all required profile columns seamlessly across schema versions
-- ────────────────────────────────────────────────────────
-- Ensure compatibility columns exist on public.profiles
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists full_name text;

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
  v_full_name text;
  v_phone text;
  v_role public.user_role;
begin
  v_year := to_char(now(), 'YYYY');
  v_seq_val := nextval('public.student_id_seq');
  v_student_id := 'CE' || v_year || lpad(v_seq_val::text, 4, '0');

  v_first_name := coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1), '');
  v_last_name := coalesce(new.raw_user_meta_data->>'last_name', substring(new.raw_user_meta_data->>'full_name' from position(' ' in coalesce(new.raw_user_meta_data->>'full_name', '')) + 1), '');
  v_full_name := trim(v_first_name || ' ' || v_last_name);
  v_phone := new.raw_user_meta_data->>'phone';
  
  if (new.raw_user_meta_data->>'role') = 'admin' or (new.raw_app_meta_data->>'role') = 'admin' then
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
    full_name,
    email,
    phone,
    photo_url,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    v_student_id,
    v_role,
    v_first_name,
    v_last_name,
    v_full_name,
    coalesce(new.email, ''),
    v_phone,
    new.raw_user_meta_data->>'photo_url',
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────
-- 3. SANITY TOKEN COLUMN UPDATE IN auth.users
-- GoTrue crashes if string token columns contain NULL instead of ''
-- ────────────────────────────────────────────────────────
update auth.users
set 
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  email_change = coalesce(email_change, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where 
  confirmation_token is null
  or recovery_token is null
  or email_change_token_new is null
  or email_change_token_current is null
  or email_change is null
  or phone_change is null
  or phone_change_token is null
  or reauthentication_token is null;

-- ────────────────────────────────────────────────────────
-- 4. RECREATE CLEAN PROFILE RLS POLICIES
-- ────────────────────────────────────────────────────────
drop policy if exists "Profiles viewable by self or admin" on public.profiles;
drop policy if exists "Profiles editable by self or admin" on public.profiles;
drop policy if exists "Admins can insert profiles" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_select_policy" on public.profiles;
drop policy if exists "profiles_update_policy" on public.profiles;
drop policy if exists "profiles_insert_policy" on public.profiles;

create policy "profiles_select_policy"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_policy"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());
