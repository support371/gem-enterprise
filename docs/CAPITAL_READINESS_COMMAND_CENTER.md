# GEM Enterprise Capital Readiness & Transaction Command Center

## Status

This module is implemented on `feat/capital-readiness-transaction-command-center` and tracked by Issue #220 and PR #221.

Production database migration, regulated execution, transaction-based compensation, custody, money movement, external outreach, and provider activation remain blocked until the applicable production approvals and credentials exist.

## Purpose

The Capital Readiness & Transaction Command Center manages the complete controlled lifecycle for:

- business and real-estate opportunity intake;
- qualification and engagement scoping;
- business KYB, beneficial ownership, sanctions, PEP, adverse-media, source-of-funds, and conflict review;
- corporate, financial, commercial, management, cybersecurity, compliance, transaction, and data-room readiness;
- findings, remediation, committee approval, and licensed-partner routing;
- research-only counterparty universes and licensed-partner-controlled outreach;
- secure data rooms, diligence, proposals, term sheets, closing conditions, and closing;
- post-close cybersecurity, compliance, reporting, and recurring-service contracts;
- governed AI agents that remain read-only by default.

It does not make GEM a broker-dealer, investment adviser, placement agent, crowdfunding intermediary, custodian, bank, or licensed investment firm.

## Architecture

The module reuses the canonical GEM Enterprise foundations:

- `Organization` and `Workspace` for tenancy;
- `WorkspaceMember`, `Role`, and `Permission` for authorization;
- `ApprovalRequest` and `ApprovalDecision` for human gates;
- `IdempotencyRecord` for replay protection;
- `AuditEvent` for immutable operating evidence;
- authenticated Next.js routes for the control plane;
- Prisma/PostgreSQL for persistence;
- the existing Command Center shell and navigation.

No parallel tenant, role, approval, connector, or audit system was introduced.

## User surfaces

### Command Center

Path:

```text
/app/command-center/capital-readiness
```

The page provides:

- authenticated workspace selection;
- live opportunity, matter, hold, partner, data-room, contract, and revenue metrics;
- controlled opportunity creation;
- transaction-stage counts;
- activation blockers;
- readiness methodology;
- no-custody and regulated-execution disclosures.

When the capital tables are not installed in the selected environment, the page reports `configuration_required` and does not substitute demo transaction data.

### Core APIs

```text
GET  /api/capital-readiness/workspaces
GET  /api/capital-readiness/snapshot?workspaceId=...
GET  /api/capital-readiness/opportunities?workspaceId=...
POST /api/capital-readiness/opportunities
POST /api/capital-readiness/policy
POST /api/capital-readiness/readiness/calculate
POST /api/capital-readiness/commands
POST /api/capital-readiness/lifecycle
GET  /api/capital-readiness/approvals?workspaceId=...
POST /api/capital-readiness/approvals
POST /api/capital-readiness/approvals/{id}/decision
POST /api/capital-readiness/matters/{id}/transition
POST /api/capital-readiness/closings/{id}/authorize
```

All write routes are non-cacheable, authenticated, workspace-scoped, emergency-lock-aware, and audit-producing.

## Operating roles

### Platform roles

The existing platform session role determines whether a user may access staff-only routes. Partner-facing lifecycle actions use an active authenticated session rather than inheriting staff authority.

### Workspace roles

The lifecycle layer recognizes these normalized workspace responsibilities:

- internal operators: analyst, transaction director, compliance, administrator;
- compliance authority: compliance officer, compliance, administrator, platform owner;
- licensed partner: licensed partner, partner, broker-dealer, placement agent.

A user must be an active member of the requested workspace. Passing a workspace identifier in a request never grants access.

## Activity classification

Every controlled activity is classified as:

```text
GREEN_NON_REGULATED
AMBER_REVIEW_REQUIRED
RED_LICENSED_PARTNER_ONLY
PROHIBITED
```

### Green

Examples:

