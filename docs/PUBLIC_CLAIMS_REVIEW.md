# Public Claims Review

This report is generated from `src/lib/publicClaims.ts`. It contains governance metadata and approved public wording only. Confidential evidence must remain in an access-controlled evidence vault and must not be committed to this repository.

Total registered claims: **25**

## Status summary

### Risk

| Value | Count |
|---|---:|
| critical | 11 |
| high | 11 |
| medium | 3 |

### Evidence status

| Value | Count |
|---|---:|
| blocked | 4 |
| conditional | 4 |
| unverified | 14 |
| verified | 3 |

### Publication action

| Value | Count |
|---|---:|
| allow | 3 |
| block | 17 |
| qualify | 5 |

## Registered claims

| Claim ID | Route | Risk | Evidence status | Action | Owner | Review by | Approved wording |
|---|---|---|---|---|---|---|---|
| HUB-001 | /hub | critical | blocked | block | Product Operations | 2026-07-31 | Capabilities are available only when configured in an approved client workspace and confirmed in the signed scope. |
| HUB-002 | /hub | critical | unverified | block | Security Operations | 2026-07-31 | Coverage hours and regional support are defined in the signed service scope. |
| HUB-003 | /hub | critical | unverified | block | Security Operations | 2026-07-31 | Response and acknowledgement targets are documented in the applicable service agreement. |
| HUB-004 | /hub | high | unverified | block | Security Operations | 2026-07-31 | Approved playbooks may be coordinated after scope, validation, and human authorization. |
| HUB-005 | /hub | high | unverified | block | People Operations | 2026-07-31 | Staffing qualifications are confirmed for each approved engagement. |
| HUB-006 | /hub | high | conditional | qualify | Client Operations | 2026-07-31 | Incident escalation channels and operating hours are defined by engagement. |
| HUB-007 | /hub | critical | unverified | block | Platform Security | 2026-07-31 | Protected messaging is available only after the relevant access, transport, storage, and retention controls are activated and verified. |
| HUB-008 | /hub | high | unverified | block | Client Operations | 2026-07-31 | Support response targets are defined by the applicable service agreement. |
| HUB-009 | /hub | high | unverified | block | Client Operations | 2026-07-31 | Acknowledgement targets are defined by the applicable service agreement. |
| COMPANY-001 | /company | critical | blocked | block | Executive Office | 2026-07-31 | Public leadership profiles are published only after identity, title, biography, credential, and consent verification. |
| COMPANY-002 | /company | critical | blocked | block | People Operations | 2026-07-31 | Team composition and staffing are confirmed for each approved engagement. |
| COMPANY-003 | /company | critical | unverified | block | Security Operations | 2026-07-31 | Coverage is defined by the approved engagement, staffing plan, and service agreement. |
| COMPANY-004 | /company | critical | unverified | block | Real Estate Operations | 2026-07-31 | Property-record monitoring depends on verified jurisdictional sources, provider capability, authorization, and an approved service scope. |
| COMPANY-005 | /company | critical | unverified | block | Executive Office | 2026-07-31 | Association, provider, and partner relationships are described publicly only when the relationship and wording are verified and authorized. |
| COMPANY-006 | /company | high | unverified | qualify | Compliance | 2026-07-31 | Commercial, referral, reseller, affiliate, and provider relationships are disclosed where they are relevant to an approved recommendation or engagement. |
| COMPANY-007 | /company | critical | conditional | qualify | Compliance | 2026-07-31 | Services are structured subject to applicable law, jurisdiction, eligibility, and engagement-specific compliance requirements; no licence or regulatory status is implied unless separately identified and evidenced. |
| REQUEST-001 | /request-access | high | blocked | block | Community Operations | 2026-07-31 | Submit a non-binding request for qualification and human review. |
| REQUEST-002 | /request-access | critical | unverified | block | Privacy | 2026-07-31 | Personal information is handled according to the published privacy notice, approved access controls, retention rules, and applicable service providers. |
| REQUEST-003 | /request-access | high | unverified | block | Client Operations | 2026-07-31 | Review timing depends on request type, evidence, jurisdiction, staffing, and required checks. |
| REQUEST-004 | /request-access | high | unverified | block | Client Operations | 2026-07-31 | Each submission is recorded for review; response timing and outcome are not guaranteed by the public form. |
| GETSTARTED-001 | /get-started | high | conditional | qualify | Client Operations | 2026-07-31 | Applicable verification, review, and portal steps depend on applicant type, configured controls, provider availability, and human approval. |
| TRUST-001 | /trust-center | high | conditional | qualify | Platform Security | 2026-07-31 | Control statements describe implemented or designed controls and must be supported by current code, configuration, tests, and operational evidence; they do not imply certification. |
| STORE-001 | /store | medium | verified | allow | Commerce Operations | 2026-08-31 | Catalogue entries are proposed and require written confirmation before acceptance or activation. |
| SERVICES-001 | /services | medium | verified | allow | Service Operations | 2026-08-31 | Services require confirmed scope, eligibility, staffing, provider, jurisdiction, security, and contractual requirements. |
| COMMUNITY-001 | /community-hub | medium | verified | allow | Community Operations | 2026-08-31 | Fictional interface preview with no live production network represented. |

## Operating rules

1. `blocked`, `unverified`, `expired`, or `rejected` claims may not be published as active facts.
2. `conditional` claims must display their approved conditions and must not imply universal availability.
3. `verified` means the registered wording and its repository or private evidence were reviewed; it does not create a permanent certification or guarantee.
4. Confidential evidence, identity records, contracts, credentials, client data, and provider secrets remain outside the public repository.
5. Removing a controlled rewrite requires evidence review, updated registry entries, passing tests, a green preview, and human approval.

