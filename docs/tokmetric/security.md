# TokMetric security

Phase 2 adds TikTok OAuth controls:

- No TikTok passwords or browser cookies are collected.
- Access tokens and refresh tokens are encrypted server-side and never returned to browser APIs.
- OAuth state is HMAC signed and bound to workspace, provider, environment, actor, nonce, and PKCE verifier.
- Authorization callbacks require the initiating authenticated GEM session.
- Connector reads and writes enforce workspace membership.
- Token refresh, disconnect, revocation, authorization failure, and authorization success are audited through TokMetric audit events.
- Missing OAuth configuration fails closed and reports safe missing variable names only.
- `TOKMETRIC_LIVE_PUBLISHING_ENABLED=false` remains the production activation gate.
