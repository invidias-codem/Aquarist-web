# Aquarist PRD — Phase 1

## Product definition

Aquarist is a mobile-first aquarium care app for hobbyists. Phase 1 is focused on helping users maintain stable tanks, avoid livestock loss, reduce maintenance burnout, and get clearer explanations when species or water conditions are risky.

## Core user problems

- Invisible chemistry problems cause livestock loss before users understand what is wrong
- Species/water mismatch causes preventable livestock deaths
- Manual maintenance becomes a second job and drives burnout
- Contradictory advice leaves users without a trusted decision path
- First-year hobbyists quit because they cannot see risk early enough

## Target user

Primary target:
- hobbyist aquarists in the first year of ownership

Secondary target:
- intermediate hobbyists managing multiple tanks and routine maintenance burden

## Phase 1 outcomes

1. Let a user represent their tank accurately
2. Let a user log manual water parameters and understand threshold risk
3. Let a user track livestock and check deterministic compatibility against a selected tank
4. Let a user manage maintenance tasks and reminders
5. Let a user access an offline reference knowledge base and species profiles
6. Let a user receive support-mode explanations that explain risk without diagnosing disease or prescribing treatment

## Included scope

- tank profiles
- livestock tracking
- manual water parameter logging
- threshold tracking and alerts
- maintenance tasks/reminders
- offline reference knowledge base
- deterministic species compatibility checking
- support mode explanations

## Excluded scope

- marketplace
- social/community
- store-side operations
- hardware control
- camera-based species identification
- AI diagnosis/treatment
- full offline write/sync unless separately approved

## Product truths

The product is not generic logging software.
The core pain is:
- invisible chemistry problems
- livestock loss from species/water mismatch
- maintenance burnout
- contradictory advice
- first-year hobbyist attrition

## Phase 1 architecture principles

- mobile-first
- contract-first
- deterministic compatibility engine
- offline read support for reference content
- localization-ready content model
- server-side validation
- stable error envelope

## Release constraint

Do not treat raw species research as launch truth.
Species and knowledge data must be reviewed and explicitly marked for launch use.
