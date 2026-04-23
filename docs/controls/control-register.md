# Control Register

**Version:** 1.0
**Date:** 2026-03-18
**Owner:** Compliance Officer
**Dossier ref:** Master Dossier §8, §9

This register is the source of truth for platform controls. It is reflected in the live Compliance Evidence page at `/app/app/compliance/`.

---

## Control domains

- **GOV** — Governance
- **CYB** — Cybersecurity
- **FIN** — Financial
- **REA** — Real Estate
- **LEG** — Legal Services

---

## Register

| ID | Name | Domain | Owner | Status | Next review | Evidence required |
|---|---|---|---|---|---|---|
| C-001 | Identity & Access Management | GOV | Security Team | Compliant | 2026-08-15 | MFA enrollment report, role matrix |
| C-002 | Data Encryption at Rest & Transit | CYB | Infrastructure | Compliant | 2026-07-20 | Encryption audit cert, TLS config proof |
| C-003 | KYC / Identity Verification | FIN | Compliance Officer | In Review | 2026-06-01 | KYC policy doc, sample approval records |
| C-004 | AI Interaction Disclosure | GOV | Legal & Compliance | Compliant | 2026-08-28 | Disclosure notice text, consent log sample |
| C-005 | Incident Response Plan | CYB | Security Team | Compliant | 2026-07-10 | IR playbook, tabletop exercise results |
| C-006 | Property Transaction Records | REA | ATR Operations | In Review | 2026-05-10 | Consent log, document version history |
| C-007 | Payment Transaction Logging | FIN | Finance | Compliant | 2026-09-05 | Q1 reconciliation, invoice trail |
| C-008 | Legal Matter Intake Controls | LEG | Legal Services | **Gap** | 2026-04-01 | Attorney review gate evidence, conflict checks |
| C-009 | Data Retention & Deletion | GOV | DPO | Pending | 2026-04-15 | Retention policy doc, deletion workflow |
| C-010 | Audit Log Integrity | CYB | Security Team | Compliant | 2026-09-01 | SIEM alert summary, log completeness test |
| C-011 | Consent Capture & Revocation | GOV | Compliance Officer | Pending | 2026-05-01 | ConsentRecord schema, revocation test |
| C-012 | Vendor Risk Reviews | GOV | Engineering Lead | Pending | 2026-05-01 | DPA copies, data residency confirmations |
| C-013 | Prompt Abuse & Red-Team Testing | CYB | Security Team | Pending | 2026-06-01 | Red-team report, restricted class test results |
| C-014 | Escalation SLA Adherence | GOV | Compliance Officer | Pending | 2026-06-01 | Escalation case closure times, SLA report |

---

## Evidence class mapping

| Class | Controls |
|---|---|
| Governance | C-001, C-004, C-009, C-011, C-012, C-014 |
| Security | C-002, C-005, C-010, C-013 |
| Financial | C-003, C-007 |
| Real Estate | C-006 |
| Legal | C-008 |
| Quality | C-005, C-013, C-014 |

---

## Gap resolution priorities

| Control | Gap | Required action | Deadline |
|---|---|---|---|
| C-008 | No attorney review gate in legal intake flow | Build intake gate with attorney assignment and conflict check screen | 2026-04-01 |
| C-009 | No retention policy enforced in code | Implement `retainUntil` on all evidence items; build deletion workflow | 2026-04-15 |
| C-011 | ConsentRecord table not yet migrated | Add `ConsentRecord` to Prisma schema; wire to AI session and intake flows | 2026-05-01 |
| C-012 | No vendor DPAs on file | Legal to obtain DPAs from OpenAI/Azure, SendGrid, Stripe before production | 2026-05-01 |
| C-013 | No red-team test conducted | Schedule red-team exercise before Sprint 7 production gate | 2026-06-01 |
