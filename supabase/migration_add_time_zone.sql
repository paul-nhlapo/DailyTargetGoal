alter table public.user_preferences add column if not exists time_zone text;

update public.user_preferences
  set time_zone = 'Africa/Johannesburg'
  where time_zone is null;

alter table public.user_preferences alter column time_zone set not null;
alter table public.user_preferences alter column time_zone set default 'Africa/Johannesburg';
