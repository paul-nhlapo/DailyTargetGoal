-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Users are managed by Supabase Auth (auth.users)

-- User preferences table
create table if not exists public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  work_start_hour integer not null default 4,
  work_duration_hours integer not null default 16,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  category text default 'Other',
  start_time timestamptz,
  end_time timestamptz,
  completed boolean not null default false,
  completed_at timestamptz,
  window_date date not null default current_date,
  original_window_date date not null default current_date,
  deferred_to_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.user_preferences enable row level security;
alter table public.tasks enable row level security;

-- Policies for user_preferences
drop policy if exists "Users can manage own preferences" on public.user_preferences;
create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies for tasks
drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes
create index if not exists tasks_window_date_idx on public.tasks(window_date);
create index if not exists tasks_original_window_date_idx on public.tasks(original_window_date);

-- Triggers for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();

drop trigger if exists set_preferences_updated_at on public.user_preferences;
create trigger set_preferences_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();
