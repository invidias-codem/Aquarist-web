# Gate 2 Phase C — Mobile Migration Checklist

Blocked locally because this environment does not have Docker Desktop or Supabase CLI.
This manifest makes Phase C executable after B-2 is resolved.

## B-2 prerequisites
- Install Docker Desktop.
- Install Supabase CLI.
- From repo root: `supabase login && supabase init` if needed, or `supabase start`.
- Confirm `supabase/migrations/` contains only this checklist's numbered files.

## Migration inventory
Order matters. Each migration is immutable after it has run against a database.

01. `20260705000100_create_extensions.sql`  
   Preflight extensions: `uuid-ossp`, `btree_gist`, `pgcrypto`.

02. `20260705000101_create_auth_subject_rls.sql`  
   Create `users` with `auth_subject` mapped to `auth.uid()`, REVOKE default, two-client helper setup.

03. `20260705000102_create_tank_enums.sql`  
   Create `tank_class`, `lifecycle_stage`, `volume_unit`, `parameter_code`, `task_recurrence`, `alert_type`, `alert_status`, `support_level`, `review_status`, `phase1_availability`.

04. `20260705000103_create_tanks.sql`  
   Create `tanks` with `tank_class` FK enum, tank-level unique constraints, and archived-state indexes.

05. `20260705000104_seed_tank_threshold_defaults_function.sql`  
   Create deterministic seeding function for default thresholds by tank_class.

06. `20260705000105_create_tank_thresholds.sql`  
   Create `tank_thresholds` with source enum, unique `(tank_id, parameter_code, source)`.

07. `20260705000106_create_livestock_entries.sql`  
   Create `livestock_entries` with support_level enum and active-state index.

08. `20260705000107_create_parameter_logs.sql`  
   Create `parameter_log_sessions` and `parameter_log_measurements` with unique constraints per contract.

09. `20260705000108_create_maintenance_tasks.sql`  
   Create `maintenance_tasks` with task_recurrence enum and active-state index.

10. `20260705000109_create_maintenance_task_events.sql`  
    Create task completion/audit event table.

11. `20260705000110_create_alerts.sql`  
    Create `alerts` with status/enum and active-state index.

12. `20260705000111_create_species.sql`  
    Create `species` and enums: phase1_availability/review_status/support_level.

13. `20260705000112_create_species_localizations.sql`  
    Create species_i18n table with locale/fallback behavior.

14. `20260705000113_create_species_aliases.sql`  
    Create aliases table with searchability constraints.

15. `20260705000114_create_species_parameter_profiles.sql`  
    Create species parameter profile matrix.

16. `20260705000115_create_species_care_profiles.sql`  
    Create species care profiles.

17. `20260705000116_create_species_provenance.sql`  
    Create provenance records table.

18. `20260705000117_create_compatibility.sql`  
    Create compatibility rule tables + rule-type/severity enums.

19. `20260705000118_create_support.sql`  
    Create support templates tables.

20. `20260705000119_create_knowledge.sql`  
    Create knowledge article core + localization + tag/junction tables.

21. `20260705000120_create_reference_bundle.sql`  
    Create `reference_bundle_versions` and supporting catalog tables for offline bundles.

22. `20260705000121_rls_two_client_advisory_lock.sql`  
    Create two-client policy function and application advisory lock.

23. `20260705000122_apply_mobile_rls.sql`  
    Apply scoped RLS policies on every table using `p_user_id` and application booleans.

## Command sequence after B-2 is resolved
```bash
git checkout main
git pull origin main
supabase db reset
supabase db push
supabase seed
```

## Notes
- No `notes` table.
- No `auth_lockouts` artifacts.
- No `pg_cron` hard delete.
- No direct browser→PostgREST path for writes.
- Canonical temperature storage is Celsius; display-time conversion lives in `packages/shared/src/units.ts`.
