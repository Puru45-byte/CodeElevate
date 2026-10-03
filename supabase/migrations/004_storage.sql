-- ========================================================
-- CodeElevate Database Schema: 004_storage.sql
-- Description: Supabase Storage buckets and access control policies.
-- ========================================================

-- Create Storage Buckets (Public and Private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-images', 'course-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('logos', 'logos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('course-materials', 'course-materials', false, 52428800, null),
  ('task-resources', 'task-resources', false, 52428800, null),
  ('certificates', 'certificates', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ────────────────────────────────────────────────────────
-- STORAGE RLS POLICIES
-- ────────────────────────────────────────────────────────

-- 1. PROFILE PHOTOS
-- Anyone can view public profile photos
drop policy if exists "Public Profile Photos Access" on storage.objects;
create policy "Public Profile Photos Access"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Users can upload and update their own profile photo
drop policy if exists "User Profile Photo Upload" on storage.objects;
create policy "User Profile Photo Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

drop policy if exists "User Profile Photo Update" on storage.objects;
create policy "User Profile Photo Update"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

-- 2. COURSE IMAGES & LOGOS (Public Read, Admin Write)
drop policy if exists "Public Course Images & Logos Read" on storage.objects;
create policy "Public Course Images & Logos Read"
  on storage.objects for select
  using (bucket_id in ('course-images', 'logos'));

drop policy if exists "Admin Course Images & Logos Write" on storage.objects;
create policy "Admin Course Images & Logos Write"
  on storage.objects for all
  using (bucket_id in ('course-images', 'logos') and public.is_admin())
  with check (bucket_id in ('course-images', 'logos') and public.is_admin());

-- 3. COURSE MATERIALS & TASK RESOURCES (Private: Enrolled Students or Admin)
drop policy if exists "Enrolled Students Course Materials Read" on storage.objects;
create policy "Enrolled Students Course Materials Read"
  on storage.objects for select
  using (
    bucket_id in ('course-materials', 'task-resources')
    and (
      public.is_admin()
      or exists (
        select 1 from public.enrollments
        where enrollments.user_id = auth.uid()
          and enrollments.status = 'ACTIVE'
      )
    )
  );

drop policy if exists "Admin Course Materials Manage" on storage.objects;
create policy "Admin Course Materials Manage"
  on storage.objects for all
  using (bucket_id in ('course-materials', 'task-resources') and public.is_admin())
  with check (bucket_id in ('course-materials', 'task-resources') and public.is_admin());

-- 4. CERTIFICATES (Private: Owner or Admin)
drop policy if exists "Certificate Owner or Admin Read" on storage.objects;
create policy "Certificate Owner or Admin Read"
  on storage.objects for select
  using (
    bucket_id = 'certificates'
    and (
      public.is_admin()
      or (auth.uid()::text = (storage.foldername(name))[1])
    )
  );

drop policy if exists "Admin Certificate Upload" on storage.objects;
create policy "Admin Certificate Upload"
  on storage.objects for all
  using (bucket_id = 'certificates' and public.is_admin())
  with check (bucket_id = 'certificates' and public.is_admin());
