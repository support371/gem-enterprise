# TokMetric GPT Actions

TokMetric exposes bearer-protected server-to-server Action surfaces from the GEM Enterprise application. The core operations contract is stored at `openapi/tokmetric-actions.openapi.yaml`; the specialized-agent contract is stored at `openapi/tokmetric-specialized-agents.openapi.yaml`. Both use the production origin `https://gemcybersecurityassist.com`.

## Canonical production architecture

The public `/functions/*` routes run on Vercel and forward authorized requests to dedicated Supabase Edge gateways:

- `gem-tokmetric-gpt-gateway` for readiness and workspace reads.
- `gem-tokmetric-agent-gateway` for deterministic specialized-agent plans.

The bearer value is entered only in the Custom GPT Action authentication settings. Supabase stores only its SHA-256 hash in `tokmetric_gpt_credentials`, bound to one active GEM actor and one TokMetric workspace. The plaintext bearer is not committed to Git and is not required in Vercel when gateway mode is enabled.

## Required configuration

- `GEM_TOKMETRIC_GPT_GATEWAY_ENABLED=true`
- `GEM_TOKMETRIC_GPT_GATEWAY_URL`: canonical Supabase core gateway URL.
- `GEM_TOKMETRIC_AGENT_GATEWAY_ENABLED=true`
- `GEM_TOKMETRIC_AGENT_GATEWAY_URL`: canonical Supabase specialized-agent gateway URL.
- Active hashed credential row in `tokmetric_gpt_credentials`.
- Active internal/admin actor bound to the credential.
- Active TokMetric workspace bound to the credential.
- `TOKMETRIC_LIVE_PUBLISHING_ENABLED=false` during the controlled production launch.

`GPT_AUTH_TOKEN` and `TOKMETRIC_GPT_ACTOR_USER_ID` remain available only for the legacy direct-Prisma fallback. They should remain blank in the canonical Supabase-gateway deployment.

TikTok client credentials and token-encryption keys must remain unset until the approved OAuth integration is ready. Secrets must never appear in GPT instructions, knowledge files, OpenAPI text, screenshots, audit payloads, frontend code, or the repository.

## Authentication

Every endpoint requires:

```text
Authorization: Bearer <TokMetric Custom GPT bearer>
```

The Edge gateway hashes the supplied bearer and resolves an active credential record. The credential is workspace-scoped and actor-bound. Workspace-specific requests are rejected when the supplied workspace does not match that binding.

## Core operations

All core actions are `POST` requests under `/functions/<operation>`.

Read operations available during controlled launch:

- `gptSystemReadiness`
- `gptConnectorReadiness`
- `gptListAccounts`
- `gptListCampaigns`
- `gptGetCampaign`
- `gptListContent`
- `gptGetContent`
- `gptGetApprovalStatus`
- `gptGetPublishJobStatus`
- `gptGetAnalyticsSummary`
- `gptGetAuditHistory`

The following write operations remain defined for forward compatibility but return HTTP `423 CONTROLLED_WRITE_DISABLED` during controlled launch:

- `gptCreateCampaignDraft`
- `gptCreateContentDraft`
- `gptRunComplianceReview`
- `gptRequestApproval`
- `gptCreatePublishJob`

Human-reviewed changes must be performed from the authenticated GEM Enterprise Command Center until the write gate is formally activated.

## Specialized-agent operation

The specialized endpoint is:

```text
POST /functions/tokmetric/agent-plan
```

It supports the registered Content Strategist, Script Writer, Quality Reviewer, and Publishing Coordinator. In controlled production mode, it returns deterministic internal planning and review structures. It records an audit event, reports `externalActionTaken=false`, performs no publishing, changes no account setting, approves nothing, and spends no funds.

## Safety and truthfulness controls

- Bearer values are stored only as SHA-256 hashes.
- Credentials are bound to one actor and one TokMetric workspace.
- Cross-workspace requests return `WORKSPACE_FORBIDDEN`.
- Core GPT writes return `CONTROLLED_WRITE_DISABLED` during controlled launch.
- Specialized agents return internal plans only.
- Approval requests cannot approve themselves.
- Publishing requires a connected connector, exact-version approval, compliance clearance, an idempotency key, and open production gates.
- Internal queue completion is never represented as TikTok confirmation.
- Internal and external publishing states remain separate.
- Secret-like fields are redacted before responses are returned.
- Authorized and blocked GPT requests create audit records.

## Custom GPT configuration

1. Open the Custom GPT editor and create or edit the primary Action.
2. Set authentication to **API Key → Bearer**.
3. Enter the production TokMetric Custom GPT bearer supplied through the secure project handoff.
4. Paste `openapi/tokmetric-actions.openapi.yaml` into the primary schema field.
5. Add a second Action using `openapi/tokmetric-specialized-agents.openapi.yaml`.
6. Use the same bearer credential for both Actions.
7. Use the production workspace ID in workspace-scoped requests.
8. Add the privacy-policy URL: `https://gemcybersecurityassist.com/tokmetric/privacy-policy`.
9. Test `getTokMetricSystemReadiness` first.
10. Confirm `production_activation=BLOCKED` and `controlled_write_mode=COMMAND_CENTER_ONLY`.
11. Test connector readiness, account listing, content listing, audit history, and a specialized-agent plan.
12. Confirm a draft-write call returns HTTP `423 CONTROLLED_WRITE_DISABLED`.
13. Keep TikTok publishing blocked until OAuth approval, scopes, sandbox validation, compliance approval, and production authorization are complete.

## Expected controlled states

A healthy controlled-launch system may return:

- `GPT_AUTH_INVALID`
- `GPT_AUTH_EXPIRED`
- `GPT_ACTOR_INVALID`
- `WORKSPACE_FORBIDDEN`
- `CONTROLLED_WRITE_DISABLED`
- `CONNECTOR_NOT_READY`
- `APPROVAL_REQUIRED`
- `LIVE_PUBLISHING_DISABLED`
- `TOKMETRIC_LOCKED`

These are deliberate controls. They prevent the GPT from claiming or performing operations that GEM or TikTok has not yet authorized.
