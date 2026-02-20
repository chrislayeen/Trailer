-- RESTORE ADMIN ACCESS
-- Run this script to ensure the Admin user exists with the PIN you expect

-- 1. Insert or Update the Admin User
-- We use ON CONFLICT to update if "Admin" already exists, or INSERT if missing.
insert into public.users (name, pin, role)
values ('Admin', '884876', 'admin')
on conflict (name) do update
set pin = '884876', role = 'admin';

-- 2. Verify (Optional, will show in results)
select * from public.users where name = 'Admin';
