-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create sessions table
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  chassis_id text not null,
  driver_name text,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  status text check (status in ('started', 'completed', 'uploaded')) default 'started',
  gps_lat float,
  gps_lng float,
  comments text,
  user_id uuid references auth.users(id) -- Optional link to auth user if drivers log in
);

-- Create photos table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  storage_path text not null,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null,
  gps_lat float,
  gps_lng float,
  photo_type text default 'standard'
);

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;
alter table public.photos enable row level security;

-- Policies (Adjust based on auth requirements)
-- Allow anyone to read for now (or restricted to auth users)
create policy "Public sessions are viewable by everyone"
  on public.sessions for select
  using ( true );

create policy "Authenticated users can insert sessions"
  on public.sessions for insert
  with check ( auth.role() = 'anon' or auth.role() = 'authenticated' );

create policy "Public photos are viewable by everyone"
  on public.photos for select
  using ( true );

create policy "Authenticated users can insert photos"
  on public.photos for insert
  with check ( auth.role() = 'anon' or auth.role() = 'authenticated' );

-- Storage Bucket Setup (Manually create 'photos' bucket in dashboard but policies here)
-- insert into storage.buckets (id, name) values ('photos', 'photos');
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'photos' );
-- create policy "Authenticated Insert" on storage.objects for insert with check ( bucket_id = 'photos' );
