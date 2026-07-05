create table public.species (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  scientific_name text,
  support_level public.support_level default 'supported',
  review_status public.review_status default 'stable',
  primary_source text,
  provenance_confidence numeric(5,4),
  phase1_availability public.phase1_availability not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.species disable row level security;

revoke all on public.species from anon;
revoke all on public.species from authenticated;