- readiness assessment;
- document organization;
- cybersecurity assessment;
- remediation tracking;
- data-room preparation;
- source-labeled financial analysis.

### Amber

Examples:

- external-facing transaction materials;
- sensitive counterparty research;
- fee exceptions;
- risk acceptance;
- material AI output intended for external use.

Amber activities require recorded human and compliance review.

### Red

Examples:

- securities investor outreach;
- investment recommendation;
- negotiation of securities terms;
- reception or transmission of securities orders.

Red activities require an eligible licensed partner, compliance approval, and a human approval record.

### Prohibited

Examples:

- custody of investor or client funds or securities;
- guaranteed-return claims;
- bypassing KYB or sanctions controls;
- unapproved regulated execution;
- autonomous money movement.

Prohibited activities cannot be approved through the application.

## Opportunity and KYB lifecycle

1. Record an opportunity with consent and privacy versions.
2. Qualify, decline, refer out, or request information.
3. Open a KYB case.
4. Register every beneficial owner and control person.
5. Record entity, sanctions, PEP, adverse-media, litigation, insolvency, regulatory-license, and source-of-funds screenings.
6. A confirmed match automatically creates a critical compliance hold.
7. Verify each beneficial owner independently.
8. Approve KYB only when:
   - no active hold exists;
   - every beneficial owner is verified;
   - current clear entity, sanctions, PEP, adverse-media, and source-of-funds screenings exist.

A weighted readiness score never overrides an unresolved critical finding or active hold.

## Engagement and fees

Every engagement records:

- scope and excluded activities;
- jurisdictions;
- no-custody acceptance;
- no-guaranteed-funding or return acceptance;
- licensed-partner requirement;
- status and effective dates;
- fees and milestones.

Allowed fee types include fixed, milestone, hourly, retainer, subscription, implementation, and security-monitoring fees.

`TRANSACTION_BASED_FEE` exists as a restricted schema value but the command API returns:

```text
TRANSACTION_BASED_FEES_NOT_ACTIVATED
```

It remains disabled until a jurisdiction-specific arrangement is approved by securities counsel, the licensed intermediary, compliance, and the production owner.

## Readiness methodology

Weights:

| Workstream | Weight |
|---|---:|
| Corporate | 15% |
| Financial | 20% |
| Commercial | 10% |
| Management | 10% |
| Cybersecurity | 15% |
| Compliance | 15% |
| Transaction | 10% |
| Data room | 5% |

Decision logic:

- unresolved critical finding: `BLOCKED`;
- missing workstream: `IN_PROGRESS`;
- 80–100: `READY`;
- 65–79.99: `CONDITIONALLY_READY`;
- below 65: `REMEDIATION_REQUIRED`.

Every workstream records evidence quality, reviewer confidence, critical findings, and open actions.

## Committee approval

Committee packages are versioned and hashed. The package submitter cannot vote on the same package.

Approval decisions require two matching votes for:

- `APPROVED_FOR_PARTNER_REVIEW`;
- `APPROVED_WITH_CONDITIONS`.

A rejection, remediation return, or counsel escalation may be finalized immediately and remains auditable.

## Approval object binding

High-impact approvals use `ApprovalRequest` and `ApprovalDecision`.

An approval is bound to:

- workspace;
- action;
- entity type and identifier;
- canonical SHA-256 object hash;
- required role;
- expiration;
- independent decision.

The requester cannot approve their own request. Changing any approved field changes the object hash and invalidates the earlier approval.

Approval actions include:

```text
COMMITTEE_RELEASE
PARTNER_ROUTING
CONTROLLED_OUTREACH
TRANSACTION_BASED_FEE
EXTERNAL_COMMUNICATION
DOCUMENT_RELEASE
DATA_ROOM_ACCESS
CLOSING_AUTHORIZATION
CRITICAL_RISK_ACCEPTANCE
HIGH_IMPACT_AI_ACTION
```

## Licensed partner routing

A partner must be:

