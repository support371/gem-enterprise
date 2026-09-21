# Social Autopilot

## Objective

Complete the repository-backed GEM social publishing service with an autonomous, fail-closed content flow that can maintain a rolling content reserve, apply provider-aware cadence budgets, automatically approve only exact versions with a clean compliance PASS, schedule jobs, and let the existing governed worker publish only when every production gate is genuinely enabled.

## Scope

- `src/lib/social-media/autopilot/**`
- daily content planning/orchestration fields required for `AUTO_POLICY`
- exact-version automated policy evidence
- publishing-worker validation of that evidence
- provider daily targets, hard caps, minimum spacing, and duplicate suppression
- rolling reserve replenishment
- stable egress policy; rotating/residential/mobile proxy configuration rejected
- free-plan-compatible Vercel cron aliases
- Social Media Suite Autopilot status surface
- focused regression tests
- `vercel.json` safe defaults

## Safety invariants

- `SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED` remains false in repository defaults.
- Provider live-write flags remain false in repository defaults.
- Automatic approval is accepted only for a clean compliance `PASS`, the active exact content version, and an auditable `AUTO_POLICY` decision.
- `PASS_WITH_DISCLOSURE`, `CHANGES_REQUIRED`, and `BLOCKED` do not receive automatic approval.
- The worker still enforces emergency locks, connector/provider matching, explicit destination selection, required scopes, compliance evidence, exact-version hashes, idempotency, and live gates.
- Multiple matching accounts require an explicit connector ID; the service never guesses the destination.
- No automated likes, follows, comments, fake views, browser-behavior simulation, rotating proxy camouflage, or residential/mobile proxy rotation.
- TikTok/TokMetric and the existing Telegram publisher remain separate lanes; no duplicate credentials or provider bypasses are introduced.

## Activation gates

Repository integration does not itself authorize external posting. Production writes require the existing global and per-provider live flags plus valid OAuth/provider authorization. Cron execution also requires the configured cron secret, workspace ID, and service actor ID.

## Validation evidence

Bind final evidence to the exact PR head:
- canonical Vercel build
- focused Social Autopilot regression suite where executable
- lint/typecheck/build evidence where executable
- GitHub-hosted runner failures classified separately when no steps execute
