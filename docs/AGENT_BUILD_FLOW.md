# GEM Enterprise Agent-First Build Flow

## Purpose

This flow allows GEM Enterprise to keep building with limited personnel time and minimal billing exposure while preserving a trustworthy production system.

The operating principle is:

> Humans define intent and approve high-impact decisions. Agents implement, test, document, and prepare pull requests. Automated gates verify the work. Production-sensitive capabilities remain disabled until their infrastructure and owner approvals exist.

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
- Build and preview verification
- Reporting exact blockers and manual actions

### Review agent

Responsible for an independent pass over:

- Security and authorization boundaries
- Privacy and sensitive-data handling
- False or unsupported public claims
- Database and migration safety
- Test coverage and rollback readiness

The lead agent and review agent may use different products, but every change still passes the same repository gate.

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
Unit/security/fail-closed tests
    ↓
pnpm run verify
    ↓
Pull request
    ↓
Independent review + CodeQL + Vercel preview
    ↓
Owner-only approval when billing/legal/provider action exists
    ↓
Merge to main
    ↓
Vercel Git production deployment
    ↓
Production smoke check and rollback watch
```

## Work queue

Use four priority lanes.

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

Rules:

- Keep disabled until P0–P2 requirements and owner approvals are complete.

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
- `pnpm run verify` passes.
- Vercel preview routes work.
- No secret or real sensitive document was used in testing.
- The PR states what remains manual.
- Production smoke checks pass after merge.

## Standard agent prompt

Use this prompt when delegating a repository task:

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
- No enabling sensitive uploads or payments unless this issue explicitly includes every required control and owner approval

Required process:
1. Inspect affected code, schema, tests, and recent related PRs.
2. Post a short plan.
3. Implement the smallest complete vertical slice.
4. Add tests for success, validation failure, authorization failure, and fail-closed behavior.
5. Run pnpm run verify.
6. Open a PR with risks, manual dependencies, and rollback steps.
7. Do not claim completion if any gate fails.
```

## Recommended agent allocation

### Primary implementation agent: OpenAI Codex

Use for:

- Multi-file repository tasks
- Bug diagnosis
- Refactors and migrations
- Test creation
- Pull-request preparation
- Parallel tasks that can be isolated by branch

Codex should follow `AGENTS.md`, use one issue per task, and operate only through pull requests.

### Independent review: GitHub Copilot coding agent or a second Codex task

Use for:

- Reviewing the PR without sharing the implementation conversation
- Looking for authorization, data-handling, and regression issues
- Suggesting missing tests

### Replit Agent

Use when a visual prototype or isolated experimental application is needed. Do not make it the canonical production repository or deployment path for GEM Enterprise.

### Devin

Use only for a clearly bounded backlog with sufficient paid capacity. It is not required for the current free-first flow.

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
9. Optional Veriff or other provider adapter after sandbox approval

Until step 8 is verified, `/api/kyc/documents` must remain fail closed.

## Free-tier safeguards

- Cancel superseded CI runs.
- Use one canonical verification job.
- Let Vercel Git integration perform the only production deployment.
- Use local fakes for external providers in tests.
- Do not run scheduled jobs more frequently than the business requires.
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

These gates are not development failures. They are separation-of-duty controls.
