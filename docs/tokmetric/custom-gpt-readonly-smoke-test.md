# TokMetric Custom GPT read-only smoke test

This workflow verifies that the deployed TokMetric Custom GPT Action surface is reachable, bearer-protected, workspace-authorized, and able to complete the expected read-only flow without performing any external TikTok write.

## What it tests

The workflow calls these production Actions:

- `gptSystemReadiness`
- `gptConnectorReadiness`
- `gptListAccounts`
- `gptListCampaigns`
- `gptListContent`
- `gptGetAnalyticsSummary`
- `gptGetAuditHistory`

It also verifies that:

- requests without bearer authentication return `401`;
- unsupported actions return `404`;
- `GPT_AUTH_TOKEN`, `TOKMETRIC_GPT_ACTOR_USER_ID`, and `TOKMETRIC_TOKEN_ENCRYPTION_KEY` are configured in production;
- the configured GPT actor can access the selected workspace;
- live publishing remains `BLOCKED` during pre-approval verification;
- no campaign, content, approval, publishing, connector, or TikTok account state is changed.

## Required configuration

### Vercel production environment

Configure these values in the `support371-gem-enterprise` project:

```text
GPT_AUTH_TOKEN=<random server-side bearer secret>
TOKMETRIC_GPT_ACTOR_USER_ID=<active internal GEM User.id>
TOKMETRIC_TOKEN_ENCRYPTION_KEY=<server-side encryption key>
TOKMETRIC_LIVE_PUBLISHING_ENABLED=false
```

### GitHub Actions repository secret

Create this repository secret:

```text
TOKMETRIC_GPT_AUTH_TOKEN
```

Its value must exactly match the production `GPT_AUTH_TOKEN`. Never place the value in workflow inputs, source files, issues, screenshots, logs, GPT instructions, or OpenAPI documents.

## Running the verification

1. Open the repository **Actions** tab.
2. Select **TokMetric Custom GPT Read-Only Smoke Test**.
3. Choose **Run workflow**.
4. Keep the production origin as `https://gemcybersecurityassist.com`.
5. Enter an authorized TokMetric workspace ID.
6. Run the workflow.
7. Download the sanitized `tokmetric-gpt-readonly-smoke-report` artifact.

A passing run confirms the production Action transport, bearer authentication, service actor, workspace authorization, and read-only data flow. It does not confirm TikTok OAuth, media upload, publishing, or webhook confirmation.

## Failure meanings

- `401`: bearer secret is missing or does not match production.
- `GPT_ACTOR_NOT_CONFIGURED`: `TOKMETRIC_GPT_ACTOR_USER_ID` is absent.
- `GPT_ACTOR_INVALID`: the configured user does not exist or is inactive.
- `WORKSPACE_FORBIDDEN`: the service actor is not internal/admin and lacks active membership in the selected workspace.
- `WORKSPACE_NOT_FOUND`: the supplied workspace ID is incorrect.
- `LIVE_PUBLISHING_ENABLED`: production safety configuration is incorrect for this pre-approval stage.

## Next verification after this passes

Run a separate controlled workflow that creates one disposable campaign draft and one disposable content draft, performs compliance review, requests human approval, and confirms that publishing remains blocked until a genuine approval and connected TikTok connector exist. That workflow must use clearly labeled test records and must never claim external TikTok success.
