# Release 2 — Separated Intake Verification

## Scope

This record covers PR #189 and the separated enterprise, Community, and product-request intake domain.

## Free validation path

- Validation target: existing empty Supabase project `supabase-cerulean-jacket` (`njjdxatbxwojupwgkiai`)
- Method: transaction-scoped PostgreSQL execution followed by `ROLLBACK`
- Paid Supabase development branch: **not created**
- Production data copied to validation: **none**

The rollback-only validation confirmed the enums, durable tables, status history, unique public references, foreign keys, cascade behavior, fail-closed RLS, and absence of public policies. The validation project remained empty afterward.

## Application verification

Canonical Vercel preview for commit `7eb140a7b1e09bc45e0abd25a426f772e9ded957` reached `READY` as deployment `dpl_JLMuSxAqdv9cXN4DxsRQ7HQuz4vk`.

The build completed:

- intake Prisma model promotion;
- Prisma schema validation;
- Prisma Client generation;
- promotion idempotency and structural checks;
- claims-report consistency;
- ESLint with zero warnings;
- TypeScript;
- 43 test files;
- 324 tests, including 11 separated-intake governance tests;
- optimized Next.js production build and deployment packaging.

## Production database migration

The additive intake schema was applied through Supabase's canonical migration ledger as:

- Version: `20260713203940`
- Name: `add_separated_intake_funnels`

Post-migration checks confirmed:

- `intake_submissions` and `intake_status_events` exist;
- both tables have row-level security enabled;
- zero public RLS policies exist, producing fail-closed PostgREST access;
- the declared intake indexes exist;
- both tables contained zero rows immediately after migration;
- the migration is recorded in `supabase_migrations.schema_migrations`;
- no Prisma migration ledger is used by the canonical database.

The performance advisor subsequently identified the optional applicant `user_id` foreign key as lacking a covering index. The repository migration and Prisma source now include `intake_submissions_user_id_idx`; production receives this as a separate recorded additive index migration.

## Security boundary

- No payment activation
- No KYC upload activation
- No provider write activation
- No automatic application decisioning
- No public database policies
- No secrets committed or changed
- No paid validation resource

The production migration does not itself expose the public forms. Application activation occurs only after PR #189 is merged and the exact main deployment reaches `READY`.