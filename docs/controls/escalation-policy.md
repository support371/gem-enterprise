# Escalation Policy

**Version:** 1.0
**Date:** 2026-03-18
**Owner:** Compliance & Legal
**Dossier ref:** Master Dossier §5, §7, §14; ADR-003

---

## Purpose

This policy defines when automated or AI-assisted workflows must stop and transfer control to a verified human. It is non-negotiable and applies to all service lines.

---

## 1. Mandatory escalation triggers

The following conditions must always trigger human escalation. No automation may bypass these gates.

### 1.1 AI-assisted interactions

| Trigger | Action | SLA |
|---|---|---|
| Response classified as `LEGAL_ADVICE` | Stop response, create case, notify legal advisor | 4h |
| Response classified as `FINANCIAL_ADVICE` | Stop response, create case, notify financial advisor | 4h |
| Response classified as `SECURITY_CLOSURE` | Stop response, create case, escalate to SOC lead | 1h |
| Response classified as `IDENTITY_DETERMINATION` | Stop response, suspend session, notify compliance | 1h |
| Confidence score below threshold | Append disclaimer, offer advisor callback | Best effort |
| User explicitly requests a human | Immediately offer advisor handoff | 15 min |

### 1.2 Identity and access

| Trigger | Action | SLA |
|---|---|---|
| PEP (politically exposed person) match on KYC | Flag case, assign to compliance officer, hold onboarding | 24h |
| Document mismatch during identity verification | Suspend KYC, notify compliance, request re-submission | 48h |
| Login from unrecognized country or device | Send verification email, require re-authentication | Immediate |
| Admin or super_admin role requested | Manual approval from existing super_admin | 24h |

### 1.3 Financial controls

| Trigger | Action | SLA |
|---|---|---|
| Payment dispute or chargeback received | Freeze account action, notify finance, create approval case | 4h |
| Refund request > $1,000 | Require finance officer approval (APR case) | 24h |
| Allocation change > 5% of portfolio | Require compliance officer approval | 24h |
| Subscription cancellation for regulated client | Require advisor confirmation before execution | 24h |

### 1.4 Security incidents

| Trigger | Action | SLA |
|---|---|---|
| CyberShield alert severity ≥ HIGH | Create case, assign SOC lead, hold AI auto-close | 1h |
| Incident open > 24 hours without resolution | Escalate to security team lead, send notification | Immediate |
| Evidence integrity check failure | Suspend related workflows, notify compliance | 4h |

---

## 2. Escalation path by service domain

| Domain | Primary escalation target | Secondary |
|---|---|---|
| Cybersecurity | SOC Lead | Security Team Lead |
| Financial | Financial Advisor | Finance Officer |
| Real Estate | ATR Advisor | ATR Operations |
| Legal | Legal Intake | External Counsel (per engagement) |
| Compliance | Compliance Officer | DPO |
| Platform / access | Super Admin | Engineering Lead |

---

## 3. What the escalation record must contain

Every escalation creates a case (`GEM-XXXX`) containing:
- `escalation_reason` (the trigger that fired)
- `escalation_domain` (cyber / financial / realty / legal / governance)
- `escalating_actor` (user ID or `system`)
- `assigned_reviewer` (human ID or queue)
- `triggered_at` timestamp
- `sla_deadline` timestamp
- `resolution_at` (when resolved)
- `resolution_notes`
- `evidence_ids[]` (attached evidence items)

This record is an audit-grade evidence item of class `decision`.

---

## 4. Human review gates that cannot be delegated (dossier §14)

The following decisions must have a named human approver recorded before execution:

1. Final legal wording and regulated customer-facing claims
2. Security architecture sign-off
3. Penetration test remediation acceptance
4. Financial refund / settlement governance
5. Compliance interpretation for a novel regulatory question
6. Production release authorization
7. Policy decision on AI disclosure or escalation threshold changes
8. Any deletion of audit or evidence records

---

## 5. Review cycle

This policy is reviewed every 6 months or after any material incident.
Next review: 2026-09-18.
Owner sign-off required before policy takes effect in production.
