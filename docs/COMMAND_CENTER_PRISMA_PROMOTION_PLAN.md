# Command Center Prisma Promotion Plan

## Status

This document records the reviewed schema-consolidation decision for the GEM Enterprise command center. It does not authorize or execute a production database migration.

## Existing foundations to reuse

The current Prisma schema already contains the operating foundations required for tenancy, authorization, integrations, approvals, analytics, and auditing:

- `Organization` and `Workspace` define tenant ownership and workspace isolation.
- `WorkspaceMember`, `Role`, and `Permission` define workspace authorization.
- `Connector` and `ConnectorCredentialReference` define provider connections and external secret references.
- `ApprovalRequest` and `ApprovalDecision` define human approval gates.
- `AnalyticsSnapshot` stores generic time-series metrics.
- `AuditEvent` stores workspace-scoped operating audit events.

No duplicate organization, tenant, integration, approval, or audit model should be introduced.

## Missing operating domains

The formal Prisma schema extension should add these domains:

### Commercial operations

- `Subscription`
- `UsageRecord`

Subscriptions represent approved plan lifecycle state only. They must not imply that Stripe or another billing provider is configured. Provider customer, subscription, and price identifiers may be stored as non-secret references after explicit activation approval.

### Security operations

- `SecurityAsset`
- `SecurityIncident`

Security records must be workspace scoped. Incident actions that affect external systems must remain behind an `ApprovalRequest` or an explicitly authorized runbook.

### Compliance and risk

- `ComplianceFramework`
- `ComplianceControl`
- `ComplianceEvidence`
- `ComplianceTask`
- `Risk`

Evidence records should store metadata and controlled storage references, not raw identity documents or secrets. Existing `CompliancePolicy` and `ComplianceReview` remain the content-policy review system; the new models represent enterprise control readiness and evidence tracking.

### Governed automation

- `GovernedAgent`
- `GovernedAgentRun`

Agent runs must record state, safe inputs/outputs metadata, approval requirements, timestamps, and failure details without storing credentials. External writes, billing changes, compliance decisions, security containment, publishing, and destructive operations require human approval.

### Integration observability

- `IntegrationHealth`

Integration health extends `Connector`; it does not replace it. Health rows may record status, latency, last success/failure timestamps, safe error codes, and non-secret metadata.

## Required enum families

The schema should use explicit enums for:

- subscription status and billing cadence;
- usage source;
- asset and incident severity/state;
- compliance-control implementation and evidence state;
- task and risk state/severity;
- governed-agent and governed-run state;
- integration-health status.

Enums must include truthful unavailable, configuration-required, degraded, blocked, or unknown states where appropriate.

## Relationship rules

- Every new operating row must resolve to a `Workspace` or to an `Organization` with a documented reason.
- `IntegrationHealth` must reference `Connector`.
- Human-gated actions should reference `ApprovalRequest` where a durable approval record is required.
- Records that can produce external side effects should carry idempotency or external-reference fields where appropriate.
- Foreign-key deletes must not erase legitimate audit, compliance, or incident history accidentally. Restrict or archive behavior should be preferred for evidentiary records.

## Index requirements

At minimum, add composite indexes for:

- workspace plus status/state;
- workspace plus created/captured timestamp;
- organization/workspace plus provider reference where uniqueness is required;
- incident severity plus state;
- compliance framework/control status;
- agent run state plus start time;
- connector plus health timestamp.

## Secret and privacy rules

The new models must never store:

- plaintext passwords;
- API secrets;
- OAuth access or refresh tokens;
- payment-card data;
- bank-account credentials;
- raw identity-document contents.

Connector secrets remain outside the database or are referenced through `ConnectorCredentialReference.secretRef`. Evidence and report files must use controlled storage references.

## Migration generation

1. Add the reviewed models and enums to `prisma/schema.prisma`.
2. Run `prisma format` and `prisma validate`.
3. Generate a migration from the schema diff against a disposable PostgreSQL database.
4. Inspect the generated SQL for destructive operations, table-name drift, enum conflicts, and unintended alterations to existing TokMetric tables.
5. Apply the migration to the disposable database.
6. Seed representative tenant-safe test records.
7. Verify the command-center readiness repository reports `installed` only when every expected table exists.
8. Run the complete repository verification and Next.js production build.
9. Test rollback or a reviewed forward-recovery migration.
10. Obtain explicit owner approval before any production execution.

## Production prohibition

Neither this plan nor the existing SQL proposal authorizes production migration execution. Production migration remains blocked until:

- the generated migration is reviewed;
- disposable-database application and recovery testing pass;
- repository verification passes;
- the canonical Vercel preview is green;
- an explicit production owner approval is recorded.

## Rollback strategy

Before production execution, rollback is removal or revision of the unmerged schema and migration files.

After an approved production migration, rollback must preserve legitimate audit, compliance, incident, usage, and subscription history. Destructive table drops are not an acceptable default rollback. Prefer a reviewed forward-recovery migration, feature disablement, or compatibility columns while evidence-bearing records remain retained.

## Tracking

- Parent command-center delivery: PR #163
- Parent implementation issue: #164
- Prisma promotion issue: #172
- Working branch: `feat/command-center-prisma-operating-models`
