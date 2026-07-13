# Release 1 Public Truth Verification

Issue: #181

Pull request: #182

Branch: `fix/public-truth-routing-and-documentation`

Base commit: `ba566d2ca5079472059307d201660b805bf0704f`

Code-bearing verification commit: `324a3cfb3eaf72c8c72eb35be407776464d89e0d`

## Scope

This release slice changes public routing and documentation only. It does not change the Prisma schema, run a database migration, alter secrets, activate providers, enable document uploads, collect payments, or enable external publishing.

## Changes

- `/community` temporarily redirects to `/community-hub`.
- `/register` permanently redirects to `/get-started`.
- The Community Hub root includes non-indexing metadata and retains explicit fictional-preview disclosures.
- `README.md`, `DEVELOPER_ONBOARDING.md`, and `DEPLOYMENT.md` now describe the current Node 24, pnpm 10.28, Next.js 16, Prisma/PostgreSQL, JWT/session, and Vercel Git architecture.
- `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md` records system-of-record and platform boundaries.
- `src/__tests__/public-truth-routing.test.ts` verifies routing and disclosure requirements.

## Exact-head verification

The code-bearing commit reached `READY` in the canonical Vercel project. Subsequent commits in this branch only update this verification record and must also reach `READY` before the pull request is marked ready for review.

Vercel build evidence:

- `pnpm install --frozen-lockfile`: **passed**
- Prisma Client generation: **passed**
- ESLint with zero warnings: **passed**
- TypeScript check: **passed**
- Vitest: **passed**
- Test files: **41 passed**
- Tests: **305 passed**
- `src/__tests__/public-truth-routing.test.ts`: **3 passed**
- Next.js optimized production compilation: **passed**
- Deployment packaging and output upload: **passed**
- Canonical preview state: **READY**

The final pull-request head and its corresponding Vercel deployment are recorded in the pull-request verification section so that this file does not create a self-referential commit-hash cycle.

## Preview smoke evidence

### `/community`

The preview request resolved to the Community Hub presentation. The response exposed `x-matched-path: /community-hub`, confirming the temporary route destination in the deployed preview.

### `/community-hub`

The deployed preview returned the expected content and controls:

- Title: `GEM Community Preview`
- Visible badge: `Fictional interface preview`
- Visible controlled-preview notice stating records are fictional sample data
- Statement that the page does not represent a live client network, marketplace, verified membership directory, production messaging system, or current event program
- `meta name="robots" content="noindex, nofollow, nocache"`
- `x-robots-tag: noindex`

### `/register`

The permanent redirect is verified by the committed Next.js redirect configuration and the passing `public-truth-routing` test. Direct response inspection on the protected preview URL was intercepted by Vercel preview authentication before the application redirect could be observed externally; this limitation does not affect the application-level test result.

### Authentication regression coverage

The preview verification suite passed the existing authentication, password-recovery, session-authority, middleware-routing, admin-access, KYC, support, and protected-route tests. No authentication provider or session implementation changed in this slice.

## Security and operational impact

- No Prisma schema change
- No database migration
- No production secret change
- No authentication-provider migration
- No payment or billing activation
- No KYC document-upload activation
- No external publishing activation
- No production data mutation

The change reduces public exposure of unverified identity, staffing, affiliation, and operating claims while preserving a clearly disclosed fictional preview.

## Remaining gate

The pull request may be marked ready for human review after the final branch-head deployment reaches `READY`.

Merging into `main` remains an owner approval gate. After an approved merge, verify the canonical production deployment and production-domain redirects before closing issue #181.

## Rollback

Revert the pull-request merge through a focused reviewed pull request or use Vercel's code-deployment rollback while preparing the revert. No data migration or provider activation is included, so rollback is code-only.
