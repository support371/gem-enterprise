# TokMetric OpenAPI contracts

## Canonical controlled-production schema

Use `tokmetric-custom-gpt-production.openapi.yaml` for the current GEM Enterprise Custom GPT Action.

It is the canonical controlled-launch contract because it:

- uses `https://www.gemcybersecurityassist.com` directly, avoiding the apex-to-`www` redirect that can remove the bearer authorization header;
- combines the verified TokMetric read operations and specialized internal planner in one Action schema;
- exposes no Custom GPT write operation during the controlled launch;
- preserves workspace isolation, redacted audit history, deterministic planning, human review, and `externalActionTaken=false`;
- leaves publishing, approvals, account connections, advertising, Shop writes, and other mutations inside the authenticated GEM Command Center.

The older `tokmetric-actions.openapi.yaml` and `tokmetric-specialized-agents.openapi.yaml` files are retained as legacy engineering references. Do not paste them into the active Custom GPT while their server entry uses the redirecting apex hostname.

## Authentication

Configure the Action as **API Key → Bearer** using a TokMetric GPT bearer credential whose SHA-256 hash is registered to the production workspace and active internal actor. Never place the bearer value in Git, documentation, screenshots, frontend code, logs, or knowledge files.

## Production workspace

The current controlled-production workspace identifier is:

```text
ws_60488340ded94dcfab3b875ef9ae591c
```

Live TikTok publishing remains blocked until platform authorization, connector readiness, exact-version approval, and the production activation gate all pass.