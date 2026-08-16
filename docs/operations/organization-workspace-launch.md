# Organization workspace controlled launch

GEM organization workspaces provide official, membership-scoped access while organization-specific modules are completed. An active workspace is not a claim that every module or external service is production-ready.

## Invite a new organization owner

Use this path when the owner does not already have an active GEM client account.

1. Sign in as the GEM platform owner.
2. Open `/app/admin/workspace-access`.
3. Use **Invite a new organization owner**.
4. Enter the exact owner name and email twice, the public organization name, main workspace name, optional first project, and a written business reason.
5. Copy the returned one-time setup link immediately and deliver it through an approved secure channel. The plaintext capability is returned once, placed only in the URL fragment, and is never stored by GEM.
6. The invited owner opens the link, verifies the masked destination and workspace details, and creates their own password.
7. Acceptance atomically creates the `client` account, profile, organization, workspace, Organization Owner role, permissions, membership, optional project, and audit event.
8. The owner signs in through `/client-login?next=%2Fapp%2Fworkspace`.

The invitation cannot create a GEM platform administrator. It expires automatically, is single-use, and is revoked if the email or organization already exists before acceptance.

## Provision an existing member

1. Deploy the reviewed schema migration through the normal owner-approved database process.
2. Sign in as the GEM platform owner.
3. Open `/app/admin/workspace-access`.
4. Use **Provision an organization workspace**.
5. Enter the organization name, main workspace name, and the exact email of an existing active GEM client account twice.
6. Optionally provide the first project and its truthful setup summary.
7. Record a written reason and submit.

The transaction creates the organization, main workspace, organization-owner role, membership, optional project, and an audit record. It never creates credentials and never changes the member's GEM platform role.

For Infinite Wealth & Well-Being, use the exact public organization name and Leonard Diana's authoritative email. If his account does not exist in production, use the organization-owner invitation path. Do not place that email or the one-time setup link in source control, documentation, tickets, or logs.

## Member access

The official entry point is `/client-login?next=%2Fapp%2Fworkspace`. After authentication, active workspace members are routed to their first assigned workspace. Unassigned users continue through the existing onboarding destination resolver.

Organization owners may add only existing active client accounts. The target email must be confirmed, the selected role must belong to the same workspace, and every assignment is audited. Workspace roles cannot grant GEM platform administrator authority.

## Weekly reporting lifecycle

`DRAFT → SUBMITTED → APPROVED` or `RETURNED`.

- Authors may draft or submit within their workspace.
- Authors cannot approve their own submission.
- Another member with the controlled weekly-update permission reviews it.
- Only `APPROVED` summaries appear in the platform-owner Organization Highlights view.

## Truthful module states

- `AVAILABLE`: repository and authorization support is present.
- `SETUP_IN_PROGRESS`: the workspace can show the module, but its organization-specific implementation is incomplete.
- `NOT_ACTIVATED`: the capability remains unavailable and must not be presented as operational.

## Rollback

Application rollback is the commit immediately preceding this feature. Database rollback requires first exporting or retaining organization project and weekly-update records, then removing the two foreign-key tables and their enum types in a separately reviewed migration. Never drop production records merely to roll back the interface.
