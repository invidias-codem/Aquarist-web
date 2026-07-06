create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  auth_subject uuid not null default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users disable row level security;

revoke all on public.users from anon;
revoke all on public.users from authenticated;

create or replace function public.user_id()
returns uuid
language sql stable
security definer
set search_path = ''
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;

create or replace function public.set_auth_subject()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.auth_subject := nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
  if new.auth_subject is null and TG_OP = 'INSERT' then
    new.auth_subject := new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists users_set_auth_subject on public.users;
create trigger users_set_auth_subject
  before insert on public.users
  for each row
  execute function public.set_auth_subject();

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema public to anon;
    revoke all on public.users from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema public to authenticated;
    revoke all on public.users from authenticated;
  end if;
end;
$$;

create or replace function public.two_client_session()
returns table (p_user_id uuid, app_mobile boolean, app_api boolean)
language sql stable
security definer
set search_path = ''
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid as p_user_id,
         (current_setting('request.jwt.claims', true)::json->>'app_origin' in ('mobile','app')) as app_mobile,
         (current_setting('request.jwt.claims', true)::json->>'app_origin' in ('api','edge')) as app_api;
$$;

comment on function public.two_client_session() is 'Returns the caller user id together with two application booleans derived from JWT app_origin claim.';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tank_class') then
    create type public.tank_class as enum ('freshwater','planted_freshwater','brackish','saltwater','reef');
  end if;
  if not exists (select 1 from pg_type where typname = 'lifecycle_stage') then
    create type public.lifecycle_stage as enum ('active','archived','setup','decommissioned');
  end if;
  if not exists (select 1 from pg_type where typname = 'volume_unit') then
    create type public.volume_unit as enum ('gallon','liter');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_recurrence') then
    create type public.task_recurrence as enum ('daily','weekly','biweekly','monthly','as_needed');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_type') then
    create type public.alert_type as enum ('exception','anomaly','feedback','system');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_status') then
    create type public.alert_status as enum ('active','acknowledged','resolved','suppressed');
  end if;
  if not exists (select 1 from pg_type where typname = 'support_level') then
    create type public.support_level as enum ('supported','experimental','unsupported');
  end if;
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('stable','in_review','deprecated');
  end if;
  if not exists (select 1 from pg_type where typname = 'phase1_availability') then
    create type public.phase1_availability as enum ('available','planned','excluded');
  end if;
  if not exists (select 1 from pg_type where typname = 'parameter_code') then
    create type public.parameter_code as enum ('ammonia','nitrite','nitrate','ph','alkalinity','phosphate','temperature','salinity','calcium','magnesium','potassium','copper');
  end if;
  if not exists (select 1 from pg_type where typname = 'threshold_source') then
    create type public.threshold_source as enum ('default','manual','system');
  end if;
end;
$$;
