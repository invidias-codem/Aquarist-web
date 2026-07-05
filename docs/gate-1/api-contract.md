# API Contract — Aquarist Phase 1

## Purpose

Aquarist Phase 1 is a mobile-first hobbyist application for:
- tank profiles
- livestock tracking
- manual water parameter logging
- threshold tracking and alerts
- maintenance tasks/reminders
- offline reference knowledge base
- deterministic species compatibility checks
- support mode explanations

## Explicit non-goals

These are not part of this contract:
- marketplace / commerce
- social/community features
- store-side operations
- hardware control / telemetry
- camera-based identification
- AI diagnosis / treatment recommendations
- full offline write/sync

## Contract assumptions

- Managed auth exists outside this doc; all domain endpoints require an authenticated user context
- Reference content is read-only to end users
- Compatibility is deterministic rule evaluation, not generative AI
- Offline support is read-only reference bundle caching, not offline mutation sync
- Phase 1 is single-user ownership per tank

## Common conventions

- Base path: `/v1`
- JSON request/response
- Auth: `Authorization: Bearer <token>`
- Locale query/header supported on reference endpoints: `locale=en-US`
- Unknown request fields are rejected
- Errors follow `error-contract.md`

---

## Reference bundle and offline knowledge base

### `GET /v1/reference/manifest`
Returns latest read-only content bundle metadata for offline caching.

**Query**
- `locale` optional, default user locale
- `current_bundle_version` optional

**Response**
- `bundle_version`
- `resolved_locale`
- `fallback_locale`
- `generated_at`
- `min_supported_app_version`
- `checksums`
  - `species_index`
  - `knowledge_articles`
  - `support_templates`
- `delta_available` boolean

### `GET /v1/reference/bundles/{bundleVersion}`
Returns the offline reference payload for the requested bundle.

**Response**
- `bundle_version`
- `resolved_locale`
- `species_cards[]`
  - `species_id`
  - `canonical_name`
  - `scientific_name`
  - `phase1_availability`
  - `summary`
  - `care_level`
  - `tank_classes`
  - `search_aliases[]`
- `knowledge_articles[]`
  - `article_slug`
  - `title`
  - `summary`
  - `body_blocks[]`
  - `related_species_ids[]`
  - `tags[]`
- `support_templates[]`
  - `template_key`
  - `title`
  - `body`

---

## Species catalog and searchability

### `GET /v1/species`
Search species by canonical name or alias.

**Query**
- `q` optional
- `tank_class` optional: `freshwater | planted_freshwater | brackish | saltwater | reef`
- `availability` optional, default `supported,searchable_only`
- `limit` optional
- `cursor` optional
- `locale` optional

**Response**
- `items[]`
  - `species_id`
  - `canonical_name`
  - `scientific_name`
  - `matched_alias` nullable
  - `phase1_availability`
    - `supported | searchable_only`
  - `review_status`
  - `summary`
  - `care_level`
  - `supported_features`
    - `compatibility_check`
    - `threshold_guidance`
    - `support_mode`
- `next_cursor`

**Unsupported species behavior**
- `searchable_only` species appear in results
- `excluded` species do not appear in public results

### `GET /v1/species/{speciesId}`
Get a species profile.

**Query**
- `locale` optional
- `include` optional: `care,parameters,knowledge`

**Response**
- `species_id`
- `canonical_name`
- `scientific_name`
- `aliases[]`
- `phase1_availability`
- `review_status`
- `resolved_locale`
- `fallback_locale`
- `summary`
- `care_profile`
  - `temperament`
  - `diet`
  - `care_level`
  - `minimum_tank_volume_liters`
  - `group_minimum`
  - `environment_notes[]`
- `parameter_profile`
  - `temperature_c`
  - `ph`
  - `salinity_sg` nullable
  - `gh_dgh` nullable
  - `kh_dkh` nullable
  - `alkalinity_dkh` nullable
- `supported_features`
  - `compatibility_check`
  - `threshold_guidance`
  - `support_mode`
- `related_knowledge[]`

**Unsupported species behavior**
- `searchable_only` species return a profile, but `supported_features.compatibility_check` may be `false`
- `excluded` species return `404`

---

## Deterministic compatibility checking against a selected tank

