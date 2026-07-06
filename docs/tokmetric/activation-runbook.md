# TokMetric production activation runbook

## Deployment target

- Repository: `support371/gem-enterprise`
- Branch: `main`
- Verified domain: `https://www.gemcybersecurityassist.com`
- Publishing route: `/tokmetric/publishing`
- Health route: `/api/health`

## Required database variables

Configure both variables in Vercel for Production, Preview, and Development as appropriate:

```text
POSTGRES_PRISMA_URL=<pooled PostgreSQL connection string>
POSTGRES_URL_NON_POOLING=<direct PostgreSQL connection string>
```

The pooled URL is used by serverless runtime requests. The direct URL is used by Prisma migration and direct database workflows. Both must point to the same production database and must use TLS where required by the provider.

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
