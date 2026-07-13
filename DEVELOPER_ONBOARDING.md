# GEM Enterprise Developer Onboarding

This guide describes the current development workflow for the canonical GEM Enterprise application.

## Canonical project

| Item | Value |
|---|---|
| Repository | `support371/gem-enterprise` |
| Default branch | `main` |
| Production domain | `https://www.gemcybersecurityassist.com` |
| Canonical Vercel project | `support371-gem-enterprise` |
| Runtime | Node.js 24.x |
| Package manager | pnpm 10.28.0 |

Read `AGENTS.md` and `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md` before changing authentication, database models, access controls, integrations, claims, KYC, payments, or deployment behavior.

## 1. Local setup

```bash
corepack enable
git clone https://github.com/support371/gem-enterprise.git
cd gem-enterprise
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm run db:generate
pnpm run dev
```

Use a disposable local or development PostgreSQL database. Never connect local development or automated tests to production.

## 2. Required local tools

- Node.js 24.x
- Corepack
- pnpm 10.28.0
- PostgreSQL 15 or later
- Git
- Access to the appropriate GitHub repository and Vercel preview logs

## 3. Application structure

```text
src/
├── app/                  Pages, layouts, and API route handlers
│   ├── app/              Protected client and admin application
│   ├── api/              Server-side endpoints
│   ├── community-hub/    Fictional preview interfaces
│   ├── kyc/              Controlled onboarding and review
│   ├── store/            Request-only catalogues
│   └── tokmetric/        Governed content-operation foundation
├── components/           Shared UI and domain components
├── lib/                  Auth, database, mail, audit, adapters
└── __tests__/            Vitest test suite
prisma/
├── schema.prisma         PostgreSQL schema source of truth
├── migrations/           Version-controlled migrations
└── seed.ts               Controlled seed data
scripts/                  Verification and operational scripts
docs/                     Architecture and operations documentation
```

Do not assume a route is production-ready because a page or Prisma model exists. Check its feature gate, provider state, test coverage, and public wording.

## 4. Authentication and authorization

The platform uses the existing JWT/session implementation.

- Session cookie: `gem_session`
- Core auth logic: `src/lib/auth.ts`
- Login API: `src/app/api/auth/login/route.ts`
- Route protection: `src/proxy.ts`
- Database access: `src/lib/db.ts`
- Audit helper: `src/lib/audit.ts`

Rules:

1. Do not replace authentication with Base44, ChatGPT, or another provider without an approved migration plan.
2. Do not trust client-supplied roles or `x-user-*` headers.
3. Sensitive APIs must validate the signed session and the requested resource scope.
4. Keep credential, recovery, identity, and administrative responses `no-store`.
5. Emit audit events for sensitive state changes.

## 5. Database workflow

```bash
# Generate Prisma client
pnpm run db:generate

# Create a development migration
pnpm run db:migrate -- --name describe-the-change

# Open Prisma Studio against a controlled development database
pnpm run db:studio
```

Do not use `prisma db push` against production.

Every production schema change requires:

- A committed Prisma migration
- Compatibility and data-backfill assessment
- Disposable PostgreSQL validation
- Rollback or forward-recovery plan
- Tests
- Approved production execution

## 6. Feature safety rules

Keep these disabled or request-only until their complete activation requirements pass:

- Identity and financial document upload
- Biometrics and liveness checks
- Automatic KYC/KYB approval
- Payments and subscriptions
- Marketplace transactions
- Production social publishing and advertising
- Live threat-intelligence assertions
- Guaranteed response times
- Public claims without approved evidence

Never make a static or sample interface appear live. The Community Hub currently represents fictional preview data and must remain clearly disclosed.

## 7. Branch and issue workflow

1. Create or reference one GitHub issue.
2. Branch from current `main`.
3. Use a focused branch name:
   - `feat/...`
   - `fix/...`
   - `security/...`
   - `test/...`
   - `docs/...`
   - `chore/...`
4. Inspect relevant pages, APIs, Prisma models, configuration, tests, and recent pull requests.
5. Write the smallest complete vertical slice.
6. Add tests.
7. Run the verification gate.
8. Open a pull request.
9. Review the canonical Vercel preview.
10. Merge only after the required checks and human approvals pass.

Do not commit directly to `main`.

## 8. Verification commands

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

Individual checks:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

`pnpm run verify` must complete before the pull request is represented as ready. When a check cannot run, record the exact blocker and mark it **blocked** or **not run**.

## 9. Testing expectations

For sensitive or state-changing APIs, test as applicable:

- Success
- Invalid input
- Missing authentication
- Wrong role
- Wrong organization or resource owner
- Rate limiting
- Provider failure
- Database failure
- Feature-disabled behavior
- Audit behavior
- `Cache-Control: no-store`

Use Playwright for complete user journeys such as login, recovery, onboarding, client workspace access, admin review, and tenant-isolation checks.

## 10. Pull-request contents

Every pull request should include:

- Objective and linked issue
- Current and intended behavior
- User-visible and architectural changes
- Files and data models affected
- Security, privacy, billing, and claims impact
- Tests and verification performed
- Manual actions still required
- Preview deployment evidence
- Rollback method

A workflow that did not start is not passing.

## 11. Deployment ownership

Vercel Git integration owns production deployment.

- Pull requests create previews.
- Approved changes merge to `main`.
- Vercel deploys `main`.
- Do not add a duplicate `vercel --prod` CI workflow.
- Do not attach the production domain to another project without an approved migration plan.
- Database migrations and provider activations are separate controlled operations.

See `DEPLOYMENT.md` for deployment and smoke-test requirements.

## 12. Secrets and sensitive data

Never place secrets, customer records, raw identity documents, reset tokens, OAuth tokens, API keys, SMTP credentials, or service-role keys in:

- Source files
- Prompts
- Commits
- Pull requests
- Issues
- Screenshots
- Logs
- Client-side environment variables

Use environment-variable names and approved secret managers only.

## 13. First-day checklist

- Read `AGENTS.md`.
- Read `README.md`.
- Read `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md`.
- Install with the frozen pnpm lockfile.
- Generate Prisma client.
- Run the test suite.
- Confirm the development database is non-production.
- Review active feature gates in `.env.example`.
- Review open pull requests that affect your area.
- Create an issue and focused branch before editing.