### `POST /v1/compatibility/check`
Evaluate one candidate species against one selected tank.

**Request**
- `tank_id`
- `candidate_species_id`
- `include_support_mode` boolean optional, default `false`
- `locale` optional

**Evaluation inputs**
- tank class
- tank volume
- effective tank thresholds
- current livestock
- candidate species profile
- deterministic compatibility rules

**Response**
- `tank_id`
- `candidate_species_id`
- `result_class`
  - `compatible`
  - `compatible_with_caution`
  - `not_compatible`
  - `unknown`
- `is_supported_for_phase1`
- `findings`
  - `blocking[]`
  - `caution[]`
  - `unknown[]`
- `matched_occupants[]`
- `missing_tank_requirements[]`
- `support_mode` nullable
  - `headline`
  - `summary`
  - `reason_blocks[]`
  - `suggested_actions[]`
  - `disclaimer`

**Unsupported species behavior**
- If candidate species is `searchable_only`, response is HTTP `200` with `result_class = "unknown"`
- `is_supported_for_phase1 = false`
- explanation states limited support
- no fifth compatibility class may be introduced

---

## Tank profiles

### `POST /v1/tanks`
Create tank profile.

**Request**
- `name`
- `tank_class`
- `volume_liters`
- `started_on` optional
- `lifecycle_stage` optional
- `location_label` optional
- `notes` optional

### `GET /v1/tanks`
List tanks for current user.

### `GET /v1/tanks/{tankId}`
Get tank detail.

### `PATCH /v1/tanks/{tankId}`
Update mutable tank fields.

**Restricted**
- `tank_class` cannot be changed once livestock or logs exist

### `POST /v1/tanks/{tankId}/archive`
Archive tank and preserve history.

---

## Livestock tracking

### `GET /v1/tanks/{tankId}/livestock`
List livestock entries for tank.

### `POST /v1/tanks/{tankId}/livestock`
Add livestock entry.

**Request**
- `species_id`
- `quantity`
- `added_on` optional
- `notes` optional
- `compatibility_acknowledged` optional
- `unsupported_acknowledged` optional

**Behavior**
- Supported species:
  - add allowed if compatibility is `compatible`
  - add allowed with acknowledgement if `compatible_with_caution`
  - add blocked if `not_compatible`
  - add allowed with acknowledgement if `unknown`
- Searchable-only species:
  - add allowed only with `unsupported_acknowledged=true`
  - stored with `support_level = limited`
  - no auto-seeded guidance/tasks from species profile

### `PATCH /v1/tanks/{tankId}/livestock/{livestockEntryId}`
Update quantity, notes, or status.

### `DELETE /v1/tanks/{tankId}/livestock/{livestockEntryId}`
Soft-remove livestock entry.

---

## Manual water parameter logging

### `POST /v1/tanks/{tankId}/parameter-logs`
Create one log session with one or more measurements.

**Request**
- `observed_at`
- `measurements[]`
  - `parameter_code`
  - `value`
  - `unit`

### `GET /v1/tanks/{tankId}/parameter-logs`
Query parameter history.

---

## Threshold tracking and alerts

### `GET /v1/tanks/{tankId}/thresholds`
Get effective tank thresholds.

### `PUT /v1/tanks/{tankId}/thresholds`
Replace user overrides for tank thresholds.

### `GET /v1/tanks/{tankId}/alerts`
Get open/resolved alerts.

### `POST /v1/tanks/{tankId}/alerts/{alertId}/acknowledge`
Acknowledge alert.

---

## Maintenance tasks and reminders

### `GET /v1/tanks/{tankId}/tasks`
List maintenance tasks.

### `POST /v1/tanks/{tankId}/tasks`
Create maintenance task.

### `PATCH /v1/tanks/{tankId}/tasks/{taskId}`
Update task.

### `POST /v1/tanks/{tankId}/tasks/{taskId}/complete`
Mark task complete and generate next occurrence if recurring.

**Reminder behavior**
- Server stores due state
- Client notification delivery may be local/mobile-side in Phase 1
- No push delivery contract is added here

---

## Offline knowledge article access

### `GET /v1/knowledge/articles`
Search knowledge base.

### `GET /v1/knowledge/articles/{articleSlug}`
Fetch article detail.
