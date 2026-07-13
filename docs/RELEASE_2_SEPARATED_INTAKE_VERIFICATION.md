# Release 2 — Separated Intake Verification

## Scope

This record covers PR #189 and the separated enterprise, Community, and product-request intake domain.

## Exact migration under test

- File: `prisma/migrations/20260713174500_separated_intake_funnels/migration.sql`
- Migration commit lineage: PR #189
- Validation method: transaction-scoped PostgreSQL execution followed by `ROLLBACK`
- Validation target: existing empty Supabase project `supabase-cerulean-jacket` (`njjdxatbxwojupwgkiai`)
- Canonical GEM production database: **not modified**
- Paid Supabase branch: **not created**

## Preconditions confirmed

Before validation, the target project had:

- zero public tables;
- zero recorded migrations;
- no copied production data.

## Checks completed

The exact migration DDL was executed inside one transaction with a minimal test-only `users` table required by the two foreign keys.

The validation confirmed:

1. `IntakeKind` was created with enterprise, Community, and product-request values.
2. `IntakeSubmissionStatus` was created with the full controlled status lifecycle.
3. `intake_submissions` was created successfully.
4. `intake_status_events` was created successfully.
5. All seven declared intake indexes were present.
6. The default submission status was `RECEIVED`.
7. A durable initial status event could be inserted.
8. Duplicate `public_id` values were rejected.
9. Assignment to a missing reviewer was rejected by the foreign key.
10. Deleting a submission cascaded to its status events.

The transaction completed its assertions and executed `ROLLBACK`.

## Postcondition confirmed

After rollback, the validation project again had zero public tables. No persistent schema or test data remained.

## Application verification state

The first canonical preview build reached the repository verification gate and found one React Hook dependency warning in `/app/admin/intake`. That warning was corrected. A generic validation narrowing improvement was also added before the final preview retry.

The PR must remain draft until the corrected exact head completes:

- claims report consistency;
- ESLint with zero warnings;
- TypeScript;
- Vitest including separated-intake tests;
- Next.js production build;
- public-route smoke checks;
- administrator authorization smoke checks.

## Production boundary

This validation does not authorize a production migration. Production schema application remains a separate controlled step after the exact-head application build is green and the Prisma source schema is reconciled.