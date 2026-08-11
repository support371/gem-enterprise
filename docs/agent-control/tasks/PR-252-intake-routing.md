# PR #252 — Eligibility and Intake Routing

## Identity

- Owner: Jules / next independent implementation lane
- Source: PR #252 / issue #251
- Current main: `1128771e2b8dfc767fb50a7394dee4b5de5a8544`
- Old source head: `3699dd5135acee4b5b1dc2c5c39674a195a5c666`
- Old branch: `fix/251-applicant-routing-readiness`
- Drift: 3 commits ahead and 41 behind current `main`
- Status: `BLOCKED`
- Primary blocker: `SOURCE`

## Objective

Route supported applicant types from eligibility into the current public intake
without weakening authentication, onboarding, validation, or authorization.

## Strategy

Do not rebase or merge the stale branch blindly. Inspect its six-file functional
intent, compare every behavior against current main, then use a fresh focused
branch from current main to implement only still-missing capability.

## Requirements

- Preserve current signup, login, authentication, and onboarding architecture.
- Route supported `individual`, `company`, `trust`, and
  `family_office` types correctly when still required by the current schema.
- Normalize against a fixed allow-list.
- Unknown, invalid, or URL-like type input fails safely with no open redirect.
- Client input cannot grant roles, privileges, approval, or entitlement.
- Add targeted deterministic regression tests for every supported type and
  invalid/unknown input.
- Avoid Prisma changes unless a separate reviewed contract proves they are
  required; never use schema mutation to bypass configuration.

## Supersession conditions

PR #252 may be marked superseded only after a current-main replacement:

- identifies which old behaviors remain missing;
- implements and tests those behaviors without regressing current architecture;
- records exact changed files and exact-head CI evidence;
- passes review, drift, secret, and rollback gates; and
- links the replacement evidence before the old PR is closed.

If current main already provides every behavior, document path-and-test evidence
instead of reimplementing. Apply [merge gates](../MERGE-GATES.md).

Rollback point for analysis: current main
`1128771e2b8dfc767fb50a7394dee4b5de5a8544`; no mutation is authorized until
the gap analysis establishes a fresh owned file set.
