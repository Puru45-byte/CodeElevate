-- ========================================================
-- CodeElevate Database Schema: 010_resumes.sql
-- Description: Add resume columns to applications and profiles, and setup storage bucket for resumes.
-- ========================================================

-- 1. Add resume columns to applications
alter table public.applications 
  add column if not exists resume_url text,
  add column if not exists resume_file_name text;

-- 2. Add resume columns to profiles
alter table public.profiles
  add column if not exists resume_url text,
  add column if not exists resume_file_name text;

-- 3. Create Storage Bucket for Resumes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 2097152, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 4. Storage RLS Policies
drop policy if exists "Public Resumes Access" on storage.objects;
create policy "Public Resumes Access"
  on storage.objects for select
  using (bucket_id = 'resumes');

drop policy if exists "User Resume Upload" on storage.objects;
create policy "User Resume Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

drop policy if exists "User Resume Update" on storage.objects;
create policy "User Resume Update"
  on storage.objects for update
  using (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
