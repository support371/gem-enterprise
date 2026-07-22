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

The foundation is intentionally fail-closed. Environment configuration is readiness evidence only. It does not prove that an account is authorized and it never grants permission to publish.

## Required publishing sequence

Every external publishing attempt must pass this sequence:

1. Approved company source material exists.
2. A versioned content package is created.
3. Channel-specific policy validation passes.
4. Compliance review passes.
5. A different authorized operator approves the exact content version and hash.
6. The destination connector is connected and healthy.
7. Required scopes are present.
8. The global and provider-specific live gates are enabled.
9. No emergency lock is active.
10. An idempotency key is present.
11. The provider adapter performs the external request.
12. The result is stored with source, external identifier, timestamps, and audit evidence.

The current foundation implements steps 1 through 10 as reusable policy and readiness controls. It does not add a provider adapter that performs an external write.

## Channel restrictions

### TikTok

TikTok continues through the existing TokMetric OAuth, compliance, approval, publishing-preflight, analytics, and audit modules. Do not bypass TokMetric with a second direct connector.

### Facebook and Instagram

Only a Facebook Page and an Instagram Business or Creator account may be connected. Personal-profile automation is outside the approved scope.

### X

Only the authorized company account may be connected. Thread and media publication must remain exact-version and approval bound.

### Nextdoor

Every post requires documented local context and an authorized neighborhood or business identity.

### Indeed

Indeed is not a general social feed. The system must accept only a genuine approved vacancy or an employer update. Job publishing requires a vacancy identifier.

### LinkedIn

Publishing is limited to an authorized company organization. Recruitment content must link to a genuine opening.

### YouTube

A connected Brand Account or authorized channel is required. Video rights and disclosure checks remain mandatory.

## Secret handling

- Store all client secrets and tokens in managed secret storage.
- Never expose secret values in readiness responses or browser-rendered data.
- Use `SOCIAL_TOKEN_ENCRYPTION_KEY` for non-TikTok provider credentials.
- Continue using `TOKMETRIC_TOKEN_ENCRYPTION_KEY` for the existing TikTok connector.
- Rotate credentials after suspected disclosure.
- Never commit live credentials to GitHub.

## Activation order

1. Merge and verify this foundation.
2. Rebase or reapply PR #219 onto current `main` and make its Build Verification green.
3. Complete TikTok sandbox OAuth and connected-account verification.
4. Add Meta OAuth and Page/account discovery.
5. Add X OAuth and media publishing adapter.
6. Add LinkedIn and YouTube OAuth adapters.
7. Request and complete Nextdoor API access before implementing its write adapter.
8. Configure Indeed employer feed or approved employer integration only when genuine vacancies exist.
9. Add a durable publishing queue, bounded retries, dead-letter handling, webhook reconciliation, and analytics ingestion.
10. Enable live gates one provider at a time after certification.

## Production gates

The global gate must remain false until a provider has completed certification:

```text
SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED=false
```

Provider-specific gates must also remain false until separately approved.
