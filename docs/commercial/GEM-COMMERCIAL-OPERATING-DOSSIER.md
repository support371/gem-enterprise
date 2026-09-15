# GEM Enterprise Commercial Operating Dossier

**Status date:** 2026-09-13  
**Canonical repository:** `support371/gem-enterprise`  
**Canonical public site:** `https://www.gemcybersecurityassist.com`  
**Working branch:** `chatgpt/commercial-operating-system`

## 1. Executive decision

GEM Enterprise should operate one governed commercial lifecycle rather than introducing separate CRM, marketing, support, onboarding, and customer-success databases.

Target lifecycle:

`DISCOVER → ATTRACT → CAPTURE → QUALIFY → PROPOSE → CONVERT → ONBOARD → DELIVER → SUPPORT → SUCCESS → EXPAND → RENEW → REFER → LEARN`

The public website remains the global market front door. The canonical `gem-enterprise` application remains the authoritative operating system. Historical GEM Workspace OS v2.6 source-sync/handoff artifacts are reconciliation inputs: useful functionality should be preserved or absorbed, but they are not authority for a second customer database.

## 2. What already exists and should be preserved

| Capability | Existing GEM implementation | Decision |
|---|---|---|
| Public acquisition | Main site, services, Resources, Business Review, Request Access | KEEP / improve claims and conversion |
| Founding offer | `$199` Business Security & Operations Review | KEEP / market-validate |
| First outreach | First-20 Outreach Workbench | KEEP / enrich with research; no auto-send |
| Lead capture | Enterprise Intake Governance | KEEP as pre-client record |
| Sales pipeline | Admin Market Pipeline with source/campaign attribution | KEEP as canonical acquisition pipeline |
| Proposal / conversion | Governed proposal and payment reconciliation | KEEP; human gate |
| Client onboarding | Organization → Workspace → Project conversion | KEEP; human gate |
| Delivery | Workspace/project environments, requests, meetings, documents | KEEP |
| Support | Tickets, governed AI sessions, human escalation | KEEP |
| Email | Admin campaigns + branded GEM renderer + SMTP/Nodemailer | EXTEND with permission/suppression controls |
| Social | Social Media Command Center + Content Orchestrator + governed queue | KEEP; finish external provider activation rather than replace |
| TikTok | TokMetric-owned TikTok integration | KEEP; never create a second TikTok connector |
| Claims | `publicClaims` evidence registry | KEEP; expand the routes under review |
| Audit | Canonical audit log | KEEP; all new commercial lifecycle writes emit audit evidence |
| Analytics | Existing dashboard surfaces + available Amplitude connection | EXTEND around one commercial event contract |

## 3. Verified lifecycle gaps on main

The acquisition pipeline reaches conversion/onboarding, but a dedicated post-conversion customer-lifecycle layer was not verified on `main`.

This branch adds a first governed implementation for:

- customer health;
- outcome status;
- satisfaction score;
- review dates;
- follow-up actions;
- expansion planning;
- renewal planning;
- referral planning;
- win-back planning.

These records attach to the existing Workspace / OrganizationProject boundary and do **not** create a second customer identity.

## 4. New post-conversion foundation on this branch

### Storage

- `customer_success_profiles`
- `customer_success_actions`

### API

- `/api/admin/customer-success`

### Operator UI

- `/app/admin/customer-success`
- `/app/admin/market/operations`

### Governance

All writes require an authenticated admin and emit audit records. An expansion, renewal, referral, or win-back action is a planning object only. It cannot by itself:

- activate a service;
- charge a customer;
- create an entitlement;
- send a campaign;
- publish a testimonial;
- bypass qualification/proposal/approval/payment gates.

## 5. Communication-governance gap and branch implementation

The pre-existing campaign route selected every active, verified user and did not apply a verified marketing permission/suppression ledger. It could also report a campaign as sent when SMTP delivery was not configured.

This branch adds:

- `communication_preferences`;
- append-only `communication_preference_events` with database-enforced mutation protection;
- admin permission-review API;
- `/app/admin/communications` operator surface;
- signed public unsubscribe tokens;
- `/unsubscribe` confirmation UI;
- one-click `List-Unsubscribe` support;
- fail-closed marketing campaign delivery;
- SMTP verification before campaign status changes;
- immediate permission recheck before each recipient delivery;
- ambiguous SMTP outcomes preserved as `SENDING` for reconciliation rather than automatic retry;
- actual delivered-recipient counts;
- audit evidence.

A user being active and email-verified is **not sufficient** for a GEM marketing campaign. The destination must have an `ALLOWED` `EMAIL / MARKETING` record at the moment of delivery.

Recipient unsubscribe always creates a `BLOCKED` marketing-email preference.

## 6. Canonical analytics contract

