create table public.support_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text,
  created_at timestamptz default now()
);

alter table public.support_templates disable row level security;

revoke all on public.support_templates from anon;
revoke all on public.support_templates from authenticated;

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.support_templates(id),
  session_topic text,
  body text,
  sender text,
  created_at timestamptz default now()
);

alter table public.support_messages disable row level security;

revoke all on public.support_messages from anon;
revoke all on public.support_messages from authenticated;
