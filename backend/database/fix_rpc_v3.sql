-- FIX: Secure Authentication RPC (Version 3)
-- Logic Update: 
-- 1. DRIVERS: Strict check (Name + PIN must match DB).
-- 2. ADMINS: PIN check only. If PIN matches any admin record, allow access and use the provided name.

drop function if exists verify_user_credentials(text, text, text);

create function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (user_id text, user_name text, user_role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  found_record record;
begin
  -- Branch logic based on role
  if p_role = 'admin' then
    -- ADMIN LOGIC:
    -- Check if ANY admin record exists with this PIN.
    -- If yes, return that record's ID/Role, but use the p_name provided by user.
    return query
    select 
      u.id::text as user_id, 
      p_name as user_name,  -- Use the name typed in the login box
      u.role::text as user_role
    from public.users u
    where u.role = 'admin' 
    and u.pin = p_pin
    limit 1;
    
  else
    -- DRIVER/STANDARD LOGIC:
    -- Strict Name + PIN matching.
    return query
    select 
      u.id::text as user_id, 
      u.name::text as user_name, 
      u.role::text as user_role
    from public.users u
    where u.name ilike p_name
    and u.pin = p_pin
    and u.role = p_role;
  end if;
end;
$$;

grant execute on function verify_user_credentials(text, text, text) to anon;
grant execute on function verify_user_credentials(text, text, text) to authenticated;
