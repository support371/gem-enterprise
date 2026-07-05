# TokMetric External Blocker Register

| Blocker | Required for | Current action |
| --- | --- | --- |
| TikTok client key and secret | OAuth token exchange | Code paths implemented; connector remains `NOT_CONFIGURED` when absent. |
| TikTok redirect URI registration | OAuth callback | Use `https://gemcybersecurityassist.com/api/tokmetric/oauth/callback` once app settings are available. |
| TikTok product and scope approvals | Business, Shop, Content Posting production access | Business and Shop connectors remain `PLATFORM_APPROVAL_REQUIRED`. |
| Token encryption key | Server-side credential encryption | `TOKMETRIC_TOKEN_ENCRYPTION_KEY` placeholder only; no real value committed. |
| Production activation approval | Live publishing | `TOKMETRIC_LIVE_PUBLISHING_ENABLED=false` remains unchanged. |
