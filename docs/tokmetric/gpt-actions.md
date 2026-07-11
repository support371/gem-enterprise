# TokMetric GPT Actions

TokMetric exposes bearer-protected server-to-server action surfaces from the GEM Enterprise application. The core operations contract is stored at `openapi/tokmetric-actions.openapi.yaml`; the specialized-agent contract is stored at `openapi/tokmetric-specialized-agents.openapi.yaml`. Both use the production origin `https://gemcybersecurityassist.com`.

## Required environment variables

- `GPT_AUTH_TOKEN`: random shared bearer secret configured in both Vercel and the Custom GPT Action authentication settings.
- `TOKMETRIC_GPT_ACTOR_USER_ID`: active internal GEM `User.id` used to attribute GPT-created records and enforce workspace access.
- `TOKMETRIC_TOKEN_ENCRYPTION_KEY`: server-side token encryption key required before real connector credentials are stored.
- `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`: TikTok Developer credentials; leave unset until issued.
- `TOKMETRIC_LIVE_PUBLISHING_ENABLED=false`: production safety default. Do not enable before app approval, connector verification, and launch authorization.

Secrets must never appear in GPT instructions, knowledge files, OpenAPI text, screenshots, audit payloads, frontend code, or the repository.

## Authentication

Every endpoint requires:

```text
Authorization: Bearer <GPT_AUTH_TOKEN>
```

Authentication uses timing-safe comparison. Workspace-specific operations additionally resolve the configured GPT actor and require either an active workspace membership or an internal/admin role.

## Core operations

All core actions are `POST` requests under `/functions/<operation>`:

- `gptSystemReadiness`
- `gptConnectorReadiness`
- `gptListAccounts`
- `gptListCampaigns`
- `gptGetCampaign`
- `gptCreateCampaignDraft`
- `gptListContent`
- `gptGetContent`
- `gptCreateContentDraft`
- `gptRunComplianceReview`
- `gptRequestApproval`
- `gptGetApprovalStatus`
- `gptCreatePublishJob`
- `gptGetPublishJobStatus`
- `gptGetAnalyticsSummary`
- `gptGetAuditHistory`

## Specialized-agent operation

The controlled agent endpoint is:

```text
POST /functions/tokmetric/agent-plan
```

It supports the registered Content Strategist, Script Writer, Quality Reviewer, and Publishing Coordinator agents. The endpoint performs workspace retrieval, safety evaluation, schema validation, prompt/model version tracking, audit logging, and domain-event recording. It always reports `externalActionTaken=false`.

## Safety and truthfulness controls

- Campaign and content creation produces internal, immutable drafts only.
- Approval requests cannot approve themselves.
- Agent runs cannot publish, approve, spend funds, or modify account settings.
- Publishing requires an approved object hash bound to the exact content version.
- Publishing also requires a connected connector, an idempotency key, open emergency controls, and the live-publishing environment gate.
- Internal queue completion is not treated as TikTok confirmation.
- Internal and external publishing states remain separate.
- Secret-like fields are redacted before responses are returned.
- All GPT-attributed writes create audit and/or domain-event records.

## Custom GPT configuration

1. Open the Custom GPT editor and create an Action.
2. Set authentication to **API Key → Bearer**.
3. Paste the same value stored as `GPT_AUTH_TOKEN` in Vercel.
4. Paste `openapi/tokmetric-actions.openapi.yaml` into the primary schema field.
5. Add a second Action using `openapi/tokmetric-specialized-agents.openapi.yaml` for controlled agent plans.
6. Use the same bearer credential for both Actions.
7. Add the public privacy-policy URL:
   `https://gemcybersecurityassist.com/tokmetric/privacy-policy`
8. Test `getTokMetricSystemReadiness` first.
9. Test workspace reads and a safe agent draft before enabling any other write action.
10. Keep publishing blocked until TikTok approval and production activation are complete.

## Expected blocked states

A healthy pre-launch system may return:

- `GPT_ACTOR_NOT_CONFIGURED`
- `GPT_ACTOR_INVALID`
- `WORKSPACE_FORBIDDEN`
- `PERMISSION_DENIED`
- `AGENT_SAFETY_BLOCKED`
- `CONNECTOR_NOT_READY`
- `APPROVAL_REQUIRED`
- `LIVE_PUBLISHING_DISABLED`
- `TOKMETRIC_LOCKED`

These are controlled states, not false failures. They prevent the GPT from claiming or performing actions the platform is not authorized to complete.
