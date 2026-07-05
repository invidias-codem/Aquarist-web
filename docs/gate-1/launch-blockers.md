# Gate 1 Launch Blockers

These blockers keep Gate 1 from being audit-ready.

## 1. Species launch subset is not frozen
Every species must be explicitly marked as:
- `supported`
- `searchable_only`
- `excluded`

## 2. Canonical taxonomy / alias authority is not frozen
Each species must have exactly one canonical identity for Phase 1.
Aliases must resolve to that identity without duplicate launch records.

## 3. Threshold default policy is not fully frozen
This pack assumes:
- tank-class defaults
- user overrides
- no species-driven threshold rewriting in Phase 1

## 4. Localization launch scope is not frozen
This pack assumes:
- localization-ready architecture now
- `en-US` source content
- fallback allowed
- full multi-language launch content is not yet required
