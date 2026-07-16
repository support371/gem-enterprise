# TokMetric Custom GPT production activation

## Current production state

The GEM Enterprise TokMetric backend is deployed and verified on the canonical production origin:

```text
https://www.gemcybersecurityassist.com
```

The apex hostname redirects to `www`. Bearer credentials can be removed by clients during a cross-host redirect, so the Custom GPT Action must use the `www` origin directly.

The production workspace is:

```text
ws_60488340ded94dcfab3b875ef9ae591c
```

The controlled production state intentionally remains:

- live publishing disabled;
- no connected TikTok account;
- Custom GPT writes disabled;
- Command Center is the only write channel;
- specialized-agent output is internal, deterministic, audited, zero-cost, and always requires human review;
- external TikTok success is never inferred from internal state.

## Custom GPT editor configuration

1. Open the existing TokMetric Custom GPT in the ChatGPT editor.
2. Remove or disable the legacy TokMetric Actions that use `https://gemcybersecurityassist.com`.
3. Add one Action and paste the complete contents of:

   ```text
   openapi/tokmetric-custom-gpt-production.openapi.yaml
   ```

4. Set Authentication to **API Key** with **Bearer** authentication.
5. Enter the active TokMetric GPT bearer value. Do not place it in the schema, instructions, knowledge files, screenshots, or source repository.
6. Save the Action.
7. Test `getTokMetricSystemReadiness` first.
8. Use the returned `workspace_id` for workspace-scoped operations.
9. Test `getTokMetricConnectorReadiness`, `getTokMetricAuditHistory`, and `createTokMetricControlledAgentPlan`.
10. Confirm the planner reports `externalActionTaken=false` and `requiredHumanReview=true`.

## Expected readiness result

A healthy controlled-launch response includes:

```text
gpt_auth_configured=true
gpt_actor_configured=true
secure_credential_hashing_configured=true
production_activation=BLOCKED
controlled_write_mode=COMMAND_CENTER_ONLY
livePublishingEnabled=false
workspace_id=ws_60488340ded94dcfab3b875ef9ae591c
```

`production_activation=BLOCKED` is the correct state until TikTok authorization, connector readiness, exact-version approval, and formal production activation are complete.

## Automated smoke command

Run from a secure local or CI environment without printing the bearer:

```bash
TOKMETRIC_GPT_BEARER='<secret>' \
TOKMETRIC_WORKSPACE_ID='ws_60488340ded94dcfab3b875ef9ae591c' \
node scripts/tokmetric-custom-gpt-production-smoke.mjs
```

The script validates authenticated readiness, connector reads, the controlled planner, audit access, and missing-bearer rejection. It never creates content, approvals, publishing jobs, connectors, advertising activity, or Shop writes.