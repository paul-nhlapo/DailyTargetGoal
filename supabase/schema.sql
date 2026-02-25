-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Users are managed by Supabase Auth (auth.users)

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.tasks enable row level security;

-- Policies
drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
