# Aquarist — Handoff Review Guide
**Audience:** Reviewer, QA engineer, or future engineer handing this repo after Gate 1/2. **Authority source:** `docs/gate-1/*`

## What to trust first
1. `docs/gate-1/README-source-of-truth.md`
2. Authority order table in that README
3. `docs/gate-1/schema-draft.md`
4. `docs/gate-1/api-contract.md`

## What is NOT authoritative
- Files under `03_reference_archive/`: web-era prototype, divergence expected
- `vercel.json`: retained artifact, do not assume live deployment

## Gate 1 handoff checklist
- [ ] `docs/gate-1/` contains v2.5 files and no stale v1.1 copies
- [ ] `tank_class` has 5 values: `freshwater`, `planted_freshwater`, `brackish`, `saltwater`, `reef`
- [ ] `schema-draft.md` shows 22 tables and no `notes` table
- [ ] `api-contract.md` shows 26 approved endpoints
- [ ] `packages/shared/src/enums.ts`, `errors.ts`, `constants.ts`, `units.ts` match the v2.5 contract

## Gate 2 handoff checklist
- [ ] Phases A/B/C/D/E/F added in `docs/gate-2/`
- [ ] Monorepo workspace health passes: `npm install && npm run typecheck`
- [ ] `apps/mobile` and `apps/api` resolve `@aquarist/shared`
- [ ] Local Docker certification remains blocked only behind B-2
- [ ] `supabase/migrations/` is clean and matches `docs/gate-2/phase-c-migration-checklist.md`
- [ ] No web-era artifacts active outside `03_reference_archive/`

## Recovering from drift
If you find schema or code drift vs source-of-truth:
1. Determine the authoritative version from `docs/gate-1/*`
2. Update `packages/shared` first
3. Update app/schema/docs to match
4. Do not bypass the authority order
