alter table public.tanks enable row level security;
alter table public.tank_thresholds enable row level security;
alter table public.livestock_entries enable row level security;
alter table public.parameter_log_sessions enable row level security;
alter table public.parameter_log_measurements enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_task_events enable row level security;
alter table public.alerts enable row level security;

create policy tanks_owner_select on public.tanks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = tanks.user_id
        and users.auth_subject = public.user_id()
    )
  );

create policy tanks_owner_insert on public.tanks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users
      where users.id = tanks.user_id
        and users.auth_subject = public.user_id()
    )
  );

create policy tanks_owner_update on public.tanks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = tanks.user_id
        and users.auth_subject = public.user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = tanks.user_id
        and users.auth_subject = public.user_id()
    )
  );

create policy tank_thresholds_owner_select on public.tank_thresholds
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = tank_thresholds.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy tank_thresholds_owner_insert on public.tank_thresholds
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = tank_thresholds.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy tank_thresholds_owner_update on public.tank_thresholds
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = tank_thresholds.tank_id
        and u.auth_subject = public.user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = tank_thresholds.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy livestock_owner_select on public.livestock_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = livestock_entries.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy livestock_owner_insert on public.livestock_entries
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = livestock_entries.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy livestock_owner_update on public.livestock_entries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = livestock_entries.tank_id
        and u.auth_subject = public.user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = livestock_entries.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy parameter_log_owner_select on public.parameter_log_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = parameter_log_sessions.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy parameter_log_owner_insert on public.parameter_log_sessions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = parameter_log_sessions.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy parameter_measurement_owner_select on public.parameter_log_measurements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.parameter_log_sessions s
      join public.tanks t on t.id = s.tank_id
      join public.users u on u.id = t.user_id
      where s.id = parameter_log_measurements.session_id
        and u.auth_subject = public.user_id()
    )
  );

create policy parameter_measurement_owner_insert on public.parameter_log_measurements
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.parameter_log_sessions s
      join public.tanks t on t.id = s.tank_id
      join public.users u on u.id = t.user_id
      where s.id = parameter_log_measurements.session_id
        and u.auth_subject = public.user_id()
    )
  );

create policy maintenance_owner_select on public.maintenance_tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = maintenance_tasks.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy maintenance_owner_insert on public.maintenance_tasks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = maintenance_tasks.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy maintenance_owner_update on public.maintenance_tasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = maintenance_tasks.tank_id
        and u.auth_subject = public.user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = maintenance_tasks.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy alerts_owner_select on public.alerts
  for select
  to authenticated
  using (
    alerts.tank_id is null
    or exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = alerts.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy alerts_owner_insert on public.alerts
  for insert
  to authenticated
  with check (
    alerts.tank_id is null
    or exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = alerts.tank_id
        and u.auth_subject = public.user_id()
    )
  );

create policy alerts_owner_update on public.alerts
  for update
  to authenticated
  using (
    alerts.tank_id is null
    or exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = alerts.tank_id
        and u.auth_subject = public.user_id()
    )
  )
  with check (
    alerts.tank_id is null
    or exists (
      select 1
      from public.tanks t
      join public.users u on u.id = t.user_id
      where t.id = alerts.tank_id
        and u.auth_subject = public.user_id()
    )
  );