`src/lib/analytics/commercialEvents.ts` defines one event vocabulary:

1. `commercial_visit`
2. `business_review_viewed`
3. `request_access_started`
4. `intake_submitted`
5. `lead_qualified`
6. `proposal_created`
7. `proposal_approved`
8. `payment_reconciled`
9. `client_onboarding_started`
10. `workspace_activated`
11. `delivery_started`
12. `delivery_completed`
13. `customer_review_recorded`
14. `expansion_opportunity_created`
15. `renewal_due`
16. `referral_consent_recorded`

This is the contract to use for Amplitude/GA4/other approved analytics. Do not create provider-specific funnel names that fragment the operating picture.

Sensitive fields such as passwords, access tokens, secrets, full card data, government IDs, raw KYC files, and private support transcripts are explicitly prohibited analytics properties.

## 7. Current market case for the founding offer

The current offer should remain a bounded diagnostic/priority engagement rather than be repositioned as a low-cost vulnerability scanner.

### Relevant 2026 threat evidence

- Verizon 2026 DBIR reports that stolen credentials and vulnerability exploitation remain prominent for SMB breaches and reports that, among ransomware cases with known organization size, about 96% of ransomware victims in its dataset were SMBs.
- Verizon 2026 SMB material reports vulnerability exploitation at 31% of initial access, third-party involvement at 48% of breaches, and potentially material revenue impact for smaller organizations.
- NIST publishes a CSF 2.0 Small Business Quick Start Guide specifically to help smaller organizations apply cybersecurity risk-management practices.

Primary references:

- https://www.verizon.com/business/resources/reports/dbir/
- https://www.nist.gov/publications/nist-cybersecurity-framework-20-small-business-quick-start-guide

Do not translate these sources into claims that a prospect is compromised.

## 8. Offer / competitor positioning

Current market alternatives range from free public-sector hygiene services for eligible organizations, through low-cost scanner snapshots, to several-hundred-dollar SMB checkups and multi-thousand-dollar vCISO retainers.

| Alternative | Public positioning / price observed | Implication for GEM |
|---|---|---|
| CISA Cyber Hygiene | Free scanning / testing for eligible critical-infrastructure organizations | GEM must not compete on “free scanning”; emphasize broader business-operational review and client follow-through |
| CyberBit Security Assessment | Public-facing domain/email snapshot advertised at $199 | A same-price scanner exists; GEM must clearly explain its broader identity/access/operations/incident-readiness scope |
| CyberSecurityPA SME Cyber Checkup | Scanner-based checkup advertised at $199 | Do not make GEM look like another automated scanner |
| VISO Group | SMB checkup around $495; deeper assessment around $7,500 | GEM’s $199 entry offer can reduce first-step friction if scope remains bounded |
| Polaris Security Group | Small-business assessment around $775 | Similar implication: lower-friction entry, with separately scoped next work |
| vCISO / managed advisory market | Common public starting points in the low-thousands per month | Expansion should be separately qualified, not silently bundled into the $199 review |

References collected during the 2026-09-13 research pass:

- https://www.cisa.gov/resources-tools/services/cisa-vulnerability-scanning
- https://www.cyberbitsecurity.com/cybersecurity-assessment
- https://cybersecuritypa.com/pricing/sme-cyber-security-checkup/
- https://viso-group.com/cybersecurity-solutions/small-business-cybersecurity-checkup/
- https://polarissecuritygroup.com/cybersecurity-assessment

Prices and offers are time-sensitive. Recheck before publishing comparative copy.

## 9. ICP priority

### Tier 1 — Professional-services firms with 2–10 people

Examples: legal search, CPA/advisory, legal services, finance/accounting recruitment.

Why first:

- owner/partner decision makers are comparatively reachable;
- high reliance on email, cloud documents, websites, candidate/client information and third-party workflows;
- the founding team-size scope fits;
- a short prioritized review is easier to understand than a broad managed-security contract.

### Tier 2 — Small real-estate / property / mortgage operators

Why:

- operational reliance on client communications, transaction workflows, listings, documents, vendor relationships and account access;
- strong fit with GEM’s property-risk and business-security positioning;
- meaningful path from review to separately scoped controls/remediation.

### Tier 3 — Small logistics / freight / brokerage operators

Why:

- time-sensitive operations and third-party dependencies;
- reliance on documents, email, carrier/customer workflows and external platforms;
- outage/account-access/process risk has clear operational consequences.

## 10. First-20 research cohort

**Important:** these are research seeds, not approved customers, not evidence of a vulnerability, and not authorization to contact. Before outreach, verify the company, current size, public trigger, correct decision-maker role, contact source, jurisdiction, and fit with the current offer.

