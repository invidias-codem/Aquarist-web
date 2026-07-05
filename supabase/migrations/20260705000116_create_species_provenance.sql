create table public.species_provenance (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  source text,
  retrieved_at timestamptz default now(),
  confidence numeric(5,4),
  details jsonb
);

alter table public.species_provenance disable row level security;

revoke all on public.species_provenance from anon;
revoke all on public.species_provenance from authenticated;
