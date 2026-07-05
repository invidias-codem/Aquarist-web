create table public.tanks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  display_name text,
  tank_class public.tank_class not null,
  volume_value numeric(12,4),
  volume_unit public.volume_unit,
  lifecycle_stage public.lifecycle_stage default 'setup',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived boolean default false
);

create index idx_tanks_user_archived on public.tanks (user_id, archived);

alter table public.tanks disable row level security;

revoke all on public.tanks from anon;
revoke all on public.tanks from authenticated;
