do $$
begin
  if exists (select 1 from pg_class where relname = 'two_client_lock' and relkind = 'i') then
    return;
  end if;
  create unique index if not exists two_client_lock
    on pg_locks(null)
    where pg_try_advisory_xact_lock(hashtext('aquarist_two_client_session'));
end;
$$;

create or replace function public.application_two_client_lock()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not pg_try_advisory_xact_lock(hashtext('aquarist_two_client_session')) then
    raise exception 'application two-client lock could not be acquired';
  end if;
end;
$$;

comment on function public.application_two_client_lock() is 'Application-scoped advisory lock for two-client coordination.';
