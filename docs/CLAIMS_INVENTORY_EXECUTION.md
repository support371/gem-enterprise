# Public Claims Inventory Execution

## Objective

Create a complete, evidence-backed inventory of claims currently published by GEM Enterprise before expanding marketing, video, onboarding, or operational promises.

## Priority routes

1. `/hub`
2. `/services`
3. `/company`
4. `/request-access`
5. `/get-started`
6. `/store`
7. `/community-hub`
8. `/trust-center`

## Claim categories

- Identity and leadership
- Employment and academic credentials
- Professional qualifications
- Team size and staffing
- Geographic coverage
- Availability and support hours
- Response-time and service-level statements
- Security monitoring
- Automation and playbooks
- Encryption and secure messaging
- Compliance and certification
- Affiliations, memberships, and partnerships
- Product availability
- Pricing and commercial commitments
- KYC, verification, and approval
- Property and financial protection
- Integrations and data sources

## Required fields

Each inventory record must include:

- Stable claim key
- Exact public wording
- Route
- Section
- Category
- Risk level
- Current visibility
- Evidence status
- Evidence owner
- Evidence reference
- Approved public wording
- Expiration or review date
- Reviewer
- Notes

## Evidence states

- `verified`
- `conditional`
- `demonstration`
- `planned`
- `expired`
- `unsupported`
- `removed`

## Initial implementation boundary

The first implementation must not add a production database migration.

Begin with:

1. A typed repository claims manifest.
2. A scanner test for selected high-risk phrases.
3. Route-to-claim mapping.
4. A generated Markdown review report.
5. Replacement wording for unsupported or conditional claims.
6. An approval proposal for later Prisma promotion.

## High-risk wording to inspect

- `24/7`
- `live`
- `active`
- `verified`
- `certified`
- `guaranteed`
- `automatic`
- `real-time`
- `encrypted`
- fixed acknowledgement or response times
- named affiliations or memberships
- executive credentials
- staff and team counts

## Acceptance criteria

- Priority routes are fully inventoried.
- Every high-risk claim has an evidence state.
- Unsupported claims have proposed replacement wording.
- Demonstration content is visibly labeled.
- Tests fail when blocked wording is introduced outside approved claim records.
- No production schema or migration is changed in the first slice.
- `pnpm run verify` passes.
- Vercel preview reaches `READY`.
- Human approval is required before public wording changes are merged.
