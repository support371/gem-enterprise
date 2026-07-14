# Organization Workspace Compatibility Assessment

## Decision

The existing `Organization`, `Workspace`, `WorkspaceMember`, `Role`, and `Permission` models are approved as the current authoritative foundation for **workspace identity, membership, role assignment, permission metadata, and workspace safety controls**.

This approval is deliberately narrow. It does not convert every TokMetric operating model into a general GEM Enterprise tenant model.

## Existing database mapping

The current Prisma models map to tables whose names begin with `tokmetric_`:

- `Organization` → `tokmetric_organizations`
- `Workspace` → `tokmetric_workspaces`
- `WorkspaceMember` → `tokmetric_workspace_members`
- `Role` → `tokmetric_roles`
- `Permission` → `tokmetric_permissions`

The table names reflect their implementation history. The model structures themselves are sufficiently generic for membership-scoped access resolution, but the table names must not be presented publicly as evidence that every GEM Enterprise service is already tenant-backed.

## Approved use in Workstream D, slice 1

The application may use these models to:

- list only the active workspace memberships assigned to the authenticated user;
- resolve a requested workspace only from that user's accessible membership set;
- display organization and workspace names, membership role, permission labels, safe aggregate counts, and workspace lock states;
- show a truthful empty state when no active membership exists;
- keep the synthetic Basic, Professional, and Enterprise owner preview separate from real workspace records.

## Prohibited use in this slice

The application must not:

- allow platform-owner status alone to bypass workspace membership on the client workspace route;
- query a workspace globally and then decide access in the browser;
- expose another organization's workspace, membership, connector, content, approval, audit, or analytics records;
- treat TokMetric campaigns, content, media, publishing, OAuth, connector credentials, or analytics as general client workspace data;
- activate billing, prices, subscriptions, plan commitments, or provider integrations;
- impersonate a client or create synthetic memberships in production;
- rename or migrate the existing tenancy tables;
- merge the broad command-center schema proposal from PR #173.

## Access rule

`WorkspaceMember` is the authoritative access edge for `/app/workspace` and `GET /api/workspaces`.

A workspace is accessible only when:

1. the caller has an authoritative authenticated GEM session;
2. the membership belongs to the caller's user ID;
3. the membership status is `active`; and
4. the related organization status is `active`.

A workspace ID supplied through a URL or API query must be matched against the already-filtered accessible membership list. A missing match is an access denial, not a fallback to a global workspace lookup.

## Platform-owner preview separation

`/app/admin/plan-workspaces` remains an owner-only, read-only synthetic preview. It may demonstrate Basic, Professional, and Enterprise layouts and representative personas, but it must never display or mutate real client records.

The owner preview is not client impersonation and does not grant membership to a production workspace.

## Future schema decision

A later reviewed release may either:

- formally generalize and rename the existing tenancy tables through a tested compatibility migration; or
- introduce a distinct enterprise tenancy domain and migrate approved records deliberately.

That later decision requires disposable-database validation, cross-tenant tests, production migration review, and explicit approval. No database migration is included in this slice.
