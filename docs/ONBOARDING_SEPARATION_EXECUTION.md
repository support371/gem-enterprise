# Onboarding Funnel Separation Execution

## Objective

Separate enterprise service applications, Community applications, and product enquiries so each flow creates the correct durable record and review queue.

## Required public routes

- `/enterprise/apply`
- `/community/apply`
- `/store/products/[slug]/request`

## Enterprise application

Required fields:

- Applicant type
- Legal and trading names
- Organization
- Job title
- Business email
- Phone
- Country and primary jurisdiction
- Entity type
- Website
- Company size
- Requested division and service
- Current need
- Urgency
- Desired start period
- Compliance contact
- Decision authority
- Referral source
- Privacy and consent acceptance

Do not request identity documents, bank records, or payment details on the public form.

## Community application

Required fields:

- Membership category
- Professional background
- Organization
- Role
- Jurisdiction
- Interests
- Referral
- Reason for joining
- Confidentiality acknowledgement
- Privacy and consent acceptance

Do not imply approval, verification, or guaranteed response time.

## Product enquiry

Required fields:

- Product identifier and slug
- Product name and category
- Displayed indicative price
- Applicant and organization
- Jurisdiction
- Intended use
- Quantity or scope
- Desired start date
- Questions
- Privacy and consent acceptance

## Data requirements

The implementation must create separate durable records rather than depending only on generic audit metadata.

Required status history:

- Submission received
- Assigned
- Under review
- More information required
- Qualified
- Approved for next step
- Declined
- Converted
- Closed

Every status change requires actor, reason, and timestamp.

## Security and compliance

- Server-side validation
- Rate limiting
- Spam controls
- Generic safe errors
- No automatic acceptance or rejection
- No public document upload
- No payment collection
- No contractual commitment
- No response-time promise without approved policy
- Organization and reviewer authorization
- Audit events without sensitive form payload leakage

## Acceptance criteria

- Three separate public routes and forms exist.
- Each form has its own validation schema.
- Anonymous submissions persist durably.
- Admin queues are separate.
- Status history is auditable.
- Confirmation wording is scope-safe.
- No restricted provider or payment feature is activated.
- Unit, API, and end-to-end tests cover the three flows.
- `pnpm run verify` passes.
- Vercel preview reaches `READY`.
