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

This clean project is the intended target for applying the repository's Prisma schema. It must be connected to the Vercel project `support371-gem-enterprise` for the Production environment.

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

## Controlled first-time bootstrap

When the clean Supabase project is connected to Vercel Production, the bootstrap-aware build supports:

- `AUTO_DB_PUSH=true` to apply the Prisma schema
- `AUTO_DB_SEED=true` to create explicitly configured bootstrap records

Secure seed credentials must be supplied through Vercel environment variables and must never be committed.

After a successful first bootstrap, set both bootstrap flags to `false` and redeploy.
