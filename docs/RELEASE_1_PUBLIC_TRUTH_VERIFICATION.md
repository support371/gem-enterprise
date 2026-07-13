# Release 1 Public Truth Verification

Issue: #181

Branch: `fix/public-truth-routing-and-documentation`

## Scope

This release slice changes public routing and documentation only. It does not change the Prisma schema, run a database migration, alter secrets, activate providers, enable document uploads, collect payments, or enable external publishing.

## Changes

- `/community` temporarily redirects to `/community-hub`.
- `/register` permanently redirects to `/get-started`.
- The Community Hub root includes non-indexing metadata and retains explicit fictional-preview disclosures.
- `README.md`, `DEVELOPER_ONBOARDING.md`, and `DEPLOYMENT.md` now describe the current Node 24, pnpm 10.28, Next.js 16, Prisma/PostgreSQL, JWT/session, and Vercel Git architecture.
- `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md` records system-of-record and platform boundaries.
- `src/__tests__/public-truth-routing.test.ts` verifies routing and disclosure requirements.

## Verification state

The branch was created from main commit `ba566d2ca5079472059307d201660b805bf0704f`.

At the time this record was created:

- Prisma generation: **not run in the connector environment**
- ESLint: **not run in the connector environment**
- TypeScript check: **not run in the connector environment**
- Vitest: **not run in the connector environment**
- Next.js production build: **not run in the connector environment**
- Canonical Vercel preview: **pending pull-request creation**
- Production smoke test: **not applicable before merge**

No unrun check is represented as passing.

## Required gate

Run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

Then inspect the canonical Vercel preview before marking the pull request ready.

## Risk

The temporary `/community` redirect removes the current public community/leadership page from direct presentation while its identity, credential, staffing, affiliation, and operating claims are reviewed. The destination is explicitly disclosed as fictional preview content.

## Rollback

Revert the pull-request merge or use Vercel's code-deployment rollback. No data migration or provider activation is included.
