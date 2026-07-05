create table public.tank_thresholds (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  parameter_code public.parameter_code not null,
  target_value numeric(12,4) not null,
  target_unit text not null,
  min_value numeric(12,4),
  max_value numeric(12,4),
  critical_low numeric(12,4),
  critical_high numeric(12,4),
  source public.threshold_source default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tank_id, parameter_code, source)
);

alter table public.tank_thresholds disable row level security;

revoke all on public.tank_thresholds from anon;
revoke all on public.tank_thresholds from authenticated;
