# Social Publishing Queue Console

## TASK ID
SOCIAL-PUBLISHING-QUEUE-CONSOLE

## TITLE
Expose the governed cross-platform publishing queue in the client Social Media Suite

## OWNER
Codex / social media operations lane

## SOURCE PR/ISSUE
Owner request dated 2026-09-21 to locate and complete the existing social-presence worker.

## CURRENT MAIN SHA
`d80cd79d71899e33b2bd674e17d671c226528844`

## SOURCE HEAD SHA
Not applicable; implementation starts from current main.

## WORKING BRANCH
`codex/social-presence-completion`

## OBJECTIVE
Replace the static client calendar handoff with a real, read-only view of the existing governed shared publishing queue. Operators must be able to see platform, state, schedule, attempts, exact-version evidence, approval and compliance references, safe failure details, and provider-confirmed post links.

## NON-GOALS
- Do not activate live publishing or change provider environment gates.
- Do not create, process, retry, cancel, or publish queue jobs from this console.
- Do not change TokMetric or the existing TikTok publishing path.
- Do not add or rotate provider credentials.
- Do not overlap the Telegram credential-remediation lane in PR #292 or the Security Posture campaign in PR #342.

## KNOWN CURRENT STATE
The repository already contains a daily content orchestrator, governed content and video workflows, a shared provider-neutral publishing queue, OAuth connectors, provider adapters, a publishing worker, audit evidence, and a separate TokMetric path for TikTok.

## KNOWN DEFECT / MISSING CAPABILITY
Production `/app/social-media/calendar` exposes only readiness cards and links away to a TikTok-oriented publishing page. It does not render the existing shared queue, so operators cannot inspect cross-platform scheduled, blocked, retrying, failed, or published records from the Social Media Suite.

## OWNED FILES
- `src/components/social-media/SocialPublishingQueuePanel.tsx`
- `src/app/app/social-media/calendar/page.tsx`
- `src/__tests__/client-social-media-suite.test.ts`
- `docs/agent-control/ACTIVE-WORK.md`
- `docs/agent-control/tasks/SOCIAL-PUBLISHING-QUEUE-CONSOLE.md`

## FORBIDDEN FILES
- Provider credential stores and security-remediation files
- TokMetric and TikTok publishing routes
- PR #342 campaign files
- Prisma schema and migrations
- Production environment or deployment configuration

## IMPLEMENTATION REQUIREMENTS
- Read queue data only through authenticated `GET /api/social-media/publishing/jobs`.
- Reuse the Social Media Suite workspace selection stored in browser local storage.
- Expose provider and state filters without inventing queue data.
- Show whether the queued content hash matches the approved version hash.
- Surface only safe identifiers and safe provider errors already returned by the queue API.
- Do not add a mutation request to the client component.

## SECURITY BOUNDARIES
- Workspace membership remains server-authoritative.
- No access token, refresh token, client secret, or raw credential may enter the browser response.
- External publishing remains gated by compliance, independent human approval, exact-version hash, connector/account selection, scopes, global and provider live gates, idempotency, and emergency locks.
- Opening a provider-confirmed post URL is read-only verification and must not trigger an external write.

## TEST PLAN
### CONFIGURATION-INDEPENDENT TESTS
- Schema promotion checks
- Public claims report check
- ESLint
- TypeScript
- Full Vitest suite
- Production Next.js build
- `git diff --check`

### CONFIGURATION-DEPENDENT TESTS
- Authenticate to the production client portal and confirm the current calendar deficiency.
- Verify the canonical exact-head preview after pull-request publication.
- Do not exercise queue mutations or provider publishing during verification.

## ACCEPTANCE CRITERIA
- The Social Media calendar renders the shared queue console.
- An authorized operator can load a workspace queue and filter it by provider and state.
- Each record shows schedule, attempt count, connector reference, exact-version status, approval/compliance evidence, failure state, and a published-post URL when present.
- The component contains no POST or other mutation request.
- All configuration-independent tests pass.

## ROLLBACK POINT
Revert the focused implementation commit; no schema, credential, provider, or external-state rollback is required.

## HUMAN GATES
- Pull-request merge authorization.
- Provider authorization and production activation remain separate owner actions.
- Telegram integration remains blocked from this lane by the active credential-remediation ownership boundary.

## RETURN FORMAT
Report exact branch/head, changed files, local gates, canonical preview result, provider actions taken, blocker class, and next safe action.

## SUPERSESSION CONDITIONS
Supersede only if current main gains an equivalent read-only shared publishing queue console with equal or stronger governance evidence.

## MERGE GATE
Exact-head CI and canonical preview must pass, changed-file ownership must remain isolated, and an authorized human must approve merge. Production provider activation is not part of this merge.
