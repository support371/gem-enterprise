# Next Workstream Plan

This document defines the execution order after Release 1 public-truth routing is approved and merged.

## Workstream A — Public Claims Inventory and Remediation

Objective: establish a complete evidence-backed inventory of claims currently published across the public website.

Priority routes:

- `/hub`
- `/services`
- `/company`
- `/request-access`
- `/get-started`
- `/store`
- `/community-hub`
- `/trust-center`

Required outputs:

1. Exact claim text and route location.
2. Classification: verified, conditional, demonstration, planned, expired, unsupported, or prohibited.
3. Evidence owner and evidence location.
4. Approved replacement wording.
5. Review date and expiry date.
6. Public rendering rule.
7. Tests preventing unsupported high-risk wording from being published.

Initial implementation should begin with a repository-based claims manifest and review tooling before any production schema migration is approved.

## Workstream B — Onboarding Funnel Separation

Objective: separate enterprise service applications, Community applications, and product enquiries.

Required routes:

- `/enterprise/apply`
- `/community/apply`
- `/store/products/[slug]/request`

Required behavior:

- Separate validation schemas.
- Durable records for anonymous submissions.
- Separate admin queues.
- Status history and assignment.
- No document upload on public intake forms.
- No automatic acceptance or rejection.
- No guaranteed response-time language unless backed by an approved support policy.

## Workstream C — Authentication and Recovery Evidence

Objective: prove the existing login and password-recovery system end to end.

Required evidence:

- Forgot-password request accepted without account disclosure.
- Delivery through configured SMTP.
- Canonical reset URL.
- Token expiry and one-time use.
- Password policy enforcement.
- Old password invalidated.
- Existing sessions invalidated where required.
- Audit event without token or password leakage.

## Workstream D — Real Organization-Scoped Workspaces

Objective: convert Basic, Professional, and Enterprise previews into database-backed tenant workspaces while preserving safe owner preview mode.

Required safeguards:

- No cross-tenant reads or writes.
- No reuse of TokMetric-specific models without an approved compatibility assessment.
- Synthetic owner preview remains isolated from real client data.
- Entitlements and plan capabilities remain explicit and auditable.

## Execution rule

Do not combine these workstreams into one pull request.

Recommended order:

1. Claims inventory foundation.
2. Onboarding funnel separation.
3. Authentication recovery evidence.
4. Organization and workspace model decision.
5. Workspace implementation.

Each slice must include tests, preview verification, rollback instructions, and explicit owner-only actions.
