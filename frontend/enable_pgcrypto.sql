-- HOTFIX (v2): Enable pgcrypto with Explicit Schema Pathing
-- Run this in your Supabase SQL Editor

-- 1. Ensure extension is enabled in the extensions schema
create extension if not exists pgcrypto with schema extensions;

-- 2. Update verify_user_credentials with broad search_path
-- Note: We include 'extensions' and 'public' and use extensions.crypt to be 100% sure.

create or replace function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (user_id text, user_name text, user_role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select 
    u.id::text as user_id, 
    p_name as user_name,
    u.role::text as user_role
  from public.users u
  where u.role = p_role
  and u.pin = extensions.crypt(p_pin, u.pin) -- Explicitly call from extensions schema
  limit 1;
end;
$$;

-- 3. Update existing PINs using the qualified function
update public.users 
set pin = extensions.crypt('884876', extensions.gen_salt('bf')) 
where name = 'Admin';

update public.users 
set pin = extensions.crypt('836548', extensions.gen_salt('bf')) 
where role = 'driver';