- `ACTIVE`;
- verified with evidence;
- authorized for the jurisdiction and instrument;
- within minimum and maximum transaction size;
- covered by a current agreement and license;
- conflict-cleared.

Routing requires an immutable `PARTNER_ROUTING` approval. The partner then accepts, declines, or requests additional diligence through the role-separated lifecycle API.

GEM users cannot mark a partner accepted merely by changing a matter status.

## Counterparty universe and outreach

Target entries begin as `RESEARCH_ONLY`.

Before outreach, the system requires:

- an active licensed partner;
- a target-specific approved message hash;
- approved sender and recipient;
- jurisdiction and eligibility evidence;
- an approved material version;
- immutable `CONTROLLED_OUTREACH` approval.

Only the licensed partner or compliance authority may progress outreach status. The platform records status and evidence; it does not autonomously send securities solicitations.

## Data rooms and documents

Documents are registered by controlled storage reference and SHA-256 checksum. The database does not store raw identity-document contents or provider credentials.

Each document supports:

- category and confidentiality level;
- version history;
- checksum uniqueness;
- redaction state;
- effective and expiration dates;
- download control;
- watermark requirement;
- legal hold;
- immutable approval and audit history.

Document release and data-room access require hash-bound approvals. Access expires and can be revoked.

## Diligence

Questions and responses are versioned. Approved or closed diligence requires an evidenced response. Prior responses are not overwritten.

Status values include internal review, client response, analyst review, follow-up, approval, closure, and escalation.

## Closing

The generic command API does not authorize closing. It returns:

```text
DEDICATED_CLOSING_AUTHORIZATION_REQUIRED
```

The dedicated closing endpoint derives gates from stored evidence:

- latest approved KYB case;
- no active KYB hold;
- current clear sanctions screening;
- verified beneficial owners;
- released documents with current versions and no legal hold;
- accepted mandate with an active partner;
- completed, verified, or counsel-waived closing conditions;
- counsel and fee evidence;
- verified external funds flow;
- signatory evidence;
- no GEM custody;
- assigned post-close owners;
- an independent, object-bound closing approval.

Only then may the closing become `READY_TO_CLOSE`. Completion requires a second lifecycle action and the matching approval record.

## Post-close revenue conversion

Service contracts support:

- cybersecurity monitoring;
- compliance monitoring and certification;
- board and investor reporting;
- use-of-proceeds monitoring;
- vendor risk;
- real-estate project monitoring;
- post-close implementation.

Revenue events distinguish planned, contracted, invoiced, collected, recognized, and reversed amounts. Dashboard totals include only invoiced, collected, or recognized events.

No Stripe charge, bank transfer, or client-money routing occurs in this module.

## Governed AI agents

Every agent defaults to:

```text
READ_ONLY
HUMAN_APPROVAL_REQUIRED
LICENSED_PARTNER_REQUIRED
moneyMovementEnabled = false
custodyEnabled = false
criticalComplianceHumanOnly = true
```

High-impact amber or red runs cannot be recorded as completed without a current approval. Prohibited runs must be recorded as `BLOCKED`.

## Idempotency

Every command requires an idempotency key. The system stores the request hash and response for 24 hours.

- same key and same request: replay the stored response;
- same key and changed request: reject with `IDEMPOTENCY_KEY_REUSED`.

## Verification

Repository verification includes:

```text
pnpm run db:schema:check
pnpm run capital-readiness:check
pnpm run claims:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

The dependency-free capital check confirms required models, commands, lifecycle handlers, security defaults, secret exclusions, closing hardening, and the transaction-fee lock before the ordinary compiler and test suite.

## Production prohibition

This module must remain in draft and must not be migrated into production until:

- Prisma validation and generation pass;
- a formal migration is generated and reviewed;
- the migration applies and recovers in a disposable PostgreSQL environment;
- lint, typecheck, tests, and production build pass;
- a green canonical Vercel preview exists;
- counsel and licensed-partner activation requirements are satisfied where applicable;
- the production owner explicitly approves the migration and feature activation.
