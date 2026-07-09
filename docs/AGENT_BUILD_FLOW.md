# GEM Enterprise Agent-First Build Flow

## Purpose

This flow lets GEM Enterprise keep building with limited personnel time and minimal billing exposure while preserving a trustworthy production system.

> Humans define intent and approve high-impact decisions. Agents implement, test, document, and prepare pull requests. Hosted gates verify the work. Sensitive capabilities remain disabled until their infrastructure and owner approvals exist.

## Current hosted-gate arrangement

- **Canonical automatic gate:** Vercel preview deployment for the canonical `support371-gem-enterprise` project.
- **What the preview runs:** Prisma generation, ESLint, TypeScript checking, Vitest, and the Next.js production build.
- **GitHub Actions:** build verification and CodeQL workflows remain available through manual dispatch. They are not automatic while hosted-runner access is constrained.
- **Production deployment:** Vercel Git integration deploys `main`. No second production deployment workflow is permitted.
- **Important:** a GitHub workflow that never starts is not a passing check. The Vercel preview and the agent's own `pnpm run verify` evidence are required.

## Roles

### Business owner

Responsible for:

- Business priorities and public claims
- Billing, contracts, and paid plans
- Legal entity and policy approval
- Provider accounts and production credentials
- Final approval for identity, payment, storage, monitoring, and regulated-service activation

### Lead development agent

Responsible for:

- Repository inspection and task planning
- Focused implementation
- Tests and documentation
- Pull-request creation
- Local or agent-environment verification
- Vercel preview verification
- Reporting exact blockers and manual actions

### Review agent

Responsible for an independent pass over:

- Security and authorization boundaries
- Privacy and sensitive-data handling
- False or unsupported public claims
- Database and migration safety
- Test coverage and rollback readiness

## Canonical workflow

```text
Owner objective
    ↓
GitHub issue with acceptance criteria
    ↓
Agent branch
    ↓
Inspect current code and related PRs
    ↓
Small vertical implementation
    ↓
Unit, authorization, validation, and fail-closed tests
    ↓
pnpm run verify in the agent environment
    ↓
Pull request
    ↓
Canonical Vercel preview runs lint + typecheck + tests + build
    ↓
Independent review; manual CodeQL when runner access is available
    ↓
Owner-only approval when billing, legal, or provider action exists
    ↓
Merge to main
    ↓
Vercel Git production deployment
    ↓
Production smoke check and rollback watch
```

## Work queue

### P0 — Production safety

Examples:

- Authentication bypass
- Data exposure
- Contact submissions being lost
- Broken production deployment
- Unsupported claims that can materially mislead users

Rules:

- Stop unrelated feature work.
- Fix in the smallest possible branch.
- Require tests and production verification.

### P1 — Revenue and customer flow

Examples:

- Enquiry intake
- Application status
- Service-request workflow
- Email delivery
- Reviewer queue

Rules:

- Build request-and-review flows before automated or paid flows.
- Persist data before showing success.

### P2 — Trust infrastructure

Examples:

- Audit records
- Access controls
- Backups and restore testing
- Rate limiting
- Monitoring
- Privacy and retention controls

### P3 — Optional expansion

Examples:

- Provider adapters
- Live feeds
- Automated payments
- Biometrics
- Marketplace transactions

Rule: keep these disabled until P0–P2 requirements and owner approvals are complete.

## Definition of ready

An issue is ready for an agent only when it contains:

- User or business outcome
- In-scope routes and roles
- Acceptance criteria
- Explicit exclusions
- Sensitive-data classification
- Billing impact
- Manual/provider dependencies
- Rollback expectation

## Definition of done

A task is complete only when:

- The implementation matches the issue scope.
- Validation and authorization failures are tested.
- Provider failure or missing configuration fails closed.
- `pnpm run verify` passes in the development-agent environment.
- The canonical Vercel preview passes its full preview verification and build.
- Affected preview routes work.
- No secret or real sensitive document was used in testing.
- The PR states what remains manual.
- Production smoke checks pass after merge.

## Standard agent prompt

```text
Repository: support371/gem-enterprise

Read AGENTS.md and docs/AGENT_BUILD_FLOW.md before making changes.

Objective:
<one measurable outcome>

Acceptance criteria:
- <criterion 1>
- <criterion 2>
- <criterion 3>

Explicit exclusions:
- No paid service activation
- No production secrets
- No direct commit to main
- No enabling sensitive uploads or payments unless every required control and owner approval is included

Required process:
1. Inspect affected code, schema, tests, configuration, and recent related PRs.
2. Post a short plan.
3. Implement the smallest complete vertical slice.
4. Add tests for success, validation failure, authorization failure, and fail-closed behavior.
5. Run pnpm run verify in your environment.
6. Batch related changes before pushing to reduce preview builds.
7. Open a PR with risks, manual dependencies, and rollback steps.
8. Require the canonical Vercel preview to pass.
9. Do not claim completion if any available gate fails.
```

## Recommended agent allocation

### Primary implementation agent: OpenAI Codex

Use for:

- Multi-file repository tasks
- Bug diagnosis
- Refactors and migrations
- Test creation
- Pull-request preparation
- Parallel tasks isolated by branch

Codex must follow `AGENTS.md`, use one issue per task, run repository verification in its environment, and operate through pull requests.

### Independent review: GitHub Copilot coding agent or a second Codex task

Use for:

- Reviewing the PR without sharing the implementation conversation
- Checking authorization, data handling, and regressions
- Finding missing tests

### Replit Agent

Use for a visual prototype or isolated experiment. Do not make it the canonical production repository or deployment path.

### Devin

Use only for a clearly bounded backlog when paid capacity is approved. It is not required for the current free-first flow.

## First implementation program: GEM Verify Core

Build in this order:

1. Verification application and consent records
2. Manual case-status workflow
3. Reviewer queue and role checks
4. Information-request, approval, rejection, and escalation actions
5. Audit events and immutable decision history
6. Storage-provider interface with a fake test implementation
7. Retention and deletion scheduling model
8. Private upload adapter only after owner-selected storage and scanning are available
9. Optional Veriff or another provider adapter after sandbox approval

Until step 8 is verified, `/api/kyc/documents` must remain fail closed.

## Free-tier safeguards

- Batch related edits before pushing so one preview validates one coherent change set.
- Cancel superseded preview and CI runs where supported.
- Use the canonical Vercel project only.
- Let Vercel Git integration perform the only production deployment.
- Use local fakes for external providers in tests.
- Do not run scheduled jobs more frequently than required.
- Keep optional integrations disabled by default.
- Record usage and define a hard stop before enabling metered services.
- Never rely on a free plan whose terms prohibit the intended business use.

## Manual gates

The agent must stop and request owner action for:

- Accepting pricing or terms
- Enabling billing
- Creating regulated-data provider accounts
- Entering production secrets
- Selecting retention periods
- Approving public certifications or SLAs
- Naming authorized identity reviewers
- Activating payment collection
- Moving the production domain or database
- Disconnecting duplicate Vercel projects or changing organization-level GitHub billing and Actions settings

These gates are separation-of-duty controls, not development failures.
