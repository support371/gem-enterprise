# Telegram Credential Remediation Runbook

## Purpose

Use this runbook when a Telegram bot credential is suspected or confirmed to have been exposed in source code, logs, screenshots, tickets, chat, documentation, deployment output, or another public surface.

## Immediate containment

1. Treat the affected Telegram credential as compromised even if no misuse is visible.
2. Do not paste the current or replacement token into GitHub issues, pull requests, Slack, email, screenshots, or application logs.
3. Revoke or regenerate the affected bot token through the authorized Telegram account owner workflow.
4. Store the replacement only in an approved server-side secret store for the environment that requires it.
5. Remove obsolete copies from deployment configuration after the replacement has been verified.

## Repository verification

The repository must satisfy all of the following before this incident can be considered code-side remediated:

- No real `.env`, `.env.local`, or environment-specific runtime secret file is tracked. Example/template files are allowed only when they contain placeholders.
- No Telegram Bot API token pattern is present in tracked source.
- No Telegram API URL contains an inline token.
- No Telegram credential is exposed through a `NEXT_PUBLIC_*` variable.
- Pull requests and pushes to `main` run `.github/workflows/secret-scan.yml` when GitHub Actions infrastructure is available.

Run locally with:

```bash
python scripts/security/scan_tracked_secrets.py
```

The scanner reports only file paths, line numbers, and rule names; it intentionally does not print secret values. Tracked runtime environment files are release-blocking findings, not warnings.

## Deployment verification

After provider-side rotation, when rotation is actually required:

1. Confirm the replacement secret is present in the intended environment without displaying its value.
2. Redeploy only when the affected workflow actually requires a new deployment to consume the rotated secret.
3. Exercise the minimum non-destructive Telegram health check needed to prove authentication succeeds.
4. Confirm logs, error pages, request traces, and monitoring output do not include the token.
5. Confirm the old credential no longer authenticates when a safe verification method is available.

## Evidence required for closure

Record only non-sensitive evidence:

- provider-side rotation timestamp, if rotation was required;
- environment(s) updated;
- repository secret-scan result;
- deployment or configuration identifier, when applicable;
- non-destructive workflow test result;
- confirmation that the old credential was revoked, if applicable;
- reviewer/owner approval.

Never record the old or new token value.

## Release boundary

Repository containment and provider credential rotation are separate controls. The repository scanner can prove tracked-source containment; it cannot prove provider-side revocation. If no exposed live credential is evidenced, do not invent a rotation requirement. If exposure is evidenced, keep the incident open until the authorized owner completes provider-side revocation/rotation and the dependent workflow is verified.
