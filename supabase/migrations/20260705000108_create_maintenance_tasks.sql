create table public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  title text not null,
  description text,
  recurrence public.task_recurrence default 'weekly',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_maintenance_tasks_tank_active on public.maintenance_tasks (tank_id);

alter table public.maintenance_tasks disable row level security;

revoke all on public.maintenance_tasks from anon;
revoke all on public.maintenance_tasks from authenticated;
