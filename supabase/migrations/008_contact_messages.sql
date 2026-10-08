-- ========================================================
-- CodeElevate Database Schema: 008_contact_messages.sql
-- Description: Table and RLS policies for contact messages and inquiries
-- ========================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  topic text not null,
  message text not null,
  payment_id_ref text,
  status text not null default 'NEW' check (status in ('NEW', 'IN_PROGRESS', 'RESOLVED')),
  admin_notes text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for speedy admin queries and filtering
create index if not exists idx_contact_messages_status on public.contact_messages(status);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index if not exists idx_contact_messages_email on public.contact_messages(email);

-- Enable Row Level Security
alter table public.contact_messages enable row level security;

-- Client-side direct access policies:
-- Disallow public client SELECT and INSERT (inserts must go via backend API with service role key)
drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());
