-- RESTORE DRIVER ACCESS
-- Run this script to ensure at least one Driver exists for testing.

-- 1. Insert or Update a Test Driver
-- Name: Driver 1
-- PIN: 836548 (Same as the old hardcoded PIN)
insert into public.users (name, pin, role)
values ('Driver 1', '836548', 'driver')
on conflict (name) do update
set pin = '836548', role = 'driver';

-- 2. Insert a second driver for variety (Optional)
insert into public.users (name, pin, role)
values ('Driver 2', '123456', 'driver')
on conflict (name) do nothing;

-- 3. Verify
select * from public.users where role = 'driver';
