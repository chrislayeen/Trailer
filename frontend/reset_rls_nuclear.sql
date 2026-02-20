-- NUCLEAR RLS RESET
-- This script drops ALL policies and rebuilds them from scratch.
-- Use this if you are getting 500 Recursion errors.

-- 1. Disable RLS temporarily to clear state
alter table public.sessions disable row level security;
alter table public.photos disable row level security;
alter table public.users disable row level security;

-- 2. Drop ALL existing policies to ensure no ghosts remain
drop policy if exists "Users are viewable by everyone" on public.users;
drop policy if exists "Admins have full access to users" on public.users;
drop policy if exists "Enable read access for all users" on public.users;
drop policy if exists "Prevent Recursion: Public Read Users" on public.users;

drop policy if exists "Public sessions are viewable by everyone" on public.sessions;
drop policy if exists "Authenticated users can insert sessions" on public.sessions;
drop policy if exists "Allow session updates" on public.sessions;
drop policy if exists "Admins have full access to sessions" on public.sessions;
drop policy if exists "Anyone can start a session" on public.sessions;
drop policy if exists "Enable insert for authenticated users only" on public.sessions;
drop policy if exists "Enable read access for all users" on public.sessions;
drop policy if exists "Drivers (Anon) can start sessions" on public.sessions;

drop policy if exists "Public photos are viewable by everyone" on public.photos;
drop policy if exists "Authenticated users can insert photos" on public.photos;
drop policy if exists "Admins have full access to photos" on public.photos;
drop policy if exists "Anyone can upload photos" on public.photos;
drop policy if exists "Anyone can view photos" on public.photos;
drop policy if exists "Enable insert for authenticated users only" on public.photos;
drop policy if exists "Enable read access for all users" on public.photos;

-- 3. Re-enable RLS
alter table public.sessions enable row level security;
alter table public.photos enable row level security;
alter table public.users enable row level security;

-- 4. Create Simple, Non-Recursive Policies

-- USERS: Public Read (Required for login checks)
create policy "allow_public_read_users"
on public.users for select
using (true);

-- SESSIONS: 
-- Read: Public (or you can restrict if needed, but keeping it simple for now)
create policy "allow_public_read_sessions"
on public.sessions for select
using (true);

-- Insert: Public (Anon)
create policy "allow_anon_insert_sessions"
on public.sessions for insert
with check (true);

-- Update: Public (Simplification for now to allow finishing sessions)
create policy "allow_public_update_sessions"
on public.sessions for update
using (true);

-- PHOTOS:
-- Read: Public
create policy "allow_public_read_photos"
on public.photos for select
using (true);

-- Insert: Public (Anon)
create policy "allow_anon_insert_photos"
on public.photos for insert
with check (true);

-- Delete: Public (Simplification)
create policy "allow_public_delete_photos"
on public.photos for delete
using (true);
