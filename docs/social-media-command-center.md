# GEM Social Media Command Center

## Purpose

The Social Media Command Center is the canonical governed hub for:

- TikTok
- Facebook Pages
- Instagram professional accounts
- X
- Nextdoor
- Indeed Employer
- LinkedIn Company Pages
- YouTube

The system is fail-closed. Configuration and account discovery are readiness evidence only; neither grants permission to publish.

## Canonical implementation

All connector work belongs in `support371/gem-enterprise`. Do not create a second repository, OAuth state store, credential store, or publishing pipeline for an individual channel.

Primary paths:

- `src/lib/social-media/providers.ts`
- `src/lib/social-media/policy.ts`
- `src/lib/social-media/oauth/`
- `src/app/api/social-media/`
- `src/app/app/command-center/social-media/`
- `src/lib/facebook/`
- `src/app/api/facebook/`
- `src/app/app/command-center/tokmetric/`

Cross-platform completion is tracked in GitHub issue #237.

## Implemented layers

### Governance and readiness

The production foundation provides channel definitions, channel-specific restrictions, compliance and exact-version approval requirements, idempotency requirements, emergency locks, independent provider live gates, a protected readiness API, and operator dashboards.

### Account authorization and lifecycle

TikTok authorization remains inside TokMetric. Meta, X, LinkedIn, YouTube, and Nextdoor use the shared OAuth foundation, which provides:

- signed state bound to actor, workspace, provider, nonce, and expiry;
- PKCE for providers that require or benefit from it;
- single-use durable authorization attempts;
- AES-256-GCM encrypted credentials;
- provider account discovery and multi-account persistence;
- protected connector inventory and deletion;
- token lifecycle, health, refresh serialization, reauthorization, and fail-closed state transitions;
- connector emergency-lock enforcement;
- secret-safe errors, audit evidence, and readiness responses.

The Facebook Operations dashboard must consume this shared Meta connector inventory. The removed Facebook-specific callback must not be restored.

Account authorization stores a credential and discovered account identity only. It does not authorize an external publishing operation.

### Indeed employer workflow

Indeed is deliberately excluded from generic social OAuth. Direct-employer job publishing must use an approved employer-feed path and a genuine approved vacancy.

## Required publishing sequence

Every external publishing attempt must pass this sequence:

1. Approved company source material exists.
2. A versioned content package is created.
3. Channel-specific policy validation passes.
4. Compliance review passes.
5. A different authorized operator approves the exact content version and hash.
6. The explicitly selected destination connector is connected and healthy.
7. Required scopes and platform access are present.
8. The global and provider-specific live gates are enabled.
9. No emergency lock is active.
10. A stable idempotency key is present.
11. A durable worker atomically claims the job.
12. The registered provider adapter performs the external request.
13. The result is stored with sanitized provider evidence, external identifier, timestamps, and audit evidence.

The shared governance and credential layers are implemented. A fully shared durable queue and certified provider publishing adapters remain incomplete, so all live gates must remain false.

## Channel restrictions

### TikTok

TikTok continues through the existing TokMetric OAuth, compliance, approval, publishing-preflight, analytics, and audit modules. Do not bypass TokMetric with a second direct connector.

### Facebook and Instagram

Only Facebook Pages and Instagram Business or Creator accounts may be connected. Personal-profile automation is outside scope. Account selection must be explicit; never auto-select the first discovered Page.

### X

Only the authorized company account may be connected. Threads and media publication must remain exact-version and approval bound.

### Nextdoor

Every post requires documented local context and an authorized neighborhood or business identity. OAuth and publishing remain blocked until Publish API access evidence is recorded.

### Indeed

Indeed is not a general social feed. The system accepts only genuine approved vacancies or employer updates. Job publishing requires a vacancy identifier.

### LinkedIn

Publishing is limited to an authorized company organization. Community Management API access, organization role validation, and versioned API requests are mandatory.

### YouTube

A connected Brand Account or authorized channel is required. Video rights and disclosure checks remain mandatory. Public-upload activation remains separately audit-gated.

## Secret handling

- Store client secrets and tokens only in managed secret storage.
- Never expose secret values in readiness responses, URLs, logs, browser data, or provider response archives.
- Use `SOCIAL_TOKEN_ENCRYPTION_KEY` for non-TikTok provider credentials.
- Continue using `TOKMETRIC_TOKEN_ENCRYPTION_KEY` for the existing TikTok connector.
- Rotate credentials after suspected disclosure.
- Never commit live credentials to GitHub.

## Remaining activation sequence

1. Merge the Facebook-to-shared-Meta connection bridge.
2. Replace the Facebook-specific content connector reference with the canonical shared connector identity.
3. Add one shared durable publishing queue with atomic claims, bounded retries, dead-letter handling, webhook reconciliation, and analytics ingestion.
4. Add a provider adapter registry behind the existing policy, approval, lock, idempotency, and live-gate controls.
5. Certify Meta Page first, followed by Instagram, X, LinkedIn, YouTube, and Nextdoor.
6. Keep TikTok inside TokMetric and Indeed inside the approved employer-feed workflow.
7. Run exact-head lint, TypeScript, tests, and canonical Vercel build verification before each merge.

## Production gates

The global gate must remain false until a provider has completed certification:

```text
SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED=false
```

Provider-specific gates must also remain false until separately approved. Platform-approval flags must reflect documentary evidence and must never be enabled merely to bypass readiness checks.
