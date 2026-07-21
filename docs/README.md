# GEM Enterprise Documentation Index

## Canonical architecture and deployment

- [`CANONICAL_PRODUCTION_ARCHITECTURE.md`](CANONICAL_PRODUCTION_ARCHITECTURE.md)
- [`GEM_COMMAND_CENTER.md`](GEM_COMMAND_CENTER.md)
- [`WORKSTREAM_SEQUENCE.md`](WORKSTREAM_SEQUENCE.md)
- [`NEXT_WORKSTREAM_PLAN.md`](NEXT_WORKSTREAM_PLAN.md)

## Capital Readiness & Transaction Command Center

- [`CAPITAL_READINESS_COMMAND_CENTER.md`](CAPITAL_READINESS_COMMAND_CENTER.md) — complete operator handbook, roles, controls, workflows, APIs, readiness, partner routing, closing, post-close services, and AI governance.
- [`openapi/capital-readiness.openapi.yaml`](openapi/capital-readiness.openapi.yaml) — machine-readable API contract.
- [`CAPITAL_READINESS_PRODUCTION_ACTIVATION.md`](CAPITAL_READINESS_PRODUCTION_ACTIVATION.md) — disposable-database validation, migration, recovery, preview, production, legal, partner, credential, and monitoring gates.

Implementation assets:

```text
prisma/proposals/CAPITAL_READINESS_MODELS.prisma
scripts/apply-capital-readiness-prisma-models.mjs
scripts/generate-capital-readiness-review-migration.mjs
scripts/verify-capital-readiness-contract.mjs
src/lib/capital-readiness/
src/app/api/capital-readiness/
src/app/app/command-center/capital-readiness/
src/components/command-center/CapitalReadinessCommandCenter.tsx
```

Review migration generation:

```bash
node scripts/generate-capital-readiness-review-migration.mjs
```

The generated SQL is review material only. It is not production authorization. Follow the production activation runbook before any database execution.

## TokMetric

- [`tokmetric/master-implementation-plan.md`](tokmetric/master-implementation-plan.md)

## Safety rule

Documentation may describe a designed capability without proving that its provider, database table, credential, licensed partner, staffing, approval, or production deployment is active. Runtime and public claims must remain truthful and fail closed.
