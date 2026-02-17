-- PURGE AND FIX RLS
-- This script uses a DO block to find and drop ALL policies, regardless of their name.
-- This ensures no hidden recursive policies remain.

-- 1. Dynamic Drop of ALL Policies on key tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'sessions', 'photos')
    ) LOOP
        -- Log the drop (optional, but good for debugging if run in tool)
        RAISE NOTICE 'Dropping policy: % on table %', r.policyname, r.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. Disable and Re-Enable RLS to be sure
alter table public.users disable row level security;
alter table public.sessions disable row level security;
alter table public.photos disable row level security;

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.photos enable row level security;

-- 3. Re-Apply Simple, Safe Policies

-- USERS: Public Read (Stops recursion, allows login checks)
create policy "users_read_all" on public.users for select using (true);

-- SESSIONS: Public Read/Insert/Update (Simplest working state)
create policy "sessions_read_all" on public.sessions for select using (true);
create policy "sessions_insert_all" on public.sessions for insert with check (true);
create policy "sessions_update_all" on public.sessions for update using (true);

-- PHOTOS: Public Read/Insert/Delete
create policy "photos_read_all" on public.photos for select using (true);
create policy "photos_insert_all" on public.photos for insert with check (true);
create policy "photos_delete_all" on public.photos for delete using (true);

-- 4. Grant permissions to anon (Double check)
grant all on public.users to anon;
grant all on public.sessions to anon;
grant all on public.photos to anon;
grant all on public.users to authenticated;
grant all on public.sessions to authenticated;
grant all on public.photos to authenticated;
