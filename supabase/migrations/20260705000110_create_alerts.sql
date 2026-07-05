create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid references public.tanks(id) on delete cascade,
  type public.alert_type not null,
  status public.alert_status default 'active',
  title text not null,
  description text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index idx_alerts_tank_active on public.alerts (tank_id, status);

alter table public.alerts disable row level security;

revoke all on public.alerts from anon;
revoke all on public.alerts from authenticated;
