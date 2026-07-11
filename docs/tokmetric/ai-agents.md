# TokMetric Specialized Agents

TokMetric provides four controlled, workspace-aware agents. They create internal drafts and review artifacts only. None of the agents can publish, modify a TikTok account, approve its own output, spend advertising funds, or claim external platform success.

## Agent registry

| Agent | Purpose | Allowed outputs | Human approval |
| --- | --- | --- | --- |
| Content Strategist | Campaign concepts, audience hypotheses, and content plans | `campaign_brief`, `content_outline`, `audience_notes` | Required before downstream execution |
| Script Writer | Scripts, captions, hooks, and hashtags | `script`, `caption`, `hashtags` | Required before publishing |
| Quality Reviewer | Claim, disclosure, and safety review | `findings`, `recommended_changes`, `review_result` | Always required for material decisions |
| Publishing Coordinator | Internal publishing preparation and preflight | `publish_plan`, `job_request`, `preflight_report` | Always required |

## Runtime controls

Every run records or enforces:

- authenticated workspace access;
- registered agent and allowed output type;
- prompt version and model version;
- input and output hashes;
- structured output-schema validation;
- credential-pattern redaction and blocking;
- external-action and approval-bypass detection;
- workspace retrieval limited to safe operational context;
- human-review state;
- duration and zero-cost controlled-provider metadata;
- immutable domain events and audit events;
- `externalActionTaken=false`.

The initial provider is `tokmetric_controlled_rules`. It produces deterministic structured drafts without sending workspace data to an external model provider. An external model provider must not be enabled until provider-specific privacy, data-retention, cost, security, and evaluation controls are approved.

## Website API

Authenticated users use:

```text
GET  /api/tokmetric/agents?workspaceId=<id>&limit=25
POST /api/tokmetric/agents
```

POST body:

```json
{
  "workspaceId": "workspace-id",
  "agent": "content_strategist",
  "outputType": "campaign_brief",
  "brief": "Prepare an educational, compliance-conscious campaign outline."
}
```

The caller must have workspace access and the appropriate `agents` permission unless the caller is an internal or administrative user.

## Custom GPT endpoint

The bearer-protected Custom GPT uses:

```text
POST /functions/tokmetric/agent-plan
Authorization: Bearer <GPT_AUTH_TOKEN>
```

The configured `TOKMETRIC_GPT_ACTOR_USER_ID` must be an active user with access to the requested workspace. GPT-created runs are attributed to that actor and use `sourceChannel=custom_gpt`.

## Safety responses

A request may be blocked with:

- `AGENT_NOT_FOUND`
- `AGENT_OUTPUT_NOT_ALLOWED`
- `AGENT_SAFETY_BLOCKED`
- `GPT_ACTOR_NOT_CONFIGURED`
- `GPT_ACTOR_INVALID`
- `WORKSPACE_FORBIDDEN`
- `PERMISSION_DENIED`

Credential-like input is not preserved in the run evidence. The runtime stores hashes and safe findings instead of the raw secret-bearing brief.

## Operations page

The native console is available at:

```text
https://gemcybersecurityassist.com/tokmetric/agents
```

The page requires authentication, lists authorized workspaces, supports all registered agent outputs, and shows recent agent-run domain events.

## Production position

Agent output is assistance, not certification, legal advice, platform approval, or external execution. Human reviewers remain responsible for claims, disclosures, intellectual-property rights, product accuracy, account permissions, and final approval.
