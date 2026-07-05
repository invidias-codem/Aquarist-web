create table public.reference_bundle_versions (
  id uuid primary key default gen_random_uuid(),
  bundle_name text not null,
  version text not null,
  content jsonb not null,
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table public.reference_bundle_versions disable row level security;

revoke all on public.reference_bundle_versions from anon;
revoke all on public.reference_bundle_versions from authenticated;
