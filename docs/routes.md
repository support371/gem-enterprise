# GEM Enterprise — Route Documentation

This document is the canonical reference for all application routes. It covers the full route table, legacy redirects, and the navigation menu structure.

---

## Table of Contents

1. [Full Route Table](#full-route-table)
2. [Legacy Redirect Table](#legacy-redirect-table)
3. [Menu Structure](#menu-structure)

---

## Full Route Table

### Public Marketing Routes

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/` | Home | Public | Yes | No | Primary Nav | Main marketing landing page |
| `/intel` | Intel | Public | Yes | No | Primary Nav | Market intelligence, research, and insights |
| `/assets` | Assets | Public | Yes | No | Primary Nav | Overview of available asset classes |
| `/community` | Community | Public | Yes | No | Primary Nav | Community hub and engagement |
| `/hub` | Hub | Public | Yes | No | Primary Nav | Resource and tools hub |
| `/about` | About | Public | Yes | No | Secondary Nav | Company history, mission, and team |
| `/contact` | Contact | Public | Yes | No | Secondary Nav | General enquiry and contact form |
| `/resources` | Resources | Public | Yes | No | Secondary Nav | Downloadable reports and resources |
| `/services` | Services | Public | Yes | No | Secondary Nav | Detailed service descriptions |
| `/company` | Company | Public | Yes | No | Secondary Nav | Corporate profile and structure |
| `/get-started` | Get Started | Public | Yes | No | CTA | Onboarding entry point for new applicants |
| `/eligibility` | Eligibility | Public | Yes | No | CTA | Pre-qualification eligibility checker |

### Authentication Routes

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/client-login` | Client Login | Auth | Yes | No | — | Email/password login form |
| `/portal` | Portal | Auth | Yes | No | — | Portal landing; redirects based on session state |
| `/access/continue` | Continue | Auth | Partial | Partial | — | Post-login routing gate; checks KYC and entitlement state |

### KYC Onboarding Routes

All KYC routes require an authenticated session. Unauthenticated requests are redirected to `/client-login`.

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/kyc/start` | KYC Start | KYC | No | Yes | KYC Flow | Entry point; user selects entity type |
| `/kyc/individual` | Individual | KYC | No | Yes | KYC Flow | Onboarding form for individual applicants |
| `/kyc/business` | Business | KYC | No | Yes | KYC Flow | Onboarding form for business entities |
| `/kyc/trust` | Trust | KYC | No | Yes | KYC Flow | Onboarding form for trust structures |
| `/kyc/family-office` | Family Office | KYC | No | Yes | KYC Flow | Onboarding form for family office structures |
| `/kyc/upload` | Document Upload | KYC | No | Yes | KYC Flow | Upload identity and supporting documents |
| `/kyc/review` | Review | KYC | No | Yes | KYC Flow | Review and confirm submission before sending |
| `/kyc/status` | KYC Status | KYC | No | Yes | KYC Flow | Real-time status tracker for submitted application |

### Decision Routes

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/decision/pending` | Pending | Decision | No | Yes | — | Application is under review; holds the user |
| `/decision/approved` | Approved | Decision | No | Yes | — | Approval confirmed; prompts navigation to portal |
| `/decision/rejected` | Rejected | Decision | No | Yes | — | Application rejected; displays reason and next steps |
| `/decision/manual-review` | Manual Review | Decision | No | Yes | — | Application flagged for manual compliance review |

### Protected Client Portal

All `/app/*` routes require an authenticated session with an approved KYC status. The Next.js middleware enforces this check on every request.

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/app/dashboard` | Dashboard | Portal | No | Yes — Client | Portal Nav | Personalised overview of account and activity |
| `/app/products` | Products | Portal | No | Yes — Client | Portal Nav | Browse and access available investment products |
| `/app/portfolios` | Portfolios | Portal | No | Yes — Client | Portal Nav | View and manage investment portfolios |
| `/app/documents` | Documents | Portal | No | Yes — Client | Portal Nav | Secure document vault (statements, agreements) |
| `/app/support` | Support | Portal | No | Yes — Client | Portal Nav | Create and manage support tickets |
| `/app/compliance` | Compliance | Portal | No | Yes — Client | Portal Nav | Compliance documentation and attestations |
| `/app/requests` | Requests | Portal | No | Yes — Client | Portal Nav | Submit and track formal service requests |
| `/app/profile` | Profile | Portal | No | Yes — Client | Account Menu | Personal profile and contact information |
| `/app/settings` | Settings | Portal | No | Yes — Client | Account Menu | Account preferences and configuration |
| `/app/security` | Security | Portal | No | Yes — Client | Account Menu | Password, MFA, and session management |
| `/app/notifications` | Notifications | Portal | No | Yes — Client | Account Menu | In-app notification centre |
| `/app/messages` | Messages | Portal | No | Yes — Client | Account Menu | Secure internal messaging with GEM staff |

### Admin Routes

Admin routes require `role = ADMIN`. Requests from non-admin authenticated users receive a `403` response.

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/app/admin` | Admin | Admin | No | Yes — Admin | Admin Panel | Admin overview and key metrics |
| `/app/admin/kyc` | KYC Management | Admin | No | Yes — Admin | Admin Panel | Review, approve, reject, and flag KYC submissions |
| `/app/admin/approvals` | Approvals | Admin | No | Yes — Admin | Admin Panel | Manage and process the approvals queue |
| `/app/admin/users` | Users | Admin | No | Yes — Admin | Admin Panel | User directory with role and status management |
| `/app/admin/allocations` | Allocations | Admin | No | Yes — Admin | Admin Panel | Manage product allocations per client |

### Compliance Routes

| Path | Label | Category | Public? | Requires Auth | Menu Group | Description |
|---|---|---|---|---|---|---|
| `/privacy` | Privacy Policy | Compliance | Yes | No | Footer | Data privacy and cookie policy |
| `/terms` | Terms of Service | Compliance | Yes | No | Footer | Platform terms and conditions |
| `/compliance-notice` | Compliance Notice | Compliance | Yes | No | Footer | Regulatory disclosures and notices |

---

## Legacy Redirect Table

These redirects are defined in `next.config.ts` using the `redirects()` function.

| Source (Legacy Path) | Destination (Canonical) | Redirect Type | Notes |
|---|---|---|---|
| `/login` | `/client-login` | 301 Permanent | Old login URL |
| `/register` | `/get-started` | 301 Permanent | Old registration URL |
| `/apply` | `/kyc/start` | 301 Permanent | Old application URL |
| `/dashboard` | `/app/dashboard` | 301 Permanent | Unqualified dashboard URL |
| `/admin` | `/app/admin` | 301 Permanent | Unqualified admin URL |
| `/profile` | `/app/profile` | 301 Permanent | Unqualified profile URL |

---

## Menu Structure

### Primary Navigation (Public, Header)

```
Home (/)
Intel (/intel)
Assets (/assets)
Community (/community)
Hub (/hub)
[Get Started CTA] (/get-started)
```

### Secondary Navigation (Public, Header or Footer)

```
About (/about)
Services (/services)
Company (/company)
Resources (/resources)
Contact (/contact)
```

### Footer Navigation

```
Privacy Policy  (/privacy)
Terms of Service (/terms)
Compliance Notice (/compliance-notice)
```

### Portal Navigation (Authenticated Clients)

```
Dashboard        (/app/dashboard)
Products         (/app/products)
Portfolios       (/app/portfolios)
Documents        (/app/documents)
Compliance       (/app/compliance)
Requests         (/app/requests)
Support          (/app/support)
Messages         (/app/messages)
```

### Account Menu (Authenticated, Dropdown)

```
Profile          (/app/profile)
Settings         (/app/settings)
Security         (/app/security)
Notifications    (/app/notifications)
Sign Out         → POST /api/auth/logout
```

### Admin Panel Navigation (Admin Role Only)

```
Overview         (/app/admin)
KYC Management   (/app/admin/kyc)
Approvals        (/app/admin/approvals)
Users            (/app/admin/users)
Allocations      (/app/admin/allocations)
```
