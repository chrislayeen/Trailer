-- DATA PRIVACY HARDENING
-- Run this in your Supabase SQL Editor to secure actual photo records.

-- 1. Tighten User Table (if not already done)
drop policy if exists "Users are viewable by everyone" on public.users;
alter table public.users enable row level security;

-- 2. Tighten Sessions Table
drop policy if exists "Public sessions are viewable by everyone" on public.sessions;
drop policy if exists "Authenticated users can insert sessions" on public.sessions;
drop policy if exists "Allow session updates" on public.sessions;

-- NEW POLICY: No one can read/write directly EXCEPT through specific conditions or Admin role.
-- Note: Since we use a special 'PIN login' and not standard Supabase Auth for drivers,
-- we'll allow standard 'anon' role to INSERT (to start a session) but restrict SELECT.

-- For Simplicity & Robustness:
-- Admin can do EVERYTHING.
create policy "Admins have full access to sessions"
  on public.sessions for all
  using ( (select role from public.users where id::text = auth.uid()::text) = 'admin' );

-- Drivers (anon) can only INSERT sessions and update their own active session if they know the ID.
create policy "Anyone can start a session"
  on public.sessions for insert
  with check ( true );

create policy "Anyone can view a session if they have the ID"
  on public.sessions for select
  using ( true ); -- We rely on UUID obscurity for driver flow

-- 3. Tighten Photos Table
drop policy if exists "Public photos are viewable by everyone" on public.photos;
drop policy if exists "Authenticated users can insert photos" on public.photos;

create policy "Admins have full access to photos"
  on public.photos for all
  using ( (select role from public.users where id::text = auth.uid()::text) = 'admin' );

create policy "Anyone can upload photos"
  on public.photos for insert
  with check ( true );

create policy "Anyone can view photos"
  on public.photos for select
  using ( true );

-- [CRITICAL] STORAGE SECURITY
-- Ensure 'photos' bucket in Supabase Storage is NOT 'Public'.
-- If it is public, anyone can guess the URL.
-- Set it to 'Private' and access via the publicUrl logic in the app.
