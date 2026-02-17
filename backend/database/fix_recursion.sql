-- FIX RECURSION: Break the infinite loop in RLS policies
-- Run this in Supabase SQL Editor

-- 1. Fix 'users' table recursion
-- The recursion happens if the policy on 'users' tries to query 'users' to check permissions.
-- We must allow a base level of access (e.g., read) to break the cycle, or use a different auth check.
drop policy if exists "Users are viewable by everyone" on public.users;
drop policy if exists "Admins have full access to users" on public.users;
drop policy if exists "Enable read access for all users" on public.users;

-- Allow public read on users (Required for 'verify_user_credentials' and Admin checks to work without recursion)
create policy "Prevent Recursion: Public Read Users"
  on public.users for select
  using ( true );

-- 2. Ensure Sessions Policy doesn't cause issues (re-apply from v2 to be safe)
drop policy if exists "Admins have full access to sessions" on public.sessions;
create policy "Admins have full access to sessions"
  on public.sessions for all
  using ( 
    -- This check is safe ONLY if the 'users' table is readable (see above)
    (select role from public.users where id::text = auth.uid()::text) = 'admin' 
  );

-- 3. Ensure Driver Insert (Anon) is confirmed
drop policy if exists "Anyone can start a session" on public.sessions;
create policy "Drivers (Anon) can start sessions"
  on public.sessions for insert
  with check ( true ); 
