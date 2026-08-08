# GEM Human Approval Register

This register prevents repeated approval requests. An item remains open until the required evidence is linked from the authoritative state ledger. Do not put credentials, tokens, personal data, or other secret values in this file.

## HA-001 — GitHub issue, remote, and pull-request authorization

- **State:** Open
- **Reason:** The delivery flow requires a tracked issue and pull request, but this workspace has no configured Git remote and `gh` is not authenticated.
- **Exact component:** `support371/gem-enterprise` repository governance.
- **Required evidence:** Issue URL containing objective, acceptance criteria, exclusions, risks, plan, and manual dependencies; pull-request URL tied to `docs/persistent-completion-ledger`; authenticated canonical remote.
- **What Codex already proved:** The work is isolated on a focused branch and the inspected baseline SHA is recorded without secrets.
- **What Codex must do after approval:** Push the committed branch, open or update the PR with test evidence, risks, manual dependencies, and rollback notes; then record URLs without exposing credentials.

## HA-002 — Canonical Vercel preview verification

- **State:** Open
- **Reason:** Only the canonical Vercel Git integration may provide the hosted preview gate; no second production deployment is authorized.
- **Exact component:** Vercel project `support371-gem-enterprise`.
- **Required evidence:** Canonical preview deployment identifier, commit SHA, successful preview verification/build logs, affected-route checks, and previous valid deployment identifier for rollback.
- **What Codex already proved:** Repository-side build orchestration and its non-secret hash were inspected; no duplicate deployment was initiated.
- **What Codex must do after approval:** Inspect the authorized preview evidence, reconcile it to the exact commit, run non-destructive smoke checks, and update the ledger accurately.

## HA-003 — Production database ownership and migration-state confirmation

- **State:** Open
- **Reason:** Production database access and migration execution are owner-controlled and must not be mutated from CI.
- **Exact component:** PostgreSQL/Prisma production persistence.
- **Required evidence:** Named accountable owner, sanitized migration status, compatibility assessment, backup/restore evidence, migration-specific rollback implications, and explicit execution approval if a migration is needed.
- **What Codex already proved:** The repository contains 32 migration files and recorded the schema hash; it did not mutate a production database.
- **What Codex must do after approval:** Compare authorized migration state, run safe compatibility checks, and update persistence status without converting it to `PASS` based only on schema files.

## HA-004 — GEM Studio Windows runtime and real-call acceptance

- **State:** Open
- **Reason:** Cloud execution cannot inspect Windows-local media state, and real visual/audio quality and consent require a person.
- **Exact component:** GEM controller, Pinokio/Decart, OBS/WebSocket/Virtual Camera, Voicemod, and real call flow.
- **Required evidence:** Positive `GEM_ASSIST_WINDOWS` environment classification; protected configuration hashes; controller security results; bounded soak log; process/listener ownership; recovery behavior; consented human visual/audio acceptance.
- **What Codex already proved:** No Windows or media readiness claim was made and media auto-start was not enabled from this session.
- **What Codex must do after approval:** Baseline before mutation, run the controller security matrix, observe sustained readiness, classify failures correctly, and record human acceptance separately from automated evidence.

## HA-005 — News Forge content and publication approval

- **State:** Open
- **Reason:** A real story, identity/consent, speech output, and publication decision are governance decisions; code completion cannot authorize production publication.
- **Exact component:** News Forge story-to-speech/publication flow.
- **Required evidence:** Owner-approved story, rights/identity/consent confirmation, successful controlled speech E2E result, and explicit publication approval.
- **What Codex already proved:** Nothing was activated and no operational claim was promoted to `PASS`.
- **What Codex must do after approval:** Run one controlled E2E test after security prerequisites pass, retain sanitized evidence, and leave automatic publication disabled unless separately approved.

## HA-006 — Notion provider consent and controlled publication

- **State:** Open
- **Reason:** OAuth/provider consent and publication identity cannot be automated or inferred.
- **Exact component:** Notion integration and publication target.
- **Required evidence:** Owner-granted provider consent, credential stored in an approved secret manager, negative publication test, one positive controlled-record test, identity/consent approval, and explicit publication approval.
- **What Codex already proved:** No provider credential or secret value was inspected, logged, or activated.
- **What Codex must do after approval:** Test rejection before success, constrain scope, record sanitized evidence, and preserve a credential-revocation rollback path.

## HA-007 — Release-candidate ownership and freeze approval

- **State:** Open
- **Reason:** Release approval cannot precede automated, cloud, local runtime, security, rollback, and governance evidence.
- **Exact component:** Final GEM release dossier and release-candidate freeze.
- **Required evidence:** Exact repository/branch/commit, package version, build hash, deployment artifact, controller package SHA-256, complete evidence directories, rollback dry-run results, and owner sign-off.
- **What Codex already proved:** Current evidence supports `NO-GO`; no release candidate or production deployment was declared.
- **What Codex must do after approval:** Freeze only after prerequisites pass, prohibit feature work, and create a new candidate plus affected retests for every release-blocking fix.

