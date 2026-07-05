# 🐠 Aquarist
**Mobile-first aquarium management platform, built from v2.5 Gate 1 contracts.**

This repo is the canonical implementation of the Aquarist mobile track. It replaces retired web-era artifacts with a Turborepo monorepo, shared domain source of truth, and Supabase-backed mobile foundation.

## 📌 Current state

| Item | Status |
|------|--------|
| Gate 1 source of truth | Restored under `docs/gate-1/` as v2.5 |
| Mobile-contract option | B |
| App track | Expo/React Native mobile (iOS + Android) |
| Backend | Supabase Auth + Edge Functions |
| Docs | See `docs/gate-1/` and `docs/gate-2/` |
| Docs redeployment artifact | `vercel.json` retained for later review |
| Vercel hosting | Not re-enabled |
| Local database certification | B-2 until this repo only contains mobile v2.5 schema |
| Local migration catalog | `docs/gate-2/phase-c-migration-checklist.md` |

Blockers:
- **B-2:** requires a local environment with Docker Desktop + Supabase CLI to run `supabase db reset` and certify the 23-mobile migration set.

## 🗂️ Repo structure

```
aquarist-web/
├── apps/
│   ├── mobile/                  # Expo/React Native app
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── App.tsx
│   └── api/                     # Supabase Edge Functions
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── functions/
│               ├── health/index.ts
│               ├── ready/index.ts
│               └── tanks/[id]/index.ts
├── packages/
│   └── shared/                  # Single source of truth
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── enums.ts         # tank_class, alert_status, parameter_code, ...
│       │   ├── errors.ts        # 19 error codes, response types
│       │   ├── constants.ts     # field length limits
│       │   ├── units.ts         # °F/°C single converter
│       │   └── index.ts
│       └── __tests__/
├── docs/
│   ├── gate-1/                  # v2.5 source of truth
│   └── gate-2/                  # Phase C/D/F manifests and checklists
├── turbo.json
├── .github/workflows/ci.yml
└── package.json
```

## ⚙️ Development

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev
```

## 🚢 Releases

This repo uses phased gate execution:
- Gate 0/1: requirements and contracts
- Gate 2: monorepo foundation, CI, migrations, Edge Functions
- Gate 3+: feature build after B-2/local cert is complete

## 🔒 Security and scope guardrails

Scope is bounded by `docs/gate-1/*`. Do not add marketplace, social/community, hardware control, AI diagnosis, full offline sync, complex roles, freeform notes, or destructive cron outside an approved 9-point proposal.

## 📝 License

Private project. All rights reserved.
