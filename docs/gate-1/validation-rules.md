# Validation Rules — Aquarist Phase 1

## Global rules

- All domain endpoints require authenticated user context
- All IDs must be server-generated opaque IDs
- Unknown request properties are rejected
- Empty strings are normalized to `null` only where explicitly allowed
- Locale must be a supported BCP-47 tag; unsupported locale falls back in read paths, but is rejected in write paths if persisted
- All POST endpoints should support `Idempotency-Key` at the gateway/service layer to prevent double-submit duplicates

## Tank validation

### Create / update tank
- `name`: 1–80 chars
- `tank_class`: required enum
- `volume_liters`: required, `> 0`
- `started_on`: cannot be future date
- `tank_class` change is rejected if tank has:
  - active livestock
  - parameter logs
  - user threshold overrides

### Effective threshold policy
Current Gate 1 assumption:
- system seeds thresholds by `tank_class`
- user may override per parameter
- species do not automatically rewrite thresholds in Phase 1

## Species search and alias validation

- Search input is normalized by lowercase, trim, punctuation collapse, and accent folding
- Alias collisions do not auto-merge species
- `excluded` species are omitted from public search and detail
- `searchable_only` species are visible in search and detail but flagged as limited support

## Livestock validation

### Add livestock
- `species_id` must exist and be visible to user
- `quantity` must be integer `>= 1`
- If species is `searchable_only`, request must include `unsupported_acknowledged = true`
- Compatibility pre-check rules:
  - `not_compatible` -> reject with `409`
  - `compatible_with_caution` -> require `compatibility_acknowledged = true`
  - `unknown` -> require `compatibility_acknowledged = true`
- On searchable-only add:
  - `support_level = limited`
  - no auto-seeded task templates
  - no assumption of compatibility completeness

## Parameter logging validation

- `observed_at` required
- `observed_at` cannot be more than 10 minutes in the future
- `observed_at` cannot be before tank creation date if `started_on` exists
- At least one measurement required
- No duplicate `parameter_code` within a single log session
- Values must be numeric and in allowed units

### Freshwater / planted freshwater
- `temperature_c`
- `ph`
- `ammonia_ppm`
- `nitrite_ppm`
- `nitrate_ppm`
- `gh_dgh`
- `kh_dkh`

### Brackish
- freshwater set plus `salinity_sg`

### Saltwater / reef
- `temperature_c`
- `ph`
- `ammonia_ppm`
- `nitrite_ppm`
- `nitrate_ppm`
- `salinity_sg`
- `alkalinity_dkh`
- `calcium_ppm`
- `magnesium_ppm`
- `phosphate_ppm`

- Measurements outside allowed set reject with `422`

## Threshold validation

- Each threshold row requires `parameter_code`, `min_value`, `max_value`, and `unit`
- `min_value <= max_value`
- Threshold parameter must be valid for tank class
- User cannot create duplicate overrides for the same parameter
- Unsupported parameters reject with `422`

## Compatibility validation

### Request validation
- `tank_id` required
- `candidate_species_id` required
- tank must belong to current user
- tank cannot be archived
- species must be visible

### Result-class rules
Return exactly one of four values:
- `not_compatible` if at least one blocker rule matched
- `compatible_with_caution` if no blocker matched and at least one caution matched
- `unknown` if no blocker matched and rule coverage is incomplete, required tank data is missing, or candidate/support coverage is limited
- `compatible` if full support coverage exists, no blocker matched, no caution matched, and required tank data is present

### Required tank data for compatibility
Minimum required:
- `tank_class`
- `volume_liters`
- effective threshold rows for all parameters the candidate species requires for Phase 1 checking

If required threshold rows are missing, result becomes `unknown`, not a server error.

### Unsupported species behavior
- `searchable_only` candidate -> `unknown`
- `excluded` candidate -> `404`
- `searchable_only` occupant in tank contributes `unknown` findings when relevant

## Support mode validation

- Support mode is deterministic template assembly, not freeform generation
- Support blocks may only use known explanation templates, species profile facts, rule findings, tank thresholds, and tank class metadata
- Support mode must not output diagnosis, treatment, or veterinary claims
- Support mode must explain what was checked, why the class was returned, what missing data or caution factors exist, and what the user can review next

## Knowledge article validation

- `article_slug` unique
- article body stored as structured blocks, not raw HTML blobs
- article locale fallback allowed for reads
- unpublished/archived articles omitted from public article lists

## Task validation

### Create/update task
- `title`: 1–100 chars
- `due_at` optional but if present must be valid timestamp
- `recurrence` required
- `interval_days` required only for `every_n_days`, range `1–90`
- one-time tasks cannot include `interval_days`
- completed tasks cannot be edited except status-resolving metadata

### Complete task
- completion endpoint must be idempotent
- completing a recurring task generates next due occurrence server-side

## Alert validation

- alerts are system-generated only in Phase 1
- no client-created alerts
- acknowledge only allowed for current user’s tank and alert status `open`