| # | Company | Segment | Observed team estimate | Public site | Fit hypothesis |
|---:|---|---|---:|---|---|
| 1 | Lease & LaBau, Inc. | Legal recruiting | 8 | leaselabau.com | Candidate/client relationship workflows; website + professional-channel continuity |
| 2 | Lighthouse Legal Search | Legal recruiting | 7 | lhouselegal.com | Global legal-recruiting relationships and data-dependent placement workflow |
| 3 | Kehlenbrink, Lawrence & Pauckner, CPAs | Accounting | 9 | klpcpa.com | Long-term client relationships and professional financial-data workflows |
| 4 | Blacklock Advisory | Accounting / professional recruiting | 5 | blacklockadvisory.com | Cross-jurisdiction professional network and sensitive advisory/recruiting processes |
| 5 | 10x Advisory | Accounting / transaction advisory | 8 | 10x-advisory.com | Distributed global service delivery and operational/account-access dependencies |
| 6 | ArcherStanley Group | Accounting / finance recruiting | 3 | archerstanley.com | Client/candidate data and professional communications are central to delivery |
| 7 | Camuso CPA | Accounting / crypto advisory | 3 | camusocpa.com | Complex digital-asset accounting client workflows; requires careful scope/claims review |
| 8 | The Killino Firm, P.C. | Law practice | 9 | killinofirm.com | Case/client communication and document availability are operationally important |
| 9 | East Side Property Management | Property management | 2 | eastsideflorida.com | Small property operator dependent on customer/vendor communications and service continuity |
| 10 | RE/MAX Town & Country – The Ailion Team | Real estate | 3 | locationlocationlocation.com | Technology-enabled transaction workflow and client account/communications exposure |
| 11 | South Downtown Atlanta | Real estate development | 10 | southdowntownatl.com | Multi-property operating context and external stakeholder/vendor coordination |
| 12 | John Hughes Company | Real estate / executive search | 6 | jhughesco.com | Real-estate deal sourcing + executive search depends on trusted professional channels |
| 13 | McGowan Mortgages | Mortgage / real estate | 8 | mcgowanmortgages.com | Application/loan communications and regulated customer-information context; qualification required |
| 14 | Real Estate Financial Modeling | Real estate software/training | 10 | getrefm.com | Web-based financial-modeling product plus training/consulting workflow |
| 15 | TextLocate | Logistics technology | 10 | textlocate.com | SMS, location updates and document/image flows are core to service operation |
| 16 | Blue Bridge Logistics | Freight / drayage | 6 | bluebridgelogistics.net | Time-sensitive port/rail/trucking coordination and third-party communications |
| 17 | DOF Ground | Freight brokerage | 9 | dofground.com | Carrier network, cross-border logistics and visibility processes |
| 18 | Arrow 3PL | Freight brokerage | 2 | arrow3pl.com | Technology-assisted freight brokerage and customer/carrier communication dependency |
| 19 | Rig On Wheels Recruitment Services | Trucking recruiting | 6 | rigonwheels.com | High-volume driver/company relationship workflows and communications |
| 20 | FSN (Freedom Search Network) | Supply-chain recruiting | 10 | freedomsearch.com | Recruiting workflow for supply-chain/logistics roles, with candidate/client information handling |

### Larger but interesting expansion prospects — not clean founding-scope fits

- RiVirtual Inc. — public AI/PropTech and FinTech positioning; observed employee estimate above founding boundary.
- Platton — digital freight forwarder; observed employee estimate around 20.
- Nextburb — search/data platform; observed employee estimate around 19.
- Elsdon Supply Chain — logistics staffing; observed employee estimate around 15.
- Beyond Paralegals — public legal-operations/vendor dependencies and a public LinkedIn employee-listing issue; observed employee estimate above 10.
- Octagon Professional Recruiting / Financial Consulting / Executive Search — observed employee estimate above 10.

Do not force a $199 “up to 10 people” offer onto these larger prospects without an approved scope variant.

## 11. Evidence-safe outreach rule

One-to-one outreach must reference a verifiable public fact, not an inferred weakness.

Allowed pattern:

> We noticed your business relies on [publicly visible workflow/channel]. GEM is opening a small founding cohort for a bounded Business Security & Operations Review designed to help small teams identify what to fix first across access, public exposure, operational dependencies and incident readiness.

Do not state:

- “you are vulnerable”;
- “we found a breach”;
- “your systems are insecure”;
- “we detected compromised credentials”;
- implied diagnostic results from public research.

No message is auto-sent by this dossier.

## 12. Public-claims reconciliation status

The pre-branch public Resources and Privacy surfaces contained claims that required evidence review, including analyst/research-team staffing, incident-response-unit coverage, tool availability, biometric/KYC collection, universal encryption/control assertions, continuous monitoring, and audit/penetration-test statements.

