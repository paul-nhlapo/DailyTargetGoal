-- Migration: Add User Preferences for Configurable Work Hours
-- Run this in Supabase SQL Editor if you already have the tasks table

-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  work_start_hour integer not null default 4,
  work_duration_hours integer not null default 16,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;

-- Create policy
drop policy if exists "Users can manage own preferences" on public.user_preferences;
create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add trigger for updated_at
drop trigger if exists set_preferences_updated_at on public.user_preferences;
create trigger set_preferences_updated_at 
  before update on public.user_preferences 
  for each row execute function public.set_updated_at();

-- Optional: Create default preferences for existing users
-- Uncomment the lines below if you want to auto-create preferences for existing users
-- insert into public.user_preferences (user_id, work_start_hour, work_duration_hours)
-- select id, 4, 16 from auth.users
-- on conflict (user_id) do nothing;
