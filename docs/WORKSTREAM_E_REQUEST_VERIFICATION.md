# Workstream E — Scoped Service Request Verification

## Scope

This release hardens the existing Request Center and adds an optional workspace reference to `ServiceRequest` while preserving explicit personal scope and workspace provenance.

## Production preflight

Read-only inspection before implementation confirmed:

- `public.requests` contained zero rows;
- the existing `requests` table had no `workspaceId` column;
- the existing workspace table was `public.tokmetric_workspaces`;
- production contained zero workspace memberships when the preflight was performed;
- row-level security was already enabled on `public.requests`;
- no public RLS policy existed for `public.requests`.

No historical request was available or eligible for workspace backfill.

## Rollback-only migration validation

The revised migration was executed inside an explicit production transaction and then rolled back.

Inside the transaction, all four checks succeeded:

- nullable `requests.workspaceId` column creation;
- `requests_workspaceId_createdAt_idx` index creation;
- `requests_workspaceId_fkey` foreign key creation against `tokmetric_workspaces(id)` with `ON DELETE RESTRICT`;
- row-level security remained enabled on `public.requests`.

`ON DELETE RESTRICT` is deliberate. A historical workspace-scoped request must not silently become a personal request because its workspace was deleted. The workspace must be retained or its historical requests must be deliberately reconciled in a separately reviewed process.

A post-rollback inspection confirmed:

- `requests.workspaceId` did not persist;
- the production request count remained zero;
- the production workspace-membership count remained zero;
- the public RLS policy count remained zero.

The rollback-only test did not apply a migration, create a request, create a membership, or alter persistent production schema.

## Access contract

- A request always remains owned by `userId`.
- No `workspaceId` means personal scope.
- A workspace-scoped read requires the caller's current active workspace membership.
- A workspace-scoped write revalidates the active membership and active organization inside the same serializable transaction that creates the request and audit evidence.
- A requested workspace is matched only against the caller's membership-filtered accessible workspace list.
- Platform-owner or administrator status does not bypass membership through the client Request Center.
- Request creation and audit evidence are written in one database transaction.
- Serializable transaction conflicts fail with a retryable request conflict instead of silently writing against changed access state.

## Request-boundary contract

- Both reads and writes require an authoritative active GEM account.
- Browser writes require an explicit `Origin` equal to the canonical request origin.
- Missing, invalid, or cross-origin `Origin` values fail closed.
- Writes are rate-limited per authenticated user and request IP.
- Responses are non-cacheable and use a no-referrer policy.

## Content contract

The Request Center does not accept likely values for:

- passwords, PINs, passcodes, one-time codes, API keys, tokens, or client secrets;
- private keys, seed phrases, recovery phrases, or backup codes;
- payment-card numbers;
- banking identifiers;
- identity-document or government-identifier numbers.

Ordinary support language such as asking for help resetting a password remains allowed when no secret value is supplied.

## Migration decision

The migration file is additive and nullable. It contains no update statement, no historical backfill, and no `NOT NULL` conversion. It preserves workspace provenance and keeps direct public database access fail-closed.

Production application remains prohibited until the exact release head passes Prisma promotion and validation, claims consistency, lint, TypeScript, the full test suite, and the optimized Next.js build. Production postchecks must then confirm zero unintended request rows.
