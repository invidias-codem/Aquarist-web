create type public.rule_type as enum ('compatible','incompatible','caution');
create type public.severity as enum ('info','warning','critical');

create table public.compatibility_rules (
  id uuid primary key default gen_random_uuid(),
  species_a uuid not null references public.species(id) on delete cascade,
  species_b uuid not null references public.species(id) on delete cascade,
  rule_type public.rule_type not null,
  severity public.severity default 'info',
  note text,
  created_at timestamptz default now()
);

alter table public.compatibility_rules disable row level security;

revoke all on public.compatibility_rules from anon;
revoke all on public.compatibility_rules from authenticated;
