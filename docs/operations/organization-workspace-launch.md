# Organization workspace controlled launch

GEM organization workspaces provide official, membership-scoped access while organization-specific modules are completed. An active workspace is not a claim that every module or external service is production-ready.

## Provision an existing member

1. Deploy the reviewed schema migration through the normal owner-approved database process.
2. Sign in as the GEM platform owner.
3. Open `/app/admin/workspace-access`.
4. Use **Provision an organization workspace**.
5. Enter the organization name, main workspace name, and the exact email of an existing active GEM client account twice.
6. Optionally provide the first project and its truthful setup summary.
7. Record a written reason and submit.

The transaction creates the organization, main workspace, organization-owner role, membership, optional project, and an audit record. It never creates credentials and never changes the member's GEM platform role.

For Infinite Wealth & Well-Being, use the exact public organization name and select Leonard Diana's existing account by its authoritative email. Do not place that email in source control or documentation.

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
