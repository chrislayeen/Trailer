-- FIX: Secure Authentication RPC
-- Resolves "structure of query does not match function result type" error

-- 1. Drop the existing function to ensure a clean slate
drop function if exists verify_user_credentials(text, text, text);

-- 2. Recreate the function with EXPLICIT column aliases matches
-- We use distinct names for the return table to prevent ambiguity
create function verify_user_credentials(p_name text, p_pin text, p_role text)
returns table (user_id uuid, user_name text, user_role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    u.id::uuid as user_id, 
    u.name::text as user_name, 
    u.role::text as user_role
  from public.users u
  where u.name ilike p_name
  and u.pin = p_pin
  and u.role = p_role;
end;
$$;

-- 3. Grant permissions again to be sure
grant execute on function verify_user_credentials(text, text, text) to anon;
grant execute on function verify_user_credentials(text, text, text) to authenticated;
