create table public.species_i18n (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  locale text not null,
  common_name text,
  care_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (species_id, locale)
);

alter table public.species_i18n disable row level security;

revoke all on public.species_i18n from anon;
revoke all on public.species_i18n from authenticated;
