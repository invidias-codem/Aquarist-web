create table public.livestock_entries (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  species_id uuid,
  common_name text not null,
  support_level public.support_level default 'supported',
  quantity integer default 1,
  notes text,
  acquired_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_livestock_entries_tank_active on public.livestock_entries (tank_id);

alter table public.livestock_entries disable row level security;

revoke all on public.livestock_entries from anon;
revoke all on public.livestock_entries from authenticated;
