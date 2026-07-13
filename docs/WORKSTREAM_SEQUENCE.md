# Workstream Sequence

## Current release gate

PR #182 must complete its final Vercel preview and remain mergeable before owner approval and merge.

## After PR #182

### 1. Public claims inventory

Create the typed claims manifest, scanner tests, review report, and replacement wording without a production migration.

### 2. Onboarding separation

Create distinct enterprise, Community, and product-enquiry routes, durable records, queues, and tests.

### 3. Password recovery evidence

Verify SMTP delivery, canonical reset links, expiry, one-time use, password invalidation, and audit safety.

### 4. Organization and workspace decision

Review PR #173 and determine the correct relationship between general GEM tenant models and TokMetric-specific models before schema promotion.

### 5. Real client workspaces

Implement organization-scoped Basic, Professional, and Enterprise workspaces with tenant-isolation tests and safe owner preview.

## Parallel owner work

The owner can begin gathering evidence for:

- Executive names and biographies
- Employment and academic credentials
- Professional certifications
- Team and staffing counts
- SOC coverage
- Response-time measurements
- Provider contracts
- Association memberships
- Partner relationships
- Encryption architecture
- Product availability and pricing authority
- Support coverage and service-level policies

Evidence should be stored securely outside public source control. The repository should reference approved evidence identifiers, not confidential documents or credentials.