This release branch has reconciled `/resources` and `/privacy` to evidence-safe, conditional wording. The old examples remain useful as a **do-not-reintroduce** register, not as current branch claims. Public growth should continue to follow the `publicClaims` evidence doctrine: staffing, provider, regulatory, security, performance, availability and geographic claims must be supported before publication.

## 13. Connector and evidence reality in this ChatGPT environment

| Capability | Current reality | Decision |
|---|---|---|
| GitHub | Connected and used for this release | CANONICAL code/workflow connector |
| Clay | Connected and used for initial company research | Research enrichment only; not system of record and no auto-outreach |
| Amplitude | Connected project found; no verified GEM commercial funnel events discovered | Use only after canonical event emission is instrumented |
| Google Search Console | **Connected and verified** for `sc-domain:gemcybersecurityassist.com`; settled Web-search baseline captured for 2026-06-13 through 2026-09-11 | Use as first-party acquisition/search evidence; do not ask the owner to reconnect it |
| Supabase | Connector account does not authorize documented production project `slzdjoqpzbkwzuaexlkj` | Production DB activation remains an external authorization gate; do not substitute another project |
| Vercel | Canonical project connected; exact release previews and runtime errors inspected | Use for deployment/build/runtime evidence |
| Perplexity connector catalogue | Not inherited automatically into ChatGPT | Ignore unless separately connected here |

Verified Search Console baseline is recorded in `docs/commercial/GEM-SEARCH-CONSOLE-BASELINE-2026-09-13.md`: 9 clicks, 2,177 impressions, ~0.413% CTR and ~11.53 average position across the settled window. The property is primarily brand/navigation-led today; `/business-review` is a prospective buyer-intent experiment, not a historical conversion claim.

## 14. Production activation gates

### Database / intake

1. Authorize the documented GEM Supabase project `slzdjoqpzbkwzuaexlkj` in the execution session or Vercel production configuration.
2. Confirm a pooled server database URL recognized by `src/lib/db.ts` (`POSTGRES_PRISMA_URL`, `DATABASE_URL`, `POSTGRES_URL`, or `NEON_DATABASE_URL`) is present in the production runtime.
3. Prove a controlled `/api/intake/enterprise` submission persists to the canonical intake tables and produces its status event.
4. Do not create public PostgREST writes or a shadow lead database as a workaround.

### Customer Success

1. Apply `20260913163000_customer_success_foundation` through the controlled production migration process.
2. Verify the table constraints, foreign keys, indexes, RLS and grants/revokes.
3. Smoke test create/update/action/audit flows with an authorized admin.

### Communication Governance

1. Apply `20260913170000_communication_governance` through the controlled production migration process.
2. Verify append-only event protection, restricted preference deletion, mapped indexes, RLS and grants/revokes.
3. Configure `COMMUNICATION_UNSUBSCRIBE_SECRET` with at least 32 random characters.
4. Set `GEM_PUBLIC_BASE_URL=https://www.gemcybersecurityassist.com` in production.
5. Configure a verified physical marketing postal address and monitored reply-to channel.
6. Verify SMTP sender identity and one controlled external delivery, reply, bounce/failure and Authentication-Results path.
7. Populate only reviewed `ALLOWED` marketing-email preferences with durable evidence.
8. Enable `COMMUNICATION_GOVERNANCE_ENABLED=true` only after storage and sender smoke tests pass.
9. Confirm browser signed-link unsubscribe and mailbox one-click unsubscribe produce distinct evidence methods and both block future marketing delivery.

## 15. First-market execution queue after production gates

Repository-side first-market feature development is complete. The remaining queue is activation and evidence, not another build:

1. restore/prove production Prisma connectivity and anonymous intake persistence;
2. apply and verify the two additive migrations;
3. complete current sender/deliverability smoke evidence;
4. run authenticated admin/customer-success/communications smoke tests;
5. obtain explicit owner merge/release authority;
6. release the verified exact head and run production public/authenticated smokes;
7. begin First-20 one-to-one execution using the existing research queue and one canonical `founding-first-20` attribution contract;
8. measure Search Console, governed intake/pipeline outcomes and approved analytics events before increasing volume.

Do not reopen optional commerce-provider, advanced-video, multilingual, capital-readiness, alternate-backend or additional-SaaS work as a first-release blocker unless a production verification proves it is required.

## 16. Launch status

**READY WITH PRODUCTION GATES** for the controlled first-market release candidate after exact-head verification.

The release is not authorized for bulk marketing email or unrestricted social publishing until the applicable permission/provider controls are deliberately activated. It is also not authorized for production merge until the documented database/intake gate is proven and the owner gives explicit merge authority.

The core rule remains:

> **One GEM brand. One public website. One customer identity. One governed commercial lifecycle. One Workspace OS. One audit trail. Specialized external tools only where they add verified value.**
