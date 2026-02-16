-- FIX: Secure Authentication RPC (Version 4)
-- Logic Update: 
-- 1. ADMINS: Flexible Name + Strict PIN (884876)
-- 2. DRIVERS: Flexible Name + Strict PIN (836548)

-- Both roles now allow ANY name as long as the correct role-specific PIN is provided.

drop function if exists verify_user_credentials(text, text, text);

create function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (user_id text, user_name text, user_role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  -- We don't need a specific record variable since we return query directly
begin
  -- UNIFIED LOGIC FOR FLEXIBLE LOGIN:
  -- We check if ANY user exists with the given PIN and ROLE.
  -- If yes, we allow access and return the name the user TYPED (p_name).
  -- This effectively serves as a "Group Password" for that role.
  
  return query
  select 
    u.id::text as user_id, 
    p_name as user_name,  -- Use the name typed in the login box
    u.role::text as user_role
  from public.users u
  where u.role = p_role -- Must match the requested role (admin or driver)
  and u.pin = p_pin     -- Must match the valid PIN for that role in DB
  limit 1;
  
  -- Note: This assumes you have at least one 'admin' and one 'driver' row in DB 
  -- with the correct PINs to validate against.
end;
$$;

grant execute on function verify_user_credentials(text, text, text) to anon;
grant execute on function verify_user_credentials(text, text, text) to authenticated;
