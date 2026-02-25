-- Deals table for cached rewards
create table if not exists public.deals (
  id uuid primary key default uuid_generate_v4(),
  store text not null,
  product text not null,
  discount text not null,
  price text,
  url text not null,
  emoji text default '🎁',
  day_of_week integer, -- 0=Sunday, 6=Saturday (null = show any day)
  priority integer default 0, -- Higher priority shows first
  expires_at timestamptz not null default (now() + interval '3 days'),
  created_at timestamptz not null default now()
);

-- Index for fast queries
create index if not exists deals_expires_at_idx on public.deals(expires_at);
create index if not exists deals_day_priority_idx on public.deals(day_of_week, priority desc);

-- Auto-delete expired deals (runs daily)
create or replace function delete_expired_deals()
returns void as $$
begin
  delete from public.deals where expires_at < now();
end;
$$ language plpgsql;

-- No RLS needed - deals are public for all users
alter table public.deals enable row level security;
create policy "Deals are public" on public.deals for select using (true);
