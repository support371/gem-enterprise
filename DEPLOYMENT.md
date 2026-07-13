# GEM Enterprise Deployment Guide

This document defines the canonical deployment process for the existing GEM Enterprise application.

## Canonical production configuration

| Item | Value |
|---|---|
| Public domain | `https://www.gemcybersecurityassist.com` |
| Repository | `support371/gem-enterprise` |
| Production branch | `main` |
| Vercel project | `support371-gem-enterprise` |
| Runtime | Node.js 24.x |
| Package manager | pnpm 10.28.0 |
| Database | PostgreSQL through Prisma 5 |

Vercel Git integration is the only canonical production deployment path. Do not create a second production project, run a parallel `vercel --prod` workflow from CI, or attach the production domain to another project without an approved migration plan.

## Deployment boundaries

A code deployment does not authorize:

- Production database migrations
- KYC document-upload activation
- Payment or subscription activation
- Provider purchases or billing commitments
- TikTok, advertising, or seller-account writes
- Public operational claims
- Production secret changes

Those are separate controlled actions and require explicit owner approval.

## Environment variables

`.env.example` is the canonical inventory. Add real values only through Vercel Project Settings or another approved server-side secret store.

Required groups include:

### Database

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Authentication and recovery

- `JWT_SECRET`
- `PASSWORD_RESET_SECRET`

### Application

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_AI_DISCLOSURE_TEXT`

### Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `REPLY_TO_EMAIL`

### Platform operations and evidence governance

- `GEM_AGENT_API_KEY`
- `GEM_PUBLIC_APP_URL`
- `GEM_AGENT_API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Evidence scanner and feature-gate variables documented in `.env.example`

### Optional integrations

TokMetric, TikTok, seller, merchant, AI, and webhook variables are optional and must remain disabled until their corresponding provider, approval, and security requirements pass.

Never place real values in `vercel.json`, source files, pull requests, issues, prompts, screenshots, logs, or client-side environment variables.

## Safety defaults

The following production flags must remain false unless the owner approves activation after the documented gates pass:

- Database auto-push, auto-seed, and automatic migration flags
- Demo-data seeding
- KYC document upload
- Evidence-vault activation
- TokMetric live publishing
- TokMetric sandbox publishing when not explicitly approved
- External seller and merchant connections

## Pull-request preview process

1. Create or reference a GitHub issue.
2. Create a focused branch from current `main`.
3. Implement and test the smallest complete vertical slice.
4. Run the local verification gate:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

5. Open a pull request against `main`.
6. Inspect the canonical Vercel preview build and affected routes.
7. Record security, privacy, claims, billing, and provider impacts.
8. Record any unavailable check as **blocked** or **not run**.
9. Merge only after required checks and human approvals pass.

The Vercel preview independently runs the repository's preview verification before the Next.js production build.

## Production deployment process

1. Confirm the pull request is approved and the available required gates pass.
2. Confirm no unresolved production-secret, provider, migration, or legal dependency is being represented as complete.
3. Merge the approved pull request into `main`.
4. Vercel Git integration deploys `main` to the canonical project.
5. Inspect deployment logs.
6. Run production smoke checks.
7. Monitor errors and regressions.
8. Roll back through Vercel or revert the merge if required.

Do not trigger a second independent production deployment after the Git integration deployment.

## Database migrations

Production database changes are not implied by a code merge.

Every migration requires:

- A committed Prisma migration
- Compatibility assessment
- Data-backfill plan when applicable
- Index and lock-impact review
- Disposable PostgreSQL application test
- Recovery or rollback procedure
- Test evidence
- Owner-approved production execution

A controlled migration command is:

```bash
pnpm exec prisma migrate deploy
```

Run it only from an approved environment using the intended production connection variables. Do not run `prisma db push` against production.

Do not seed production automatically. Initial administrator provisioning and any reference-data seeding must be separately reviewed, executed once where needed, and documented.

## Production smoke checks

Use no sensitive personal, financial, identity, or client data.

### Public routes

| Check | Expected |
|---|---|
| `GET /` | `200` |
| `GET /services` | `200` |
| `GET /store` | `200` |
| `GET /community` | Temporary redirect to `/community-hub` |
| `GET /community-hub` | `200`, fictional-preview disclosure visible, non-indexed metadata |
| `GET /register` | Permanent redirect to `/get-started` |
| `GET /get-started` | `200` |
| `GET /contact` | `200` |
| `GET /privacy` | `200` |
| `GET /terms` | `200` |
| `GET /api/health` | Healthy response |

### Authentication and authorization

| Check | Expected |
|---|---|
| `GET /client-login` | Login form renders |
| Invalid login | Generic `401` response |
| Protected client route without session | Redirect to `/client-login` |
| Admin route with client role | Access denied or safe redirect |
| Admin route with approved admin role | Authorized response |
| Forgot-password request | Non-enumerating response |
| Recovery when SMTP is not configured | Explicit fail-closed service state |

### Safety gates

Verify:

- KYC document upload remains unavailable unless its full production pipeline is approved.
- Store pages remain request-only.
- Community Hub remains clearly fictional and non-indexed.
- Provider-dependent services report accurate disabled or pending states.
- Production social publishing and advertising remain blocked unless separately approved.
- Public claims do not imply activation from deployment alone.

### Security headers

Confirm production responses include the configured controls, including:

- HSTS
- `X-Frame-Options`
- `X-Content-Type-Options`
- Referrer Policy
- Permissions Policy
- Content Security Policy
- COOP and CORP where configured

## Email verification

When SMTP is configured, verify:

- Sender domain authorization
- SPF
- DKIM
- DMARC
- Password-recovery delivery
- Reply-to behavior
- Failure logging without sensitive content

Do not claim password recovery is operational solely because the route exists. Verify actual message delivery and reset completion.

## Rollback

### Code-only release

- Use the Vercel deployment rollback capability, or
- Revert the merge commit through a reviewed pull request.

### Release with migration

Follow the migration-specific recovery plan. Do not automatically reverse a migration that may have accepted production data. Prefer a reviewed forward fix when destructive reversal is unsafe.

### Feature or provider activation

Disable the relevant server-side feature gate or connector through the approved operations process. Do not expose secret values while troubleshooting.

## Evidence required for release records

Record:

- Issue and pull-request references
- Commit SHA
- Verification output
- Vercel preview and production deployment references
- Migration evidence when applicable
- Smoke-test results
- Manual dependencies
- Security and privacy impact
- Rollback method
- Owner approval for high-impact actions

## Related documents

- `README.md`
- `DEVELOPER_ONBOARDING.md`
- `AGENTS.md`
- `.env.example`
- `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md`
- `docs/deployment-checklist.md`
