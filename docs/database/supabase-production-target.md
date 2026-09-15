# GEM Enterprise Supabase Production Target

Verified on 2026-07-06.

## Intended production database

- Supabase project: `supabase-charcoal-lens`
- Project reference: `slzdjoqpzbkwzuaexlkj`
- Region: `us-east-1`
- Status at verification: `ACTIVE_HEALTHY`
- Public schema state at verification: empty
- Migration history at verification: empty
- Security advisor findings at verification: none
- Performance advisor findings at verification: none

This clean project is the intended target for applying the repository's reviewed database migrations. It must be connected to the Vercel project `support371-gem-enterprise` for the Production environment. Do not substitute another Supabase project.

## Legacy project retained without destructive changes

- Supabase project: `supabase-byzantium-lever`
- Project reference: `kcurngdalxcjcqucylyy`

The legacy project contains the existing tables `threads`, `thread_users`, `messages`, `profiles`, `contact_messages`, and `admin_users`. It does not match the current GEM Enterprise Prisma schema and must not be overwritten or treated as the production schema without a separate migration plan.

## Expected Vercel variables

The application accepts one pooled runtime URL from:

- `POSTGRES_PRISMA_URL`
- `DATABASE_URL`
- `POSTGRES_URL`
- `NEON_DATABASE_URL`

It accepts one direct/unpooled URL from:

- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL_NO_SSL`

No secret values belong in this repository.

## Controlled production bootstrap

`AUTO_DB_PUSH` and `AUTO_DB_SEED` must remain `false` in Vercel. The Vercel build intentionally fails closed if either is enabled.

Do **not** use `prisma db push` as a first-time production bootstrap. Schema push can create Prisma tables and columns, but it does not apply SQL-only security invariants carried by reviewed migrations, including CHECK constraints, row-level security, append-only triggers, and grants/revokes.

For a new or empty intended production project:

1. authorize the exact Supabase project `slzdjoqpzbkwzuaexlkj`;
2. configure pooled and direct server database URLs in Vercel without exposing their values;
3. apply the repository's reviewed migrations through the controlled production migration path;
4. verify constraints, foreign keys, indexes, row-level security, triggers, and grants/revokes;
5. run the controlled bootstrap/seed procedure only after the schema and security invariants are proven;
6. keep automatic database push and seed disabled for normal deploys.

The customer-success and communication-governance migrations are specifically release-gated because their SQL security controls are not represented by `prisma db push` alone.
