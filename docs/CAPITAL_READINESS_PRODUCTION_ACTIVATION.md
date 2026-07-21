# Capital Readiness Controlled Production Activation

## Current posture

```text
APPLICATION_IMPLEMENTATION = DRAFT_COMPLETE
PRODUCTION_DATABASE_MIGRATION = BLOCKED
REGULATED_EXECUTION = BLOCKED
TRANSACTION_BASED_FEES = BLOCKED
CUSTODY = PROHIBITED
MONEY_MOVEMENT = DISABLED
AUTONOMOUS_EXTERNAL_OUTREACH = DISABLED
```

This document is an activation gate, not authorization to migrate or activate production.

## Required approvals

### Platform owner

Must approve:

- the reviewed migration SHA;
- the target database and backup point;
- the deployment commit;
- feature-flag activation;
- rollback or forward-recovery plan;
- production monitoring ownership.

### Security

Must confirm:

- no secrets, access tokens, refresh tokens, passwords, private keys, bank credentials, card data, or raw identity documents are introduced;
- workspace isolation and emergency locks pass;
- privileged actions produce audit events;
- signed URLs and controlled storage references are used for documents;
- alerting and incident ownership exist.

### Compliance

Must confirm:

- activity classifications and prohibited actions match approved policy;
- transaction-based fees remain disabled unless separately approved;
- KYB, beneficial-owner, sanctions, PEP, adverse-media, source-of-funds, and conflict controls are operational;
- licensed-partner routing and outreach approvals are correctly separated;
- retention and legal-hold requirements are defined.

### Securities counsel

Required before any regulated execution or transaction-based compensation. Counsel must provide a written jurisdiction-specific determination covering:

- GEM's permitted role;
- licensed intermediary responsibilities;
- communications and solicitation boundaries;
- compensation structure;
- disclosure and recordkeeping obligations;
- investor eligibility and suitability responsibilities;
- cross-border restrictions.

### Licensed partner

Required before any red-classified activity. The partner must provide:

- regulatory entity name and reference;
- regulator and license evidence;
- jurisdiction and instrument permissions;
- agreement and insurance dates;
- compliance and conflict contacts;
- accepted process and communication protocol;
- approved compensation and responsibility matrix.

## Disposable database validation

Use a non-production PostgreSQL database containing a representative copy of the existing schema without production credentials or sensitive records.

### Generate

```bash
pnpm install --frozen-lockfile
pnpm run db:schema:promote
pnpm exec prisma format
pnpm exec prisma validate
pnpm exec prisma generate
pnpm exec prisma migrate dev --name capital_readiness_transaction_command_center --create-only
```

### Inspect

Review the generated SQL for:

- destructive table or column operations;
- alteration of existing TokMetric or authentication tables;
- unexpected enum replacement;
- missing foreign keys;
- wrong table maps;
- cascade deletes on evidence-bearing records;
- missing workspace indexes;
- duplicate names or schema drift;
- secret-bearing columns.

### Apply

```bash
pnpm exec prisma migrate deploy
pnpm run capital-readiness:check
pnpm run claims:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

### Functional verification

Create disposable records and prove:

1. Cross-workspace access is rejected.
2. Emergency lock returns HTTP 423.
3. Opportunity creation creates an audit event.
4. A confirmed sanctions match creates a compliance hold.
5. KYB approval fails without verified owners and clear required screenings.
6. A critical finding forces readiness `BLOCKED`.
7. The committee submitter cannot vote on their own package.
8. Partner routing fails for expired, unauthorized, conflicted, or out-of-range partners.
9. Research-only target entries cannot progress to outreach without approval.
10. Document release fails without matching object-bound approval.
11. Data-room access expires and is auditable.
12. Closing authorization fails without every server-derived gate.
13. Transaction-based fees return `TRANSACTION_BASED_FEES_NOT_ACTIVATED`.
14. Custody and guaranteed-return actions remain prohibited.
15. Amber and red agent runs require approval; prohibited runs remain blocked.
16. Reusing an idempotency key with changed payload returns a conflict.

### Recovery verification

Because the new tables contain evidence, audit, compliance, and transaction history, destructive down migrations are not the default rollback.

Validate one of these recovery strategies:

- feature flags off while retaining the additive tables;
- reviewed forward-recovery migration;
- compatibility migration correcting a column, index, or enum;
- restore from the disposable pre-migration backup.

Do not treat dropping evidence-bearing tables as routine rollback.

## Preview deployment gate

A canonical Vercel preview must show:

- successful schema promotion;
- Prisma validation and generation;
- successful static capital contract verification;
- zero lint warnings;
- successful TypeScript validation;
- all tests passing;
- successful Next.js production build;
- authenticated page access;
- `configuration_required` rather than demo data when database tables are absent;
- no secrets in build or runtime logs.

## Production migration gate

Before running any production migration:

```text
[ ] Reviewed generated SQL is committed
[ ] Disposable apply passed
[ ] Recovery test passed
[ ] Repository verification passed
[ ] Canonical preview is green
[ ] Database backup point is recorded
[ ] Migration operator is named
[ ] Monitoring owner is named
[ ] Maintenance window is approved
[ ] Production owner approval is recorded
```

## Feature activation order

1. Database tables and indexes only.
2. Read-only snapshot and workspace directory.
3. Opportunity intake.
4. KYB and hold controls.
5. Engagement and readiness workflows.
6. Committee workflow.
7. Partner registry in verification-only mode.
8. Data rooms and diligence.
9. Post-close service contracts and revenue records.
10. Governed agents in read-only mode.
11. Partner-controlled outreach only after partner and counsel activation.

Transaction-based compensation is not part of ordinary platform activation.

## Provider credentials

Credentials must be configured in the approved secret manager or hosting environment. They must never be committed or stored in capital-domain tables.

Potential providers include:

- KYB/KYC and beneficial-ownership verification;
- sanctions, PEP, and adverse-media screening;
- malware scanning and secure object storage;
- electronic signature;
- accounting and invoicing;
- email and calendar;
- licensed-partner systems.

Every connector must use the existing `Connector` and `ConnectorCredentialReference` architecture.

## Post-activation monitoring

Monitor:

- authentication and workspace denials;
- emergency-lock activity;
- active holds;
- critical findings;
- approval expiry and stale-object failures;
- partner license and agreement expiry;
- unauthorized outreach attempts;
- document release and access events;
- closing gate failures;
- idempotency conflicts;
- agent runs waiting for approval or blocked;
- API 4xx and 5xx rates;
- database latency and migration drift.

## Automatic stop conditions

Immediately disable the affected feature when:

- workspace isolation fails;
- an unapproved red action executes;
- a custody or money-movement path becomes possible;
- an approval can be self-decided;
- document access bypasses confidentiality controls;
- partner authorization expires;
- a sanctions or critical compliance hold is bypassed;
- audit event creation fails for a material write;
- a migration causes destructive or unexplained schema drift.
