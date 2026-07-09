# Platform Operations Agent — Production Activation

## Live API

Base URL:

`https://support371-gem-enterprise.vercel.app`

OpenAPI schema:

`https://support371-gem-enterprise.vercel.app/openapi/gem-platform-operations.yaml`

Protected operations:

- `GET /api/agent/health`
- `GET /api/agent/context`
- `GET /api/agent/commerce`
- `GET /api/agent/commerce?channel=tiktok`
- `GET /api/agent/commerce?channel=google`

## Required Vercel variables

Add these to the canonical Vercel project `support371-gem-enterprise` for Production:

- `GEM_AGENT_API_KEY`: a private random value with at least 32 characters
- `GEM_PUBLIC_APP_URL=https://www.gemcybersecurityassist.com`
- `GEM_AGENT_API_BASE_URL=https://support371-gem-enterprise.vercel.app`
- `TIKTOK_SELLER_ACCOUNT_CONNECTED=false`
- `GOOGLE_MERCHANT_ACCOUNT_CONNECTED=false`

The bridge may also use the existing `GPT_AUTH_TOKEN` as a compatibility fallback, but `GEM_AGENT_API_KEY` is the preferred dedicated credential.

Never commit the real credential.

## Required database variables

At least one pooled runtime URL must exist:

- `POSTGRES_PRISMA_URL`
- `DATABASE_URL`
- `POSTGRES_URL`
- `NEON_DATABASE_URL`

The intended production database is the clean Supabase project `supabase-charcoal-lens` with project reference `slzdjoqpzbkwzuaexlkj`.

## Platform Operations Agent Action

Import the live OpenAPI schema into the existing Platform Operations Agent.

Authentication:

- Type: API key
- Header: `X-GEM-Agent-Key`
- Value: the same private value stored as `GEM_AGENT_API_KEY` in Vercel

Do not place the key in GPT instructions or the schema.

## Verification

Without a configured key, the protected endpoints must return `503 agent_api_not_configured`.

With the wrong key, they must return `401 unauthorized`.

With the correct key:

- `/api/agent/health` returns platform and database health
- `/api/agent/context` returns platform, database, commerce and capability context
- `/api/agent/commerce?channel=tiktok` returns the GEM TikTok Shop page and approved Base44 TikTok storefront
- `/api/agent/commerce?channel=google` returns the GEM Google Store page and approved Base44 Google storefront

Keep write operations disabled until separate OAuth, permission and approval controls are implemented and verified.
