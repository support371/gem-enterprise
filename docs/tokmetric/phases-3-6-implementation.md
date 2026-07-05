# TokMetric Combined Phases 3–6

## Purpose

This branch accelerates TokMetric by building Phases 3, 4, 5, and 6 on one shared workflow foundation while preserving strict phase gates.

## Phase 3 — Content, compliance, and approvals

Implemented workflow services support:

- Immutable content versions
- Stable content hashing
- Draft creation
- New-version creation
- Basic compliance findings
- Review results
- Approval requests bound to an exact content-version hash
- Approval decisions and expiration handling
- Approval invalidation when version hashes no longer match
- Audit and domain events

## Phase 4 — GPT action contract

Implemented server-to-server authentication support includes:

- Bearer-token authentication through `GPT_AUTH_TOKEN`
- Timing-safe token comparison
- Fail-closed behavior when authentication is not configured
- No browser exposure of the shared server credential

The public action routes and OpenAPI contract must be completed and reviewed before enabling a custom GPT connection.

## Phase 5 — Controlled agents

The agent registry defines:

- Content strategist
- Script writer
- Quality reviewer
- Publishing coordinator

Every agent is draft-only. None is allowed to claim or perform an external publication. Human approval remains required for high-impact actions.

## Phase 6 — Media and publishing pipeline

Implemented workflow services support:

- Media metadata registration
- Image/video type validation
- File-size validation
- Stable asset hashing
- Publishing-job preflight validation
- Exact-version approval checks
- Connected-account checks
- Idempotency-key binding
- Internal and external publish states kept separate

Actual TikTok publication remains blocked unless all of these are true:

1. `TOKMETRIC_LIVE_PUBLISHING_ENABLED=true`
2. Workspace publishing controls allow the action
3. Content state is approved
4. Approval matches the exact active content-version hash
5. A connected publishing connector exists
6. A unique idempotency key is supplied
7. TikTok credentials, scopes, and approvals are active

## Files introduced

- `src/lib/tokmetric/workflow.ts`
- `src/lib/tokmetric/gptAuth.ts`
- `src/lib/tokmetric/agents.ts`

## Remaining work before merge

- Add authenticated website workflow routes
- Add bearer-protected GPT action routes
- Add an OpenAPI 3.1 contract
- Add policy CRUD and version APIs
- Add full workflow and permission tests
- Add media storage adapter integration
- Add durable job worker and retry handling
- Add TikTok upload/publish adapter behind the live gate
- Add UI pages for drafts, reviews, approvals, media, and publishing jobs
- Run Prisma validation, TypeScript, lint, tests, and production build

## Rollout rule

This combined branch must not bypass review gates just because multiple phases are developed together. Each capability remains independently fail-closed until its configuration, tests, and platform requirements are satisfied.
