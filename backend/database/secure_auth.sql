-- Secure Authentication Setup

-- 1. Create the Secure RPC Function
-- This function runs with "security definer" privileges, meaning it bypasses RLS
-- to check credentials without exposing the table to the public.
create or replace function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (id uuid, name text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select u.id, u.name, u.role
  from public.users u
  where u.name ilike p_name
  and u.pin = p_pin
  and u.role = p_role;
end;
$$;

-- 2. Revoke Public Read Access
-- Drop the policy that allows everyone to read the users table
drop policy if exists "Users are viewable by everyone" on public.users;

-- 3. Create a Restrictive Policy (Optional but good practice)
-- Only allow users to see their own record (if they were authenticated via Supabase Auth, 
-- but since we use custom PIN auth, the RPC handles the "login").
-- For now, we just ensure NO public select policy exists.

-- 4. Grant Execute Permission (if needed for anon role)
grant execute on function verify_user_credentials(text, text, text) to anon;
grant execute on function verify_user_credentials(text, text, text) to authenticated;
