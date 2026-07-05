# Schema Draft — Aquarist Phase 1

## Enums

- `tank_class`
  - `freshwater`
  - `planted_freshwater`
  - `brackish`
  - `saltwater`
  - `reef`

- `phase1_availability`
  - `supported`
  - `searchable_only`
  - `excluded`

- `review_status`
  - `unreviewed`
  - `needs_review`
  - `reviewed`

- `compatibility_result_class`
  - `compatible`
  - `compatible_with_caution`
  - `not_compatible`
  - `unknown`

- `support_level`
  - `full`
  - `limited`

- `alert_type`
  - `parameter_threshold`
  - `task_due`

- `alert_status`
  - `open`
  - `acknowledged`
  - `resolved`

- `task_recurrence`
  - `one_time`
  - `daily`
  - `weekly`
  - `biweekly`
  - `monthly`
  - `every_n_days`

- `parameter_code`
  - `temperature_c`
  - `ph`
  - `ammonia_ppm`
  - `nitrite_ppm`
  - `nitrate_ppm`
  - `salinity_sg`
  - `gh_dgh`
  - `kh_dkh`
  - `alkalinity_dkh`
  - `calcium_ppm`
  - `magnesium_ppm`
  - `phosphate_ppm`

## Core user data

### `users`
- `id` PK
- `auth_subject` unique
- `preferred_locale`
- `created_at`
- `updated_at`

### `tanks`
- `id` PK
- `user_id` FK -> users
- `name`
- `tank_class`
- `volume_liters`
- `started_on` nullable
- `lifecycle_stage` nullable
- `location_label` nullable
- `notes` nullable
- `is_archived`
- `created_at`
- `updated_at`

### `tank_thresholds`
- `id` PK
- `tank_id` FK -> tanks
- `parameter_code`
- `min_value`
- `max_value`
- `unit`
- `source` (`system_default | user_override`)
- unique `(tank_id, parameter_code, source)`

### `livestock_entries`
- `id` PK
- `tank_id` FK -> tanks
- `species_id` FK -> species
- `quantity`
- `support_level`
- `added_on` nullable
- `notes` nullable
- `is_active`
- `created_at`
- `updated_at`

### `parameter_log_sessions`
- `id` PK
- `tank_id` FK -> tanks
- `observed_at`
- `created_by_user_id` FK -> users
- `created_at`

### `parameter_log_measurements`
- `id` PK
- `session_id` FK -> parameter_log_sessions
- `parameter_code`
- `value`
- `unit`
- unique `(session_id, parameter_code)`

### `maintenance_tasks`
- `id` PK
- `tank_id` FK -> tanks
- `title`
- `description` nullable
- `due_at` nullable
- `recurrence`
- `interval_days` nullable
- `status`
- `parameter_code` nullable
- `created_at`
- `updated_at`

### `maintenance_task_events`
- `id` PK
- `task_id` FK -> maintenance_tasks
- `event_type` (`completed | skipped | rescheduled`)
- `event_at`
- `actor_user_id` FK -> users

### `alerts`
- `id` PK
- `tank_id` FK -> tanks
- `alert_type`
- `severity`
- `status`
- `parameter_code` nullable
- `trigger_log_measurement_id` nullable FK -> parameter_log_measurements
- `trigger_task_id` nullable FK -> maintenance_tasks
- `headline_key`
- `message_key`
- `context_json`
- `created_at`
- `acknowledged_at` nullable
- `resolved_at` nullable

## Reference content model

### `species`
- `id` PK
- `canonical_name`
- `scientific_name`
- `tank_class`
- `phase1_availability`
- `review_status`
- `summary`
- `care_level`
- `minimum_tank_volume_liters` nullable
- `group_minimum` nullable
- `temperament` nullable
- `compatibility_supported` boolean
- `threshold_guidance_supported` boolean
- `support_mode_supported` boolean
- `created_at`
- `updated_at`

### `species_localizations`
- `id` PK
- `species_id` FK -> species
- `locale`
- `display_name`
- `summary`
- `care_notes`
- unique `(species_id, locale)`

### `species_aliases`
- `id` PK
- `species_id` FK -> species
- `alias`
- `normalized_alias`
- `locale` nullable
- unique `(normalized_alias, species_id)`

### `species_parameter_profiles`
- `id` PK
- `species_id` FK -> species
- `parameter_code`
- `min_value` nullable
- `max_value` nullable
- `preferred_value` nullable
- `unit`
- unique `(species_id, parameter_code)`

### `species_care_profiles`
- `id` PK
- `species_id` FK -> species
- `diet`
- `temperament`
- `special_notes`
- `environment_notes_json`

### `species_provenance_records`
- `id` PK
- `species_id` FK -> species
- `source_label`
- `source_uri` nullable
- `evidence_excerpt` nullable
- `import_batch_id` nullable
- `reviewed_by` nullable
- `reviewed_at` nullable

## Deterministic compatibility model

### `compatibility_rules`
- `id` PK
- `rule_type`
  - `tank_class`
  - `tank_volume`
  - `parameter_range`
  - `species_pair`
  - `group_size`
- `primary_species_id` FK -> species
- `secondary_species_id` nullable FK -> species
- `severity`
  - `blocker`
  - `caution`
  - `unknown`
- `predicate_json`
- `explanation_key`
- `is_active`
- `created_at`
- `updated_at`

### `support_explanation_templates`
- `id` PK
- `template_key` unique
- `locale`
- `title`
- `body`
- `disclaimer`
- unique `(template_key, locale)`

## Knowledge base model

### `knowledge_articles`
- `id` PK
- `article_slug` unique
- `status` (`published | archived`)
- `default_locale`
- `created_at`
- `updated_at`

### `knowledge_article_localizations`
- `id` PK
- `article_id` FK -> knowledge_articles
- `locale`
- `title`
- `summary`
- `body_blocks_json`
- unique `(article_id, locale)`

### `knowledge_article_species`
- `article_id` FK -> knowledge_articles
- `species_id` FK -> species
- composite PK `(article_id, species_id)`

### `knowledge_article_tags`
- `article_id` FK -> knowledge_articles
- `tag`
- composite PK `(article_id, tag)`

## Offline bundle metadata

### `reference_bundle_versions`
- `id` PK
- `bundle_version` unique
- `locale`
- `species_checksum`
- `knowledge_checksum`
- `support_checksum`
- `generated_at`
- `min_supported_app_version`
