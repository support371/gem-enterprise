# PR #292 — Telegram Credential Containment

## Identity

- Owner: Codex / security implementation lane
- Source: PR #292
- Current main/base: `1128771e2b8dfc767fb50a7394dee4b5de5a8544`
- Source head: `6229339b36ec3c574b464b55ae77454cf04a36a7`
- Branch: `security/telegram-credential-remediation`
- Status: `PARTIAL`
- Primary blocker: `SECURITY`

## Objective

Fail closed when real runtime `.env` files or high-confidence Telegram
credential forms are tracked, while allowing approved templates.

## Owned files

- `.github/workflows/secret-scan.yml`
- `scripts/security/scan_tracked_secrets.py`
- `docs/security/telegram-credential-remediation.md`

## Requirements

- Preserve Telegram token, URL, and assignment detection.
- Permit approved environment templates only.
- Never print matched credential values; output paths/rules in redacted form.
- Add deterministic regression tests for allowed templates, tracked real
  runtime files, token literals, Bot API URLs, assignments, and redaction.
- Keep provider rotation/revocation, secret-store replacement, and
  non-sensitive operational verification as a separate human gate.

## Current evidence and blockers

The exact head changes three files and is zero commits behind the recorded
current main. Eleven Vercel statuses succeeded. `Tracked Secret Scan` run
`31323357431` and `Build Verification` run `31323357435` failed. These
failures prevent a completion claim until exact jobs, steps, logs, deterministic
tests, and redaction behavior are proven. Do not infer that provider rotation
occurred.

## Tests and merge gate

Run the scanner regression suite, scan the tracked tree, verify redacted output,
run applicable repository checks and `git diff --check`, then bind CI evidence
to the resulting exact head. Provider credential rotation remains
`HUMAN_REQUIRED` even after code-side containment passes. Apply
[merge gates](../MERGE-GATES.md). Rollback point:
`6229339b36ec3c574b464b55ae77454cf04a36a7` until a newer owned head exists.
