# GEM Enterprise Analytics & Revenue Command Center

## Purpose

The command center is the unified operating layer for GEM Cybersecurity & Monitoring Assist. It brings executive performance, security operations, compliance readiness, revenue products, client health, AI-agent governance, and integration status into the existing authenticated GEM Enterprise application.

This module is maintained in the `support371/gem-enterprise` repository and no longer depends on Lovable's generation agent for ongoing development.

## Routes

| Route | Purpose |
| --- | --- |
| `/app/command-center` | Unified enterprise overview |
| `/app/command-center/executive` | Leadership KPIs and action priorities |
| `/app/command-center/security` | Incidents, response times, assets, and posture |
| `/app/command-center/compliance` | Framework readiness, controls, evidence, and tasks |
| `/app/command-center/revenue` | Products, subscriptions, service revenue, and usage |
| `/app/command-center/clients` | Tenant health, renewal, adoption, and expansion signals |
| `/app/command-center/agents` | AI-agent performance and human approval gates |
| `/app/command-center/integrations` | Connection state, health checks, ownership, and setup |
| `/api/command-center/snapshot` | Staff-authorized aggregate platform and operating-layer status |

All application routes inherit the existing `/app` layout, authentication boundary, responsive sidebar, notifications, account menu, and support assistant.

## Current implementation

The current branch provides:

- A reusable command-center renderer rather than duplicated page implementations.
- Role-compatible navigation inside the existing enterprise shell.
- Executive, security, compliance, revenue, client, AI-agent, and integration views.
- Basic date-range and organization filters in the interface.
- Human approval requirements for client outreach, security actions, compliance decisions, publishing, billing changes, and destructive operations.
- Commercial product coverage for analytics SaaS, managed cybersecurity, compliance management, consulting, AI automation, API access, white-label licensing, and training.
- Usage meters for API calls, AI actions, managed assets, and storage.
- Truthful integration states: a service must not be shown as connected without configuration metadata and a successful health check.
- A visible Demo data disclosure on every command-center view.
- A staff-restricted live snapshot of existing Prisma users, organization assignments, products, entitlements, support tickets, service requests, and audit events.
- Persistent operating-layer readiness detection without automatically changing production tables.

## Snapshot authorization and privacy

`/api/command-center/snapshot` uses the existing authoritative session gate and requires an active analyst, administrator, super-administrator, or internal role.

The endpoint returns aggregate counts only. It does not return names, email addresses, phone numbers, identity documents, passwords, payment credentials, API tokens, or client-level financial records. Responses use `Cache-Control: no-store` and the route is forced dynamic.

If the existing Prisma aggregates cannot be queried, the endpoint returns a disclosed unavailable state and the interface remains in demo mode.

## Persistent operating layer

The command center now detects whether the following proposed persistence tables exist:

- `enterprise_subscriptions`
- `enterprise_usage_records`
- `enterprise_security_incidents`
- `enterprise_compliance_controls`
- `enterprise_agents`
- `enterprise_integrations`

The reviewed SQL is stored at:

`prisma/proposals/20260713_command_center_operating_layer.sql`

It is intentionally **not** stored under `prisma/migrations` and is not auto-applied. Until the schema and production migration are approved, the API reports `migration_required` and lists only the number and names of missing operating tables to authorized staff.

When installed, the read-only repository can aggregate:

- active, trialing, and past-due subscriptions;
- current-period metered usage;
- open and critical security incidents;
- ready and upcoming compliance controls;
- governed AI agents that are ready or running;
- pending human approvals from the existing approval foundation;
- connected and degraded integration counts.

Runtime code uses parameter-safe static Prisma raw queries. It contains no insert, update, delete, alter, drop, or unsafe-query operation.

## Schema promotion procedure

Before the proposal can become an active migration:

1. Add equivalent models and enums to `prisma/schema.prisma` while reusing the existing organization, workspace, user, connector-governance, approval, and audit foundations.
2. Generate a Prisma migration against a disposable PostgreSQL database.
3. Compare the generated SQL with the reviewed proposal.
4. Test forward migration and rollback against representative non-sensitive data.
5. Run Prisma generation, lint, type checking, unit tests, and the Next.js production build.
6. Obtain explicit owner approval before production migration execution.
7. Apply the approved migration through the controlled deployment process, never through an unreviewed automatic database mutation.

## Data status

Illustrative records remain clearly labelled so the product can be reviewed before every external service is connected. No demo value should be interpreted as a real client, security, compliance, subscription, invoice, or AI result.

The live data sequence is:

1. Existing Prisma users, organization assignments, products, tickets, service requests, entitlements, and audit logs — implemented as aggregate-only staff data.
2. Operating-layer table readiness — implemented without automatic migration.
3. Security incidents, compliance controls, subscriptions, usage, governed agents, and integration health — available after approved schema promotion.
4. Provider-specific data such as Stripe, CRM, accounting, messaging, and infrastructure health — disabled until credentials, contracts, webhooks, permissions, and owner approval are complete.

## Security requirements

- All command-center routes remain behind the existing authenticated `/app` boundary.
- Organization-scoped records must be filtered by the authenticated tenant unless the actor holds an authorized platform role.
- Super-admin support access must be explicit and audited.
- External messages, public publishing, billing changes, security containment, compliance approvals, and destructive operations require human approval.
- Secrets must remain in server-side environment variables or an approved secret manager.
- Integration status must fail closed. Missing or stale health evidence must not produce a Connected status.
- Sensitive changes must produce an audit event with actor, action, target, timestamp, request correlation identifier, and safe before/after metadata.
- The SQL proposal stores provider references and safe metadata, not API secrets, access tokens, refresh tokens, payment-card data, or bank credentials.

## Revenue activation checklist

The product can generate revenue through recurring subscriptions and services once these operational connections are completed:

- Approve Basic, Professional, and Enterprise plan definitions and prices.
- Connect Stripe server-side and verify webhook signatures.
- Map plans and service products to entitlements.
- Record usage for API calls, AI actions, assets, users, storage, reports, and assessments.
- Add proposal, renewal, upgrade-request, and expansion-opportunity workflows.
- Connect CRM attribution and accounting reconciliation.
- Add white-label tenant branding and reseller controls.

No price, subscription, payment provider, or financial obligation is activated by this branch.

## Validation

The branch includes regression tests that verify:

- Every supported command-center section exists.
- Demo data remains explicitly disclosed.
- Monetization and operational domains are represented.
- Unverified integrations do not default to Connected.
- All command-center routes are exposed through authenticated navigation.
- Cross-organization aggregates require an active staff session.
- Snapshot responses are non-cacheable.
- The operating repository checks table readiness before aggregation.
- Runtime operating queries remain read-only and avoid unsafe raw-query APIs.
- The SQL remains a proposal rather than an automatic migration.
- The proposed tables do not store API secrets, OAuth tokens, payment-card numbers, or bank-account credentials.

The canonical Vercel project must be used for final preview validation. Duplicate Vercel projects attached to the same repository may report build-rate-limit failures that are unrelated to application correctness. The pull request must not merge until the final canonical head passes the repository gate.

## Rollback

Before migration promotion, rollback is simply reverting the feature branch or pull-request merge; no proposed SQL has been applied.

After a future approved migration, rollback must be tested and documented before execution. It should preserve audit evidence and export any legitimate operating records before dropping tables. Production rollback must never be improvised from the dashboard or an AI-agent action.
