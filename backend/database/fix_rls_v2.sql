-- FIX RLS v2: Ensure 'anon' (drivers) can INSERT sessions and photos
-- Run this in Supabase SQL Editor

-- 1. Reset Session Policies
drop policy if exists "Anyone can start a session" on public.sessions;
drop policy if exists "Authenticated users can insert sessions" on public.sessions;

create policy "Enable insert for authenticated users only"
on public.sessions
for insert
to formatted_role
with check (true);

-- Allow anon to see their own session if they have the ID (UUID obscure)
drop policy if exists "Anyone can view a session if they have the ID" on public.sessions;
create policy "Enable read access for all users"
on public.sessions
for select
using (true);

-- 2. Reset Photo Policies
drop policy if exists "Anyone can upload photos" on public.photos;
drop policy if exists "Authenticated users can insert photos" on public.photos;

create policy "Enable insert for authenticated users only"
on public.photos
for insert
to formatted_role
with check (true);

drop policy if exists "Anyone can view photos" on public.photos;
create policy "Enable read access for all users"
on public.photos
for select
using (true);

-- 3. Verify Grants
grant all on public.sessions to anon;
grant all on public.photos to anon;
grant all on public.sessions to authenticated;
grant all on public.photos to authenticated;
