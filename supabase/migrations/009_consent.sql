-- ========================================================
-- CodeElevate Database Schema: 009_consent.sql
-- Description: Store legal consent timestamps and policy versions
-- ========================================================

alter table public.profiles
  add column if not exists consent_at timestamptz default now(),
  add column if not exists consent_version text default 'October 2026';

create index if not exists idx_profiles_consent_at on public.profiles(consent_at);
