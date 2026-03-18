# ADR-005 — Third-Party Integration Strategy

**Date:** 2026-03-18
**Status:** Accepted
**Deciders:** Platform architect, engineering lead
**Dossier ref:** Handoff Pack §5 (integration map), Master Dossier §6 (integration map)

## Context

The platform requires CRM, communications, issue tracking, AI, storage, payments, and analytics integrations. Each carries vendor risk, data-sharing implications, and fallback requirements.

## Decision

### Adapter pattern (mandatory)

Every third-party SDK is wrapped in an adapter module at `src/lib/[vendor]-adapter.ts`. Components and route handlers call only the adapter — never the SDK directly. This means:
- Vendors can be swapped without changing business logic.
- Adapters can return degraded-mode stubs when env vars are missing (no runtime crash).
- Adapters emit `vendor.call` audit events for every outbound call.

### Integration registry

| Adapter | Vendor | Status | Fallback |
|---|---|---|---|
| `src/lib/ai-adapter.ts` | OpenAI / Azure AI Foundry | 🔶 scaffold | Return `null` + escalate to human |
| `src/lib/crm-adapter.ts` | HubSpot | ❌ future | Log to local CRM table |
| `src/lib/comms-adapter.ts` | SendGrid + Twilio | ❌ future | Queue in DB, retry on next run |
| `src/lib/jira-adapter.ts` | Jira REST API | ❌ future | Local `JiraRef` stub table |
| `src/lib/payments-adapter.ts` | Stripe | ❌ future | Block transaction, notify admin |
| `src/lib/storage-adapter.ts` | Azure Blob / S3 | ❌ future | Local `/tmp` with warning log |
| `src/lib/analytics-adapter.ts` | Vercel Analytics / App Insights | 🔶 partial | Noop function |

### Degraded mode

If a required integration is unavailable:
1. Adapter returns a typed `{ ok: false, degraded: true, reason: string }` result.
2. Route handler logs the degraded event to the audit log.
3. User-facing flow shows a graceful fallback message (never a raw error).
4. Ops dashboard shows degraded integration status (already scaffolded in `/app/admin/`).

### Vendor risk

Before any integration goes live in production:
- [ ] Vendor data processing agreement (DPA) signed.
- [ ] Data residency confirmed for jurisdiction requirements.
- [ ] Access credentials stored in Vercel environment secrets (never in code).
- [ ] Webhook endpoints validated with signature verification.
- [ ] Vendor risk review logged as a `governance` evidence item.

## Consequences

- `src/lib/` is the only place where third-party SDK calls are made.
- Every adapter must export `isConfigured(): boolean` so callers can check before calling.
- Adapters are tested with mocked SDK calls — never real API calls in the test suite.
