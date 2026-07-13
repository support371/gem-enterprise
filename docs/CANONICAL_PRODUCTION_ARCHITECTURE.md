# GEM Enterprise Canonical Production Architecture

## Purpose

This document defines the production source of truth for GEM Enterprise. It prevents duplicate deployments, databases, authentication systems, administrative applications, and provider integrations from being treated as canonical.

## Canonical system identity

| Component | Canonical value |
|---|---|
| Public application | `https://www.gemcybersecurityassist.com` |
| Source repository | `support371/gem-enterprise` |
| Production branch | `main` |
| Vercel project | `support371-gem-enterprise` |
| Package manager | `pnpm@10.28.0` |
| Node runtime | `24.x` |
| Database source of truth | `prisma/schema.prisma` |
| Production deployment owner | Vercel Git integration |

The administrative domain `https://admin.gemcybersecurityassist.com` is a related operational surface. Its long-term authentication and system-of-record relationship must remain classified as **architecture review required** until its implementation and authorization boundary are formally documented.

## Application architecture

### Web application

- Next.js 16 App Router
- React 18
- TypeScript 5.8
- Tailwind CSS and existing shared components
- Server Components by default
- Route handlers under `src/app/api/`

### Database

- PostgreSQL
- Prisma 5
- Pooled runtime connection through `POSTGRES_PRISMA_URL`
- Direct migration connection through `POSTGRES_URL_NON_POOLING`
- Version-controlled migrations under `prisma/migrations/`

Prisma and PostgreSQL are the production application system of record. A Base44 database, spreadsheet, preview catalogue, or agent memory must not become an alternative source of truth for client, identity, entitlement, audit, security, compliance, product, content, or integration state.

### Authentication

The canonical application uses the existing signed JWT/session architecture:

- Core logic: `src/lib/auth.ts`
- HTTP-only session cookie: `gem_session`
- Credential verification: local bcrypt-based authentication or the approved optional Supabase gateway
- Login route: `src/app/api/auth/login/route.ts`
- Route boundary: `src/proxy.ts`
- Recovery: existing forgot-password and reset-password routes

Do not replace this architecture with Base44 authentication, ChatGPT authentication, or another identity provider without an approved migration plan, session-transition design, rollback plan, and tenant-isolation test evidence.

### Authorization

Authorization consists of separate controls:

- Global platform role
- Account status
- Organization membership
- Workspace role and permissions
- Entitlements
- Resource ownership
- Review assignment
- Administrative scope

Sensitive APIs must validate the signed session and the target resource. Client-supplied roles, organization IDs, storage paths, scan decisions, payment states, and identity headers are not authoritative.

### Email

Nodemailer SMTP is used when the required server-side variables are configured. Route presence does not prove delivery. Password recovery and transactional email are operational only after real delivery, token validation, and completion tests pass.

### Storage and evidence

Supabase Storage is used as the server-side foundation for the governed evidence vault. The service-role key must never be exposed to the browser.

Identity or financial document upload remains fail-closed until all of these controls work:

- Private object storage
- Short-lived upload authorization
- File-signature and size validation
- Malware scanning and quarantine
- Authenticated callbacks
- Reviewer access control
- Audit logging
- Retention and deletion enforcement

## Production domains

### Public presentation

Public pages describe services, products, company information, intelligence, resources, onboarding, store catalogues, and controlled previews.

Public statements must be supported by an approved evidence record or qualified as planned, conditional, illustrative, historical, provider-dependent, or request-only.

### Controlled onboarding

The application supports users, profiles, KYC applications, reviews, decisions, entitlements, and protected access. High-impact identity and eligibility decisions remain human-controlled.

Open self-registration is disabled. `/register` redirects to `/get-started`.

### Client operations

The protected application contains foundations for dashboards, products, portfolios, documents, messages, service requests, support, meetings, compliance, notifications, and administrative review.

A page or model existing in the repository does not prove that the capability is activated or backed by live provider data.

### Community preview

`/community` temporarily redirects to `/community-hub` while public identity, staffing, affiliation, membership, and operational claims undergo evidence review.

The Community Hub is a fictional, non-indexed design preview. It must not be presented as:

- A live member directory
- A verified professional network
- An active investment marketplace
- A current event programme
- A production secure-messaging system
- A source of real transaction opportunities

### Commerce

The store is request-only. Displayed prices are indicative and do not create:

- An order
- A subscription
- A payment obligation
- Inventory commitment
- Licensing commitment
- Service activation
- Refund entitlement
- Service-level agreement

