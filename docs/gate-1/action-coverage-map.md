# Action Coverage Map — Aquarist Phase 1

## Coverage statuses

- Covered
- Covered (limited support)
- Intentionally out of scope
- Blocked by launch-data freeze

## Core Phase 1 actions

| User action | Endpoint | Service boundary | Primary tables | Status |
|---|---|---|---|---|
| Download offline reference manifest | `GET /v1/reference/manifest` | `reference-bundle-service` | `reference_bundle_versions` | Covered |
| Download offline reference bundle | `GET /v1/reference/bundles/{bundleVersion}` | `reference-bundle-service` | `reference_bundle_versions`, reference tables | Covered |
| Search species by name or alias | `GET /v1/species` | `species-catalog-service` | `species`, `species_aliases`, `species_localizations` | Covered |
| View species profile | `GET /v1/species/{speciesId}` | `species-catalog-service` | `species`, `species_parameter_profiles`, `species_care_profiles` | Covered |
| View searchable-only species profile | `GET /v1/species/{speciesId}` | `species-catalog-service` | same | Covered (limited support) |
| Create tank profile | `POST /v1/tanks` | `tank-service` | `tanks` | Covered |
| View tank list | `GET /v1/tanks` | `tank-service` | `tanks`, `alerts`, `maintenance_tasks`, `livestock_entries` | Covered |
| View tank detail | `GET /v1/tanks/{tankId}` | `tank-service` | same | Covered |
| Edit tank profile | `PATCH /v1/tanks/{tankId}` | `tank-service` | `tanks` | Covered |
| Archive tank | `POST /v1/tanks/{tankId}/archive` | `tank-service` | `tanks` | Covered |
| Check candidate species against selected tank | `POST /v1/compatibility/check` | `compatibility-service` | `tanks`, `tank_thresholds`, `livestock_entries`, `species`, `compatibility_rules` | Covered |
| View support explanation for compatibility result | `POST /v1/compatibility/check` with `include_support_mode=true` | `compatibility-service` + `support-explainer` | `compatibility_rules`, `support_explanation_templates` | Covered |
| Add supported species to tank | `POST /v1/tanks/{tankId}/livestock` | `livestock-service` | `livestock_entries`, compatibility read path | Covered |
| Add searchable-only species to tank | `POST /v1/tanks/{tankId}/livestock` | `livestock-service` | `livestock_entries` | Covered (limited support) |
| Edit livestock entry | `PATCH /v1/tanks/{tankId}/livestock/{livestockEntryId}` | `livestock-service` | `livestock_entries` | Covered |
| Remove livestock entry | `DELETE /v1/tanks/{tankId}/livestock/{livestockEntryId}` | `livestock-service` | `livestock_entries` | Covered |
| Log manual water test | `POST /v1/tanks/{tankId}/parameter-logs` | `parameter-log-service` | `parameter_log_sessions`, `parameter_log_measurements`, `alerts` | Covered |
| View parameter history | `GET /v1/tanks/{tankId}/parameter-logs` | `parameter-log-service` | same | Covered |
| View effective thresholds | `GET /v1/tanks/{tankId}/thresholds` | `threshold-service` | `tank_thresholds` | Covered |
| Update threshold overrides | `PUT /v1/tanks/{tankId}/thresholds` | `threshold-service` | `tank_thresholds` | Covered |
| View open threshold/task alerts | `GET /v1/tanks/{tankId}/alerts` | `alert-service` | `alerts` | Covered |
| Acknowledge alert | `POST /v1/tanks/{tankId}/alerts/{alertId}/acknowledge` | `alert-service` | `alerts` | Covered |
| Create maintenance task | `POST /v1/tanks/{tankId}/tasks` | `task-service` | `maintenance_tasks` | Covered |
| Edit maintenance task | `PATCH /v1/tanks/{tankId}/tasks/{taskId}` | `task-service` | `maintenance_tasks` | Covered |
| Complete maintenance task | `POST /v1/tanks/{tankId}/tasks/{taskId}/complete` | `task-service` | `maintenance_tasks`, `maintenance_task_events` | Covered |
| Search knowledge articles | `GET /v1/knowledge/articles` | `knowledge-service` | `knowledge_articles`, `knowledge_article_localizations`, `knowledge_article_tags` | Covered |
| View knowledge article detail | `GET /v1/knowledge/articles/{articleSlug}` | `knowledge-service` | same | Covered |

## Intentionally out of scope to prevent drift

- Buy livestock/equipment in-app
- Social posting, comments, moderation flows
- Camera-based species recognition
- AI diagnosis or treatment recommendation
- Hardware pairing, telemetry ingestion, remote control
- Full offline write/sync conflict resolution

## Audit blockers

- Species support matrix not frozen
- Canonical taxonomy / alias authority not frozen
- Threshold default source policy not frozen beyond tank-class defaults
- Translation scope for launch content not frozen
