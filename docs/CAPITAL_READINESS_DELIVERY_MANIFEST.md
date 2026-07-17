# Capital Readiness Delivery Manifest

## Canonical tracking

- Issue: #220
- Pull request: #221
- Branch: `feat/capital-readiness-transaction-command-center`
- Command Center path: `/app/command-center/capital-readiness`

## Delivered software

### Policy and workflow

- deny-by-default activity policy;
- green, amber, red, and prohibited classification;
- no-custody and no-guaranteed-return enforcement;
- compliance, legal, security, payment, and document-integrity holds;
- weighted readiness with critical-block override;
- controlled matter state machine;
- partner eligibility and closing gates;
- post-close service recommendations.

### Persistence

- 37 additive capital-domain Prisma models;
- workspace tenancy and indexes;
- immutable approval and audit reuse;
- idempotent command responses;
- controlled document references and checksums;
- no plaintext secrets, bank credentials, payment-card data, or raw identity-document contents.

### APIs

- workspaces;
- snapshot;
- opportunities;
- policy evaluation;
- readiness calculation;
- 34 controlled commands;
- 10 role-separated lifecycle actions;
- approval requests and decisions;
- matter transitions;
- evidence-derived closing authorization.

### User interface

- authenticated capital-readiness Command Center;
- accessible workspace selector;
- live metrics and blockers;
- opportunity register and creation form;
- controlled pipeline;
- readiness methodology;
- explicit regulated-execution and no-custody posture.

### Governance

- canonical SHA-256 object approval binding;
- requester/approver separation of duties;
- approval expiry and stale-version rejection;
- partner-role separation;
- evidence-required KYB, diligence, document, outreach, and closing actions;
- transaction-based fees disabled pending external activation;
- generic closing authorization disabled in favor of the dedicated endpoint;
- governed AI read-only defaults and high-impact approval gates.

### Quality and release assets

- policy, workflow, and contract tests;
- dependency-free capital contract verification;
- composable Prisma promotion script;
- deterministic review-migration generator;
- OpenAPI 3.1 contract;
- operator handbook;
- controlled production activation runbook;
- documentation index;
- dedicated diagnostic workflow.

## Verification posture

The implementation must remain draft until all of these pass:

```text
Prisma format and validate
Prisma client generation
Review migration generation and inspection
Disposable PostgreSQL apply and recovery test
Capital contract verification
Public-claims verification
ESLint
TypeScript
Vitest
Next.js production build
Canonical Vercel preview
```

A red or unavailable verification system is not treated as success.

## External activation dependencies

These cannot be created by application code:

- production PostgreSQL credentials and migration authorization;
- securities-counsel determination;
- licensed-partner agreement, licenses, users, and acceptance;
- KYB, sanctions, adverse-media, signature, storage, email, accounting, or other provider credentials;
- responsible-officer approvals and signatures;
- regulated outreach or transaction execution;
- transaction-based compensation activation;
- custody or money movement, which remain prohibited or disabled.
