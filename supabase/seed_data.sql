-- seeds/phase_c.sql
-- Requires local Docker and Supabase CLI.
-- Run with: supabase db reset && supabase db push && supabase seed
-- Use service role key only for local development.

insert into public.users (id)
select '00000000-0000-0000-0000-000000000001'
where not exists (select 1 from public.users where id = '00000000-0000-0000-0000-000000000001');

-- Seed default thresholds function is defined in migration 04 and can be invoked when tanks are created manually.
