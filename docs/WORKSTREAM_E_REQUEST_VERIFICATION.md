# Workstream E — Scoped Service Request Verification

## Scope

This release hardens the existing Request Center and adds an optional workspace reference to `ServiceRequest` while preserving explicit personal scope.

## Production preflight

Read-only inspection before implementation confirmed:

- `public.requests` contained zero rows;
- the existing `requests` table had no `workspaceId` column;
- the existing workspace table was `public.tokmetric_workspaces`;
- production contained zero workspace memberships when the preflight was performed.

No historical request was available or eligible for workspace backfill.

## Rollback-only migration validation

The proposed migration was executed inside an explicit production transaction and then rolled back.

Inside the transaction, all three checks succeeded:

- nullable `requests.workspaceId` column creation;
- `requests_workspaceId_createdAt_idx` index creation;
- `requests_workspaceId_fkey` foreign key creation against `tokmetric_workspaces(id)` with `ON DELETE SET NULL`.

A post-rollback inspection confirmed:

- `requests.workspaceId` did not persist;
- the production request count remained zero;
- the production workspace-membership count remained zero.

The rollback-only test did not apply a migration, create a request, create a membership, or alter persistent production schema.

## Access contract

- A request always remains owned by `userId`.
- No `workspaceId` means personal scope.
- A workspace-scoped read or write requires the caller's current active workspace membership.
- A requested workspace is matched only against the caller's membership-filtered accessible workspace list.
- Platform-owner or administrator status does not bypass membership through the client Request Center.
- Request creation and audit evidence are written in one database transaction.

## Content contract

The Request Center does not accept likely values for:

- passwords, PINs, passcodes, one-time codes, API keys, tokens, or client secrets;
- private keys, seed phrases, recovery phrases, or backup codes;
- payment-card numbers;
- banking identifiers;
- identity-document or government-identifier numbers.

Ordinary support language such as asking for help resetting a password remains allowed when no secret value is supplied.

## Migration decision

The migration file is additive and nullable. It contains no update statement, no historical backfill, and no `NOT NULL` conversion.

Production application remains prohibited until the exact release head passes Prisma promotion and validation, lint, TypeScript, the full test suite, and the optimized Next.js build. Production postchecks must then confirm zero unintended request rows.
