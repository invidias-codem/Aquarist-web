create table public.species_aliases (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  alias text not null,
  locale text,
  created_at timestamptz default now()
);

create unique index idx_species_aliases_searchable on public.species_aliases (species_id, alias, locale);

alter table public.species_aliases disable row level security;

revoke all on public.species_aliases from anon;
revoke all on public.species_aliases from authenticated;
