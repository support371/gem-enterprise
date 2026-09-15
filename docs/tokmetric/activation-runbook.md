# TokMetric production activation runbook

## Deployment target

- Repository: `support371/gem-enterprise`
- Branch: `main`
- Verified domain: `https://www.gemcybersecurityassist.com`
- Publishing route: `/tokmetric/publishing`
- Health route: `/api/health`

## Canonical database provider

GEM Enterprise uses **Supabase PostgreSQL**. Do not create or migrate to another database provider during recovery unless a separate migration is explicitly approved.

The current Next.js/Prisma application accepts the canonical Prisma names and the standard names commonly injected by Vercel integrations:

```text
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
DATABASE_URL
DATABASE_URL_UNPOOLED
POSTGRES_URL
NEON_DATABASE_URL
```

For Supabase, configure the pooled transaction connection for serverless runtime traffic and the direct/session connection for schema administration:

```text
POSTGRES_PRISMA_URL=<Supabase pooled PostgreSQL URL>
POSTGRES_URL_NON_POOLING=<Supabase direct or session PostgreSQL URL>
```

Both URLs must belong to the same approved Supabase project. Never commit either value to GitHub or documentation.

## Controlled production schema activation

Automatic Vercel database bootstrap is disabled. Keep:

```text
AUTO_DB_PUSH=false
AUTO_DB_SEED=false
```

Do not use `prisma db push` to initialize production. GEM migrations include SQL-only CHECK constraints, row-level security, append-only triggers, and grants/revokes that schema push does not apply.

For a new or empty approved Supabase database:

1. authorize the exact production project;
2. configure the pooled and direct database URLs privately in Vercel;
3. apply the repository's reviewed migrations through the controlled production migration path;
4. verify SQL security invariants before application traffic is enabled;
5. create explicitly approved bootstrap records only after migration verification;
6. keep automatic push/seed flags disabled on subsequent deployments.

## TikTok sandbox variables

```text
TIKTOK_ENVIRONMENT=sandbox
TOKMETRIC_TIKTOK_OAUTH_ENABLED=true
TOKMETRIC_SANDBOX_PUBLISHING_ENABLED=true
TOKMETRIC_LIVE_PUBLISHING_ENABLED=false
TIKTOK_CLIENT_KEY=<sandbox client key>
TIKTOK_CLIENT_SECRET=<sandbox client secret>
TIKTOK_REDIRECT_URI=https://gemcybersecurityassist.com/api/tokmetric/oauth/callback
TOKMETRIC_TOKEN_ENCRYPTION_KEY=<secure production-grade key>
```

For `PULL_FROM_URL`, add only domains already verified in TikTok Developer Portal:

```text
TOKMETRIC_VERIFIED_MEDIA_HOSTS=gemcybersecurityassist.com,www.gemcybersecurityassist.com
```

## Post-deployment checks

1. `GET /api/health` returns HTTP 200 with `status: ok` and `services.database: ok`.
2. Deployment metadata identifies branch `main` and the current merge commit or a later commit.
3. `/tokmetric/publishing` renders the operational publishing interface.
4. The review workspace has `publishingDisabled=false` and no global emergency lock.
5. The Content Posting connector is connected with `user.info.basic` and `video.publish`.
6. The selected content has an approved current version and matching approval hash.
7. Sandbox privacy remains `SELF_ONLY` and the authorized TikTok test account is private.
8. Record the real end-to-end review video using `docs/tokmetric/tiktok-app-review-submission.md`.

## Production release gate

Do not set `TOKMETRIC_LIVE_PUBLISHING_ENABLED=true` until TikTok approves the Direct Post product and production scopes. Sandbox and production activation flags are bound to their matching TikTok environments and fail closed when mismatched.
