-- Add window tracking and archive metadata to tasks
alter table public.tasks add column if not exists window_date date;
alter table public.tasks add column if not exists original_window_date date;
alter table public.tasks add column if not exists deferred_to_date date;
alter table public.tasks add column if not exists archived_at timestamptz;

-- Backfill existing rows
update public.tasks
  set window_date = date(created_at)
  where window_date is null;

update public.tasks
  set original_window_date = date(created_at)
  where original_window_date is null;

-- Enforce defaults and constraints
alter table public.tasks alter column window_date set not null;
alter table public.tasks alter column window_date set default current_date;
alter table public.tasks alter column original_window_date set not null;
alter table public.tasks alter column original_window_date set default current_date;

-- Helpful indexes
create index if not exists tasks_window_date_idx on public.tasks(window_date);
create index if not exists tasks_original_window_date_idx on public.tasks(original_window_date);