Payment activation requires separate provider verification, terms, taxes, fulfillment, refund, chargeback, cancellation, support, and owner approval.

### Content and TokMetric

The schema includes governed foundations for organizations, workspaces, connectors, campaigns, content versions, media assets, compliance reviews, approvals, publishing jobs, analytics, webhooks, audit events, and idempotency.

Production publishing, advertising, and shop writes remain disabled until platform authorization, provider approval, credentials, compliance review, and owner approval are complete.

## Base44 boundary

Base44 may be used as an internal orchestration and operational visibility layer for:

- Workstream tracking
- Issue and pull-request summaries
- Readiness matrices
- Claims review queues
- Test-evidence indexes
- Release approvals
- Integration-state summaries
- Video-production planning

Base44 must not:

- Replace the canonical website
- Replace PostgreSQL or Prisma
- Replace the authentication system
- Store production secrets in client-visible code
- Create an independent client system of record
- Write directly to `main`
- Merge pull requests without approval
- Activate paid or regulated providers
- Make identity, legal, compliance, financial, or access decisions autonomously

A permanent Base44 two-way application-code sync must not be connected to the canonical repository without an approved migration and rollback plan.

## Deployment model

1. Create or reference a GitHub issue.
2. Create a focused branch from current `main`.
3. Implement the smallest complete vertical slice.
4. Add tests.
5. Run `pnpm run verify`.
6. Open a pull request.
7. Require the canonical Vercel preview to pass.
8. Obtain required human approvals.
9. Merge to `main`.
10. Vercel Git integration deploys production.
11. Run production smoke tests.
12. Record evidence and monitor the release.

Do not create another `vercel --prod` deployment path.

## Database-change model

A production migration requires:

- Version-controlled migration files
- Compatibility assessment
- Data-backfill plan when applicable
- Index and lock-impact review
- Disposable PostgreSQL validation
- Recovery or rollback procedure
- Test evidence
- Owner-approved execution

Production migrations are not automatically authorized by merging application code.

## Feature gates

The following remain disabled or request-only until their activation criteria pass:

- KYC identity and financial documents
- Biometric and liveness verification
- Automatic KYC/KYB approvals
- Payments and subscriptions
- Marketplace transactions
- Live threat-intelligence assertions
- Guaranteed response-time claims
- Continuous-monitoring claims
- TikTok and external social publishing
- Advertising expenditure
- Seller and merchant writes
- Evidence-vault production intake

## Trust and claims controls

No public page, video, campaign, product, support message, or automated agent may represent sample or planned information as live or verified.

Claims requiring evidence include:

- Executive identity and employment history
- Academic and professional qualifications
- Team size and staffing
- Geographic operating centres
- 24/7 availability
- Response-time statistics
- Encryption
- Automated playbooks
- Provider integrations
- Association memberships
- Certifications
- Regulatory and institutional relationships
- Monitoring coverage
- Product availability

## Security controls

Current security foundations include browser security headers, signed sessions, password hashing, Zod validation, audit helpers, rate limiting, no-store API responses, and fail-closed feature gates.

Security work must continue to address:

- Distributed production rate limiting
- Narrow provider allowlists for CSP and remote images
- Tenant-isolation testing
- Session revocation and MFA readiness
- Secure file handling
- Secret rotation
- Dependency and code scanning
- Backup and restore testing

## Owner-only actions

Only an authorized owner may approve:

- Production secrets
- Database migration execution
- Paid-provider activation
- Billing commitments
- Public legal or regulatory representations
- Identity or eligibility decisions
- Payment activation
- Production publishing
- High-impact automation
- Production-domain migration
- Authentication-system migration

## Rollback

### Code-only changes

Use the Vercel rollback capability or revert the merge through a reviewed pull request.

### Database changes

Follow the migration-specific recovery plan. Do not perform an unsafe destructive reversal after production data has been accepted.

### Provider or feature activation

Disable the server-side feature gate or connector through the approved operational process and document the event.

## Required release evidence

- Issue reference
- Pull request
- Commit SHA
- Verification output
- Preview deployment
- Production deployment
- Smoke-test results
- Migration evidence when applicable
- Security and privacy impact
- Claims impact
- Manual dependencies
- Rollback method
- Owner approval for high-impact actions

## Related documents

- `README.md`
- `DEVELOPER_ONBOARDING.md`
- `DEPLOYMENT.md`
- `AGENTS.md`
- `.env.example`
- `prisma/schema.prisma`
