# TokMetric oauth

Phase 2 implements the TikTok OAuth connector foundation without enabling live publishing.

## Implemented flows

- `GET /api/tokmetric/oauth/start?workspaceId=...&provider=TIKTOK_LOGIN_KIT` starts TikTok authorization for authenticated workspace members.
- `GET /api/tokmetric/oauth/callback` validates state, requires the initiating `gem_session`, exchanges an authorization code, and stores encrypted server-side credentials.
- `GET /api/tokmetric/connectors?workspaceId=...` returns account-safe connector state and never returns tokens or client secrets.
- `DELETE /api/tokmetric/connectors` disconnects or revokes a connector and deletes stored credential references.
- `POST /api/tokmetric/connectors/health?workspaceId=...` updates token-expiration-derived connector health.

## Security posture

TokMetric uses signed OAuth state containing only non-secret identifiers, server-side one-time OAuth authorization-attempt records for encrypted PKCE verifier storage, server-only TikTok token exchange, AES-256-GCM encrypted credential blobs, audit events, workspace membership plus `manage/connectors` permission checks, and truthful states. Missing configuration fails closed as `NOT_CONFIGURED`; TikTok Business and Shop connectors remain `PLATFORM_APPROVAL_REQUIRED` until product approval exists.

## Required environment variables

```bash
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://gemcybersecurityassist.com/api/tokmetric/oauth/callback
TIKTOK_ENVIRONMENT=sandbox
TOKMETRIC_TOKEN_ENCRYPTION_KEY=
TOKMETRIC_TIKTOK_OAUTH_ENABLED=false
```

No real secrets should be committed.
