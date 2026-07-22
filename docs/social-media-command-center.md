# GEM Social Media Command Center

## Purpose

The Social Media Command Center extends the existing TokMetric foundation into a governed cross-platform operating surface for:

- TikTok
- Facebook Pages
- Instagram professional accounts
- X
- Nextdoor
- Indeed Employer
- LinkedIn Company Pages
- YouTube

The system is intentionally fail-closed. Environment configuration is readiness evidence only. It does not prove that an account is authorized and it never grants permission to publish.

## Implemented layers

### Governance and readiness

The production foundation provides channel definitions, channel-specific content restrictions, compliance and exact-version approval requirements, idempotency requirements, emergency locks, independent provider live gates, a protected readiness API, and operator dashboards.

### Account authorization

TikTok authorization remains inside TokMetric. Meta, X, LinkedIn, YouTube, and Nextdoor use the cross-platform OAuth foundation, which provides:

- signed state bound to actor, workspace, provider, nonce, and expiry;
- PKCE for providers that require or benefit from it;
- single-use durable authorization attempts;
- AES-256-GCM encrypted credentials;
- protected connector inventory and deletion;
- same-origin protection for credential deletion;
- connector emergency-lock enforcement at start, callback, and disconnect boundaries;
- secret-safe error and readiness responses.

Account authorization stores a credential only. It does not enable an external publishing operation.

### Indeed employer workflow

Indeed is deliberately excluded from generic social OAuth. Direct-employer job publishing must use an approved employer-feed path and a genuine approved vacancy.

## Required publishing sequence

Every external publishing attempt must pass this sequence:

1. Approved company source material exists.
2. A versioned content package is created.
3. Channel-specific policy validation passes.
4. Compliance review passes.
5. A different authorized operator approves the exact content version and hash.
6. The destination connector is connected and healthy.
7. Required scopes and platform access are present.
8. The global and provider-specific live gates are enabled.
9. No emergency lock is active.
10. An idempotency key is present.
11. The provider adapter performs the external request.
12. The result is stored with source, external identifier, timestamps, and audit evidence.

The current implementation provides reusable controls through step 10. Provider publishing adapters remain absent, so no external write is possible through this subsystem.

## Channel restrictions

### TikTok

TikTok continues through the existing TokMetric OAuth, compliance, approval, publishing-preflight, analytics, and audit modules. Do not bypass TokMetric with a second direct connector.

### Facebook and Instagram

Only a Facebook Page and an Instagram Business or Creator account may be connected. Personal-profile automation is outside the approved scope. Required Meta permissions and app-review evidence must be present before authorization is treated as eligible.

### X

Only the authorized company account may be connected. Thread and media publication must remain exact-version and approval bound.

### Nextdoor

Every post requires documented local context and an authorized neighborhood or business identity. OAuth remains blocked until Publish API access evidence is recorded.

### Indeed

Indeed is not a general social feed. The system must accept only a genuine approved vacancy or an employer update. Job publishing requires a vacancy identifier.

### LinkedIn

Publishing is limited to an authorized company organization. Community Management API access, organization role validation, and versioned API requests are mandatory.

### YouTube

A connected Brand Account or authorized channel is required. Video rights and disclosure checks remain mandatory. Public-upload activation remains separately audit-gated.

## Secret handling

- Store all client secrets and tokens in managed secret storage.
- Never expose secret values in readiness responses or browser-rendered data.
- Use `SOCIAL_TOKEN_ENCRYPTION_KEY` for non-TikTok provider credentials.
- Continue using `TOKMETRIC_TOKEN_ENCRYPTION_KEY` for the existing TikTok connector.
- Rotate credentials after suspected disclosure.
- Never commit live credentials to GitHub.

## Remaining activation sequence

1. Verify and merge the multi-provider OAuth foundation.
2. Apply the additive social connector database migration to the canonical database.
3. Configure one provider application at a time using managed production secrets.
4. Record required platform approval evidence before enabling the associated OAuth flag.
5. Complete administrator consent and discover the actual Page, organization, channel, profile, or business identity.
6. Add token refresh, health, reauthorization, and external revocation adapters.
7. Add provider-specific profile and account discovery.
8. Add durable publishing queue, bounded retries, dead-letter handling, webhook reconciliation, and analytics ingestion.
9. Add provider publishing adapters behind the existing compliance, approval, lock, idempotency, and live-gate controls.
10. Certify and enable one provider at a time.

## Production gates

The global gate must remain false until a provider has completed certification:

```text
SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED=false
```

Provider-specific gates must also remain false until separately approved. Platform-approval flags must reflect documentary evidence and must never be enabled merely to bypass readiness checks.
