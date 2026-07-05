create table public.species_parameter_profiles (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  parameter_code public.parameter_code not null,
  target_value numeric(12,4),
  target_unit text,
  min_value numeric(12,4),
  max_value numeric(12,4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.species_parameter_profiles disable row level security;

revoke all on public.species_parameter_profiles from anon;
revoke all on public.species_parameter_profiles from authenticated;
