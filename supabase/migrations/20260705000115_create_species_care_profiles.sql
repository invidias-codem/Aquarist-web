create table public.species_care_profiles (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  temperament text,
  diet text,
  min_tank_size numeric(12,4),
  max_size numeric(12,4),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.species_care_profiles disable row level security;

revoke all on public.species_care_profiles from anon;
revoke all on public.species_care_profiles from authenticated;
