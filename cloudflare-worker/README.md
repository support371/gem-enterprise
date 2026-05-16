# GEM Enterprise — Cloudflare Worker Backend

Operational backend for GEM Enterprise, running on Cloudflare Workers with D1, R2, and KV.

## Architecture

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  Vercel (Next.js Frontend)  │────▶│  Cloudflare Worker (Backend) │
│  gemcybersecurityassist.com │     │  gem-enterprise-worker       │
│                             │     │                              │
│  • Pages / App Router       │     │  • Auth validation (JWT)     │
│  • Next.js API routes       │     │  • RBAC engine               │
│  • Prisma → PostgreSQL      │     │  • KYC service hooks         │
│  • Server-side rendering    │     │  • Document vault (R2)       │
└─────────────────────────────┘     │  • Service requests (D1)     │
                                    │  • Audit logging (D1)        │
                                    │  • Notifications (D1 + KV)   │
                                    └──────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run local D1 migrations
pnpm run db:migrate

# Start dev server (port 8787)
pnpm dev

# Type check
pnpm typecheck
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Service health check |
| GET | `/api/ready` | No | Readiness probe |
| GET | `/api/version` | No | Version info |
| POST | `/api/auth/validate` | No | Validate a JWT |
| GET | `/api/auth/session` | Yes | Current session |
| GET | `/api/rbac/permissions` | Yes | User permissions |
| POST | `/api/rbac/check` | Yes | Check permission |
| GET | `/api/rbac/roles` | Admin | List roles |
| POST | `/api/rbac/assign` | Admin | Assign role |
| POST | `/api/kyc/webhook` | Admin | KYC status webhook |
| GET | `/api/kyc/status/:id` | Yes | KYC status |
| GET | `/api/kyc/pending` | Analyst | Pending KYC list |
| POST | `/api/documents/upload` | Yes | Upload to R2 |
| GET | `/api/documents` | Yes | List documents |
| GET | `/api/documents/:id/download` | Yes | Download document |
| DELETE | `/api/documents/:id` | Admin | Soft-delete document |
| GET | `/api/service-requests` | Yes | List requests |
| POST | `/api/service-requests` | Yes | Create request |
| GET | `/api/service-requests/:id` | Yes | Get request |
| PATCH | `/api/service-requests/:id` | Yes | Update request |
| GET | `/api/audit/logs` | Admin | Query audit logs |
| GET | `/api/audit/logs/:id` | Admin | Get audit entry |
| GET | `/api/audit/summary` | Admin | Audit stats |
| GET | `/api/notifications` | Yes | List notifications |
| POST | `/api/notifications` | Admin | Create notification |
| POST | `/api/notifications/bulk` | Admin | Bulk send |
| PATCH | `/api/notifications/:id/read` | Yes | Mark read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all read |

## Cloudflare Services

| Service | Binding | Purpose |
|---------|---------|---------|
| D1 | `DB` | Audit logs, KYC events, service requests, notifications |
| R2 | `VAULT` | Document storage (encrypted at rest) |
| KV | `CACHE` | Session cache, rate limiting |

## Secrets

Set via `wrangler secret put <NAME>`:

```bash
wrangler secret put JWT_SECRET
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_ZONE_ID
```

## Deployment

```bash
# Dry run (validates config, does not deploy)
pnpm run deploy:dry

# Deploy to production
pnpm run deploy

# Deploy to staging
pnpm run deploy -- --env staging

# Apply D1 migrations to remote
pnpm run db:migrate:remote
```

## Project Structure

```
cloudflare-worker/
├── src/
│   ├── index.ts              # Hono app entry point
│   ├── routes/
│   │   ├── health.ts         # /api/health, /api/ready, /api/version
│   │   ├── auth.ts           # /api/auth/*
│   │   ├── rbac.ts           # /api/rbac/*
│   │   ├── kyc.ts            # /api/kyc/*
│   │   ├── documents.ts      # /api/documents/*
│   │   ├── service-requests.ts
│   │   ├── audit.ts          # /api/audit/*
│   │   └── notifications.ts  # /api/notifications/*
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification + RBAC middleware
│   │   ├── cors.ts           # CORS with origin whitelist
│   │   └── audit.ts          # Audit log helper
│   ├── types/
│   │   ├── env.ts            # Env bindings type
│   │   └── api.ts            # Response types
│   └── services/             # Business logic (future)
├── migrations/
│   └── 0001_initial_schema.sql
├── openapi/
│   └── spec.yaml
├── wrangler.toml
├── tsconfig.json
├── package.json
└── .env.example
```
