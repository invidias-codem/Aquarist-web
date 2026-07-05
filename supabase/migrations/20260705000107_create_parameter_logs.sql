create table public.parameter_log_sessions (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  performed_at timestamptz default now(),
  note text,
  created_at timestamptz default now()
);

alter table public.parameter_log_sessions disable row level security;

revoke all on public.parameter_log_sessions from anon;
revoke all on public.parameter_log_sessions from authenticated;

create table public.parameter_log_measurements (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.parameter_log_sessions(id) on delete cascade,
  parameter_code public.parameter_code not null,
  value numeric(12,4) not null,
  unit text not null,
  created_at timestamptz default now()
);

alter table public.parameter_log_measurements disable row level security;

revoke all on public.parameter_log_measurements from anon;
revoke all on public.parameter_log_measurements from authenticated;
