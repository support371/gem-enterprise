# GEM Enterprise ChatGPT Integration

## Purpose

Expose a small, controlled GEM Enterprise surface that can be connected to ChatGPT without granting unrestricted repository or administrative access.

## Initial surface

The first deployment exposes `GET /api/chatgpt` as a non-destructive discovery/readiness endpoint. It advertises the intended capability groups while leaving privileged operations behind GEM's existing authentication and authorization controls.

Planned capability groups:

- `platform_status`
- `workspace_lookup`
- `client_status`
- `operations_status`
- `support_context`

## Security posture

- Read-only by default.
- No repository push capability is exposed through the public endpoint.
- No secrets are returned.
- No administrative mutation is enabled by this integration.
- Any future MCP tools that access protected GEM data must reuse server-side GEM authorization and fail closed when authorization is missing.

## Deployment

This branch is intended to produce a Vercel preview first. Verify `/api/chatgpt` on the preview before promoting any ChatGPT/MCP connector configuration to production.

## Next integration gate

After preview validation, implement the MCP transport/tool schema on top of authenticated GEM service functions rather than exposing internal APIs directly.
