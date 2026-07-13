# Separated Intake Funnels — Release 2

Issue: #185

Branch: `feat/separated-intake-funnels`

## Objective

Create three distinct public qualification paths backed by one durable, auditable intake domain:

- `/enterprise/apply`
- `/community/apply`
- `/store/products/[slug]/request`

The implementation must not activate payments, collect identity documents, make automatic acceptance decisions, create contractual commitments, or promise fixed response times.

## Architecture

### Public workflows

Each path has its own validation schema and API endpoint:

| Workflow | Public route | API route | Queue |
|---|---|---|---|
| Enterprise | `/enterprise/apply` | `/api/intake/enterprise` | `intake:enterprise` |
| Community | `/community/apply` | `/api/intake/community` | `intake:community` |
| Product | `/store/products/[slug]/request` | `/api/intake/product` | `intake:product` |

### Durable records

The migration creates:

- `intake_submissions`: one durable record for authenticated or anonymous applicants;
- `intake_status_events`: immutable status history with actor, reason, metadata, and time.

Product slug, name, category, and optional SKU are preserved on product requests. Contact and workflow data are stored in typed columns; type-specific answers are stored in JSON payload. IP and user-agent signals are stored only as keyed hashes when `INTAKE_HASH_SECRET` is configured.

### Human decisions

Public submissions always begin at `RECEIVED`. The application does not automatically approve, reject, price, activate, or create an account. Administrators use `/app/admin/intake` and the canonical admin gate. Valid transitions are controlled in `src/lib/intake/workflow.ts`; every update requires a reason and creates an immutable status event plus an audit log.

## Privacy and safety controls

- Separate consent and privacy-version receipts.
- Public forms reject common categories of highly sensitive data.
- No file upload field.
- Honeypot and minimum-completion-time checks.
- Per-IP rate limits by funnel.
- No raw IP or user-agent storage in the new intake tables.
- No fixed decision or response-time promise.
- No account, membership, entitlement, contract, price, SLA, or service activation on submission.

## Database gate

Migration:

`prisma/migrations/20260713174500_separated_intake_funnels/migration.sql`

Do **not** run this migration against production until all of the following are complete:

1. Create a disposable PostgreSQL database with the current production schema.
2. Apply all existing migrations.
3. Apply the separated-intake migration.
4. Verify both tables, enums, foreign keys, indexes, defaults, and delete behavior.
5. Create one record in each funnel and verify its initial status event.
6. Exercise every allowed status transition and verify invalid transitions are rejected by the application.
7. Roll back the disposable database from snapshot or drop it; this migration has no production rollback execution path until approved.
8. Run Prisma generation, claims check, lint, TypeScript, unit tests, and production build.
9. Obtain a canonical Vercel preview in `READY` state.
10. Obtain explicit production migration approval.

Until the migration exists in the target environment, public APIs fail closed with HTTP 503 and code `INTAKE_STORAGE_NOT_READY`; they do not fall back to audit-only persistence.

## Prisma source-of-truth promotion

The intended Prisma models are documented in:

`prisma/proposals/SEPARATED_INTAKE_MODELS.prisma`

The production `prisma/schema.prisma` must be updated in a focused follow-up before this domain is considered permanently reconciled with Prisma. The proposal records the exact enum, model, relation, field, index, and table mappings required. Do not merge competing intake models from PR #173 or other branches without a line-by-line conflict review.

## Environment

Optional privacy hashing:

```text
INTAKE_HASH_SECRET=<high-entropy environment secret>
```

When the secret is absent, the intake record stores `NULL` for IP and user-agent hashes rather than storing raw network identifiers.

## Rollback

Before production activation, rollback is branch-only: close the pull request or revert the branch changes.

After an approved production migration, rollback must preserve submitted records. Prefer a forward fix or disable the public routes while retaining the tables. Do not drop intake tables containing production submissions without approved retention, export, and deletion procedures.
