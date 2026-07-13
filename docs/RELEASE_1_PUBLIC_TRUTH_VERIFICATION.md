# Release 1 Public Truth Verification

Issue: #181

Pull request: #182

Branch: `fix/public-truth-routing-and-documentation`

Base commit: `ba566d2ca5079472059307d201660b805bf0704f`

Verified pull-request head: `324a3cfb3eaf72c8c72eb35be407776464d89e0d`

Canonical preview deployment: `dpl_GrnjVcmuZuVe198WqRF68Rk4dK14`

Preview hostname: `support371-gem-enterprise-li7irl9om-admin-25521151s-projects.vercel.app`

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

The exact pull-request head reached `READY` in the canonical Vercel project.

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

Build completed with deployment output generation and cache upload succeeding. No build error was recorded for the exact head.

## Preview smoke evidence

### `/community`

The temporary redirect is implemented in the committed Next.js redirect configuration and is covered by the passing `public-truth-routing` test.

### `/community-hub`

The committed preview page includes:

- Title: `GEM Community Preview`
- Visible badge: `Fictional interface preview`
- A controlled-preview notice stating records are fictional sample data
- A statement that the page does not represent a live client network, marketplace, verified membership directory, production messaging system, or current event program
- `robots` metadata with `index: false` and `follow: false`

### `/register`

The permanent redirect is verified by the committed Next.js redirect configuration and the passing `public-truth-routing` test.

### Preview access limitation

The Vercel preview is protected by Vercel Authentication. External unauthenticated HTTP inspection is intercepted by the Vercel SSO boundary before application-level redirects can be observed. This does not invalidate the successful exact-head build, unit tests, or committed redirect configuration. Production-domain smoke testing remains required after an approved merge.

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

## Review and merge gates

The pull request is eligible for human review because its exact head reached `READY` and the canonical preview verification passed.

Merging into `main` remains an owner approval gate. After an approved merge:

1. Confirm the `main` deployment reaches `READY`.
2. Test `/community` on the canonical production domain.
3. Test `/register` on the canonical production domain.
4. Confirm `/community-hub` remains visibly disclosed and non-indexed.
5. Verify login and protected routes remain unaffected.
6. Check production runtime errors.
7. Close issue #181 only after production evidence is recorded.

## Rollback

Revert the pull-request merge through a focused reviewed pull request or use Vercel's code-deployment rollback while preparing the revert. No data migration or provider activation is included, so rollback is code-only.
