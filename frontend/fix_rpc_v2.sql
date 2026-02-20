-- FIX: Secure Authentication RPC (Version 2)
-- Resolves "cannot cast type bigint to uuid" error
-- The ID column is actually bigint, so we will return it as text to be safe and compatible.

drop function if exists verify_user_credentials(text, text, text);

create function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (user_id text, user_name text, user_role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    u.id::text as user_id, 
    u.name::text as user_name, 
    u.role::text as user_role
  from public.users u
  where u.name ilike p_name
  and u.pin = p_pin
  and u.role = p_role;
end;
$$;

grant execute on function verify_user_credentials(text, text, text) to anon;
grant execute on function verify_user_credentials(text, text, text) to authenticated;
