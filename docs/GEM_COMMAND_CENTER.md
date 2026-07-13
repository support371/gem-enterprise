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

All routes inherit the existing `/app` layout, authentication boundary, responsive sidebar, notifications, account menu, and support assistant.

## Current implementation

The first release provides:

- A reusable command-center renderer rather than duplicated page implementations.
- Role-compatible navigation inside the existing enterprise shell.
- Executive, security, compliance, revenue, client, AI-agent, and integration views.
- Basic date-range and organization filters in the interface.
- Human approval requirements for client outreach, security actions, compliance decisions, publishing, billing changes, and destructive operations.
- Commercial product coverage for analytics SaaS, managed cybersecurity, compliance management, consulting, AI automation, API access, white-label licensing, and training.
- Usage meters for API calls, AI actions, managed assets, and storage.
- Truthful integration states: a service must not be shown as connected without configuration metadata and a successful health check.
- A visible Demo data disclosure on every command-center view.

## Data status

The first release intentionally uses clearly labelled illustrative records so the product can be reviewed before every external service is connected. No demo value should be interpreted as a real client, security, compliance, subscription, invoice, or AI result.

The next data phase should replace each illustrative collection with server-side queries and authorization-aware aggregations. Recommended order:

1. Existing Prisma users, organizations, products, tickets, service requests, entitlements, and audit logs.
2. Security incidents, assets, vulnerabilities, assessments, and remediation actions.
3. Compliance frameworks, controls, evidence, policies, risks, audits, and tasks.
4. Subscription, invoice, payment, credit, entitlement, and usage-meter records.
5. AI-agent registry, tasks, insights, approvals, errors, and cost records.
6. Integration metadata and recurring health-check results.

## Security requirements

- All command-center routes remain behind the existing authenticated `/app` boundary.
- Organization-scoped records must be filtered by the authenticated tenant unless the actor holds an authorized platform role.
- Super-admin support access must be explicit and audited.
- External messages, public publishing, billing changes, security containment, compliance approvals, and destructive operations require human approval.
- Secrets must remain in server-side environment variables or an approved secret manager.
- Integration status must fail closed. Missing or stale health evidence must not produce a Connected status.
- Sensitive changes must produce an audit event with actor, action, target, timestamp, request correlation identifier, and safe before/after metadata.

## Revenue activation checklist

The product can generate revenue through recurring subscriptions and services once these operational connections are completed:

- Approve Basic, Professional, and Enterprise plan definitions and prices.
- Connect Stripe server-side and verify webhook signatures.
- Map plans and service products to entitlements.
- Record usage for API calls, AI actions, assets, users, storage, reports, and assessments.
- Add proposal, renewal, upgrade-request, and expansion-opportunity workflows.
- Connect CRM attribution and accounting reconciliation.
- Add white-label tenant branding and reseller controls.

## Validation

The branch includes a regression test that verifies:

- Every supported command-center section exists.
- Demo data remains explicitly disclosed.
- Monetization and operational domains are represented.
- Unverified integrations do not default to Connected.
- All command-center routes are exposed through authenticated navigation.

The canonical Vercel project should be used for preview validation. Duplicate Vercel projects attached to the same repository may report build-rate-limit failures that are unrelated to application correctness.
