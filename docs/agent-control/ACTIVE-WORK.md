# Active Work

Snapshot: 2026-08-11 UTC. Refresh live GitHub state before mutation.

## GEM Support Conversation Handoff

| Field | Value |
|---|---|
| TASK | [SUPPORT-CONVERSATION-HANDOFF](tasks/SUPPORT-CONVERSATION-HANDOFF.md) |
| OWNER | Codex / GEM support experience lane |
| SOURCE PR/ISSUE | User-reported repetitive Platform Support responses |
| BASE SHA | `ec6ad016cef7599d06155187e666ce7af820e75e` |
| WORKING BRANCH | `codex/support-conversation-handoff` |
| OWNED FILES/SCOPE | Support knowledge, orchestration, chat widget, human case conversation status, focused tests, this task record |
| FORBIDDEN OVERLAP | Auth and portal isolation; Prisma; credentials; integrations; news; IWW; unrelated active PR files |
| STATUS | IMPLEMENTED — LOCAL CODE GATES PASSED |
| BLOCKER CLASS | PREVIEW (hosted interactive verification pending) |
| LAST VERIFIED HEAD | `ec6ad016cef7599d06155187e666ce7af820e75e` |
| NEXT SAFE ACTION | Publish the exact branch, inspect its canonical Vercel deployment, and complete authenticated mobile acceptance. |

## GEM News Scroll Autoplay

| Field | Value |
|---|---|
| TASK | [NEWS-SCROLL-AUTOPLAY](tasks/NEWS-SCROLL-AUTOPLAY.md) |
| OWNER | Codex / GEM News experience lane |
| SOURCE PR/ISSUE | User-directed owner pre-production finishing |
| BASE SHA | `f084e96457ffa8480be9fadfbb0698bf489da5cd` |
| WORKING BRANCH | `codex/news-scroll-autoplay` |
| OWNED FILES/SCOPE | News feed/player coordination, playback URL controls, due-aware gateway ingestion, cadence SQL, focused tests, this task record |
| FORBIDDEN OVERLAP | PR #291/#292/#252 files; auth; Prisma; credentials; PR #334 catalogue files; IWW repository |
| STATUS | IMPLEMENTED — LOCAL GATES PASSED |
| BLOCKER CLASS | PROVIDER ACCESS (Supabase activation only) |
| LAST VERIFIED HEAD | `f084e96457ffa8480be9fadfbb0698bf489da5cd` |
| NEXT SAFE ACTION | Publish the exact frontend/gateway head and validate its canonical Vercel preview; keep Supabase activation blocked until project permission is available. |

## PR #291

| Field | Value |
|---|---|
| TASK | [PR-291-ledger](tasks/PR-291-ledger.md) |
| OWNER | ChatGPT Work / integration lane |
| SOURCE PR/ISSUE | PR #291 |
| BASE SHA | `1128771e2b8dfc767fb50a7394dee4b5de5a8544` |
| WORKING BRANCH | `codex/create-persistent-completion-ledger` |
| OWNED FILES/SCOPE | Four `artifacts/GEM-*` ledger files |
| FORBIDDEN OVERLAP | PR #292 files; application, Prisma, provider, deployment files |
| STATUS | PARTIAL |
| BLOCKER CLASS | SOURCE |
| LAST VERIFIED HEAD | `9e77433495c9aaec690cac904d6f1d033dafde37` |
| NEXT SAFE ACTION | Apply the four-file evidence correction on the existing branch, validate, publish, then bind checks to the resulting head. |

## PR #292

| Field | Value |
|---|---|
| TASK | [PR-292-security](tasks/PR-292-security.md) |
| OWNER | Codex / security implementation lane |
| SOURCE PR/ISSUE | PR #292 |
| BASE SHA | `1128771e2b8dfc767fb50a7394dee4b5de5a8544` |
| WORKING BRANCH | `security/telegram-credential-remediation` |
| OWNED FILES/SCOPE | `.github/workflows/secret-scan.yml`, `scripts/security/scan_tracked_secrets.py`, `docs/security/telegram-credential-remediation.md` |
| FORBIDDEN OVERLAP | PR #291 artifacts; control-plane docs; provider credential operations |
| STATUS | PARTIAL |
| BLOCKER CLASS | SECURITY |
| LAST VERIFIED HEAD | `6229339b36ec3c574b464b55ae77454cf04a36a7` |
| NEXT SAFE ACTION | Diagnose exact-head scanner failure, preserve containment scope, and prove deterministic redacted regression coverage. |

## PR #252

| Field | Value |
|---|---|
| TASK | [PR-252-intake-routing](tasks/PR-252-intake-routing.md) |
| OWNER | Jules / next independent implementation lane |
| SOURCE PR/ISSUE | PR #252 / issue #251 |
| BASE SHA | `1128771e2b8dfc767fb50a7394dee4b5de5a8544` |
| WORKING BRANCH | New focused branch from current `main`; old branch is `fix/251-applicant-routing-readiness` |
| OWNED FILES/SCOPE | Eligibility/intake routing files selected after current-main gap analysis |
| FORBIDDEN OVERLAP | PR #291, PR #292, control-plane files, unrelated auth/onboarding refactors |
| STATUS | BLOCKED |
| BLOCKER CLASS | SOURCE |
| LAST VERIFIED HEAD | Old PR head `3699dd5135acee4b5b1dc2c5c39674a195a5c666`; 41 commits behind current `main` |
| NEXT SAFE ACTION | Compare old intent with current main and reimplement only behavior still missing; do not rebase blindly. |
