create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  species_id uuid references public.species(id) on delete cascade,
  locale text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.knowledge_articles disable row level security;

revoke all on public.knowledge_articles from anon;
revoke all on public.knowledge_articles from authenticated;

create table public.knowledge_article_locale (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.knowledge_articles(id) on delete cascade,
  locale text not null,
  title text,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (article_id, locale)
);

alter table public.knowledge_article_locale disable row level security;

revoke all on public.knowledge_article_locale from anon;
revoke all on public.knowledge_article_locale from authenticated;

create table public.knowledge_article_tags (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.knowledge_articles(id) on delete cascade,
  tag text not null
);

alter table public.knowledge_article_tags disable row level security;

revoke all on public.knowledge_article_tags from anon;
revoke all on public.knowledge_article_tags from authenticated;
