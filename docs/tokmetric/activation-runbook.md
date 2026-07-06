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

Both URLs must belong to the same Supabase project. Never commit either value to GitHub or documentation.

## Controlled first-time schema bootstrap

For a new or empty Supabase database only, temporarily configure:

```text
AUTO_DB_PUSH=true
AUTO_DB_SEED=true
ADMIN_EMAIL=<authorized admin email>
ADMIN_INITIAL_PASSWORD=<strong private password>
SEED_DEMO_DATA=false
```

The Vercel build script will generate Prisma, synchronize the schema, create the secure admin record, seed the initial products, and build Next.js. After a successful bootstrap, immediately change:

```text
AUTO_DB_PUSH=false
AUTO_DB_SEED=false
```

Then redeploy once more. Existing production databases must be backed up before schema synchronization.

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
