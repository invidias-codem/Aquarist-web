create table public.maintenance_task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.maintenance_tasks(id) on delete cascade,
  event_type text not null,
  note text,
  created_at timestamptz default now()
);

alter table public.maintenance_task_events disable row level security;

revoke all on public.maintenance_task_events from anon;
revoke all on public.maintenance_task_events from authenticated;
