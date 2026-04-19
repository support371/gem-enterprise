# ADR-004 — Evidence and Audit Logging

**Date:** 2026-03-18
**Status:** Accepted
**Deciders:** Compliance officer, engineering lead
**Dossier ref:** Master Dossier §8 (evidence pack), §5 (evidence generation), Risk R5

## Context

Master Dossier §8 requires evidence records across seven classes: governance, interaction, decision, security, financial, legal/regulatory, and quality. Every material action must be traceable, retained, and exportable. Compliance is not proven by architecture alone — it is proven by operational evidence.

## Decision

### Audit log pattern

Every material server-side action calls `emitAuditLog(entry)` from `src/lib/audit.ts`:

```typescript
interface AuditEntry {
  actor:       string        // user ID or 'system'
  action:      string        // e.g. 'case.created', 'kyc.approved'
  resource:    string        // e.g. 'case:GEM-2051'
  outcome:     'success' | 'failure' | 'escalated'
  metadata?:   Record<string, unknown>
  requestId?:  string
  ip?:         string
  timestamp:   string        // ISO 8601
}
```

Audit logs are:
- Written to the database (`AuditLog` table — append-only, no UPDATE/DELETE).
- Streamed to the observability stack (Vercel logs / App Insights in production).
- Retained for the period defined by the evidence class (see below).

### Evidence classes and retention

| Class | Examples | Minimum retention |
|---|---|---|
| `governance` | Policy approvals, role assignments, ADRs | 10 years |
| `interaction` | Session logs, consent receipts, chat transcript pointers | 7 years |
| `decision` | KYC approval/rejection, AI run outcomes, case closures | 7 years |
| `security` | Access logs, MFA events, incident records | 5 years |
| `financial` | Invoice, payment, refund, settlement | 10 years |
| `legal` | Disclosures, engagement records, jurisdiction checks | 10 years |
| `quality` | Test results, UAT signoff, post-incident reviews | 5 years |

### Evidence factory

`src/lib/evidence.ts` exposes `createEvidenceItem(data)` which:
1. Writes an `EvidenceItem` to the database.
2. Stamps a retention label and `retainUntil` date.
3. Returns the `evidenceId` for the caller to attach to the parent record (case, run, payment).

### Export

`GET /api/evidence/export` (admin only) generates a structured pack for audit or customer assurance, containing all evidence items for a given control, time range, or case ID.

### Immutability

`AuditLog` and `EvidenceItem` tables have no `UPDATE` or `DELETE` API endpoints. Hard delete requires `super_admin` + compliance officer dual approval, recorded in a `DeletionRequest` record.

## Consequences

- Every API route handler that mutates state must call `emitAuditLog()` before returning.
- `EvidenceItem` records must carry `retentionYears` and `retainUntil`.
- No evidence record may be deleted without a `DeletionRequest` record referencing both approvers.
