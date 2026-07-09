# GEM Enterprise — Agent Instructions

## Project Overview

GEM Enterprise is a controlled-access platform for cybersecurity, compliance, financial-security coordination, product and service enquiries, and property-risk support.

- **Production domain:** `https://www.gemcybersecurityassist.com`
- **Repository:** `support371/gem-enterprise`
- **Default branch:** `main`
- **Canonical host:** Vercel project `support371-gem-enterprise`
- **Deployment method:** Vercel Git integration deploys `main`; agents must not run a second `vercel --prod` deployment from CI.
- **Current operating mode:** controlled production launch. Sensitive or provider-dependent features fail closed until verified.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **Database:** PostgreSQL through Prisma 5
- **Authentication:** existing JWT/session implementation using `jose` and `bcryptjs`
- **Session:** HTTP-only cookie named `gem_session`
- **UI:** Tailwind CSS and existing shared components
- **Email:** Nodemailer SMTP when production credentials are configured
- **Commerce:** request-only catalogue until payments, fulfilment, refunds, taxes, licensing, and inventory are verified
- **Testing:** Vitest; Playwright is available for end-to-end tests
- **Package manager:** pnpm 10.28.0 only

## Non-Negotiable Safety and Trust Rules

1. **Fail closed.** Do not enable KYC uploads, biometrics, automatic approvals, automatic payments, live intelligence, or marketplace transactions without the complete supporting infrastructure and explicit owner approval.
2. **No false operational claims.** Do not describe static, sample, mock, planned, or manually reviewed data as live, continuous, verified, encrypted, certified, guaranteed, monitored, or available 24/7.
3. **No secrets in code, prompts, commits, logs, issues, screenshots, or pull requests.** Use environment-variable names and secret managers only.
4. **No paid service activation.** An agent may build an adapter or sandbox integration, but may not accept pricing, enable billing, purchase a plan, or create financial obligations.
5. **No direct production database mutation from CI.** Schema changes require a migration, compatibility assessment, rollback plan, and owner-approved production execution.
6. **No direct commits to `main`.** Use a focused branch and pull request except for an explicitly documented emergency process.
7. **One canonical deployment.** Vercel Git integration owns production deployment. Do not create duplicate production deploy workflows or attach the domain to another project without a migration plan.
8. **Human review for high-impact decisions.** Identity, eligibility, legal, financial, security-incident, and access decisions must remain reviewable and auditable.

## Architecture Rules

1. Extend the authentication implementation in `src/lib/auth.ts`; do not replace it with another auth platform without an approved migration plan.
2. Put Prisma models in `prisma/schema.prisma` and access the database using `db` from `src/lib/db.ts`.
3. Validate API inputs with Zod.
4. Call `emitAuditLog()` from `src/lib/audit.ts` for administrator, reviewer, authorization, verification, and sensitive state changes.
5. Do not trust client-supplied roles, storage paths, scan results, payment states, provider decisions, or redirect URLs.
6. Pages belong in `src/app/`, API routes in `src/app/api/`, shared logic in `src/lib/`, and reusable UI in `src/components/`.
7. Match the existing design system and avoid introducing another styling framework.
8. External providers must be accessed through small adapter interfaces so they can be disabled or replaced.
9. Sensitive files must never be stored in public paths or accepted before private storage, validation, scanning, access control, audit logging, retention, and deletion are working.
10. APIs handling credentials, identity, contact, payments, administration, or recovery must use `no-store` responses and production-appropriate abuse controls.

## Agent Delivery Flow

Every implementation task follows this sequence:

1. **Create or reference one GitHub issue** containing the objective, acceptance criteria, exclusions, risks, and manual dependencies.
2. **Create a focused branch** using `feat/`, `fix/`, `chore/`, `docs/`, `security/`, or `test/`.
3. **Inspect before editing.** Read the affected routes, schema, tests, configuration, and recent related pull requests.
4. **Write a brief implementation plan** in the issue or pull request before broad changes.
5. **Implement the smallest complete vertical slice.** Avoid unrelated refactors.
6. **Add or update tests** for success, authorization failure, validation failure, provider failure, and fail-closed behavior.
7. **Run the repository gate:**

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

8. **Open a pull request** with risks, manual dependencies, test evidence, and rollback notes.
9. **Verify the Vercel preview** for affected public routes and inspect runtime/build logs.
10. **Merge only after required checks pass.** Vercel Git integration deploys `main` to production.
11. **Run production smoke checks** without submitting sensitive data or causing billable external actions.

## Build Gate

`pnpm run verify` must complete successfully. It runs:

- Prisma client generation
- ESLint
- TypeScript checking
- Unit tests
- Next.js production build

If the full command cannot run because a required external dependency is unavailable, the agent must document the exact blocker and must not claim the feature is complete.

## Free-Tier Development Policy

Development should preserve useful free operation:

- Prefer existing infrastructure and open-source libraries.
- Do not add a paid provider merely to complete a demo.
- Build provider-independent interfaces and use local fakes in tests.
- Keep optional integrations disabled by default.
- Add usage limits, queue boundaries, retention limits, and clear error states before enabling a metered service.
- Treat billing approval, identity-provider contracts, production email credentials, regulated data sources, and external seller verification as owner-only actions.

## Current Sensitive Feature Gates

These remain disabled or request-only until their activation requirements pass:

- Identity and financial document upload
- Biometric and liveness verification
- Automatic KYC/KYB approval
- Automatic payments and subscriptions
- Live threat-intelligence assertions
- Marketplace transactions and verified-member claims
- Guaranteed response times and continuous monitoring

## Key Files

- `src/lib/auth.ts` — authentication and session management
- `src/lib/db.ts` — Prisma client
- `src/lib/audit.ts` — audit events
- `src/app/api/contact/route.ts` — durable public enquiry intake
- `src/app/api/kyc/documents/route.ts` — intentionally fail-closed document endpoint
- `src/lib/storefrontPresentation.ts` — truthful request-only commerce presentation
- `prisma/schema.prisma` — database schema
- `next.config.js` — browser security headers and routing
- `.github/workflows/ci.yml` — canonical build verification gate
- `docs/AGENT_BUILD_FLOW.md` — task and release operating procedure

## Commit and Pull Request Standards

Use conventional commits such as `feat:`, `fix:`, `security:`, `test:`, `docs:`, and `chore:`. A pull request must include:

1. Objective and linked issue
2. User-visible and architectural changes
3. Files and data models affected
4. Security, privacy, billing, and operational risks
5. Tests and verification performed
6. Manual actions that remain
7. Rollback method

An AI agent is an executor, not the approval authority for billing, legal representations, identity decisions, production secrets, or regulated-service activation.
