# GEM Enterprise — Backend Runbook

Operational runbook for the Cloudflare Worker backend (`gem-enterprise-worker`).

## Service Overview

| Property | Value |
|----------|-------|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| Object Storage | Cloudflare R2 |
| Cache | Cloudflare KV |
| Auth | JWT (shared secret with Vercel frontend) |
| Monitoring | `wrangler tail` / Cloudflare Dashboard |

## Health Checks

### Health Endpoint

```bash
curl https://gem-enterprise-worker.<subdomain>.workers.dev/api/health
```

Expected response (healthy):
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "services": { "d1": "ok", "r2": "ok", "kv": "ok" }
}
```

### Readiness Endpoint

```bash
curl https://gem-enterprise-worker.<subdomain>.workers.dev/api/ready
```

Returns `200` when all dependencies (D1, R2, KV, secrets) are available, `503` otherwise.

## Common Operations

### View Live Logs

```bash
cd cloudflare-worker
pnpm run tail
```

### Deploy a New Version

```bash
cd cloudflare-worker
pnpm install --frozen-lockfile
pnpm typecheck
pnpm run deploy
```

### Apply Database Migrations

```bash
cd cloudflare-worker

# Preview migration (local)
pnpm run db:migrate

# Apply to production
pnpm run db:migrate:remote
```

### Rotate JWT Secret

1. Generate a new secret: `openssl rand -hex 32`
2. Update in Cloudflare Worker: `wrangler secret put JWT_SECRET`
3. Update in Vercel: Dashboard → Settings → Environment Variables → `JWT_SECRET`
4. Redeploy both services
5. Existing sessions will be invalidated (users must re-login)

### Rotate Cloudflare API Token

1. Create a new token in Cloudflare Dashboard → My Profile → API Tokens
2. Update: `wrangler secret put CLOUDFLARE_API_TOKEN`
3. Update GitHub Secret: `CLOUDFLARE_API_TOKEN`
4. Revoke the old token in Cloudflare Dashboard

## Incident Response

### Worker Returns 503

1. Check health endpoint: `curl .../api/health`
2. Identify which service is down (`d1`, `r2`, or `kv`)
3. Check Cloudflare Status: https://www.cloudflarestatus.com/
4. If D1 is down: check for pending migrations, verify database exists
5. If R2 is down: check bucket exists, verify bucket name in `wrangler.toml`
6. Tail logs for errors: `pnpm run tail`

### High Error Rate

1. Tail logs: `pnpm run tail`
2. Check if errors are auth-related (expired JWTs, wrong secret)
3. Check if errors are D1-related (query timeouts, missing tables)
4. Check audit log summary: `GET /api/audit/summary?hours=1`
5. If needed, roll back: `wrangler rollback <deployment-id>`

### Data Corruption / Accidental Deletion

1. D1 supports point-in-time recovery (Enterprise plan)
2. R2 objects are not deleted immediately — `document_vault` has `deleted_at` soft delete
3. Check audit logs for the mutation that caused the issue
4. For R2, objects can be restored if not permanently purged

### Authentication Failures

1. Verify JWT_SECRET matches between Worker and Vercel
2. Check token expiration (7-day default)
3. Check CORS configuration if requests fail from browser
4. Tail logs for specific error messages

## Alerting

### Recommended Alerts (Cloudflare Dashboard → Notifications)

| Alert | Condition | Action |
|-------|-----------|--------|
| Worker Error Rate | > 5% over 5 min | Check logs, roll back if needed |
| D1 Latency | p95 > 500ms | Check query patterns, add indexes |
| R2 Error Rate | > 1% over 5 min | Check bucket config |
| Worker CPU Time | p95 > 30ms | Optimize hot paths |

## Security Checklist

- [ ] JWT_SECRET is unique and >= 32 characters
- [ ] JWT_SECRET matches between Worker and Vercel frontend
- [ ] CLOUDFLARE_API_TOKEN has minimum required permissions
- [ ] CORS_ORIGINS whitelist is correct (no wildcards in production)
- [ ] No secrets in `wrangler.toml` or committed `.env` files
- [ ] Audit logging is enabled for all mutations
- [ ] Role assignment endpoint blocks escalation to super_admin/internal
- [ ] File upload validates type and size limits
- [ ] D1 queries use parameterized statements (no SQL injection)

## Architecture Decisions

### Why D1 instead of PostgreSQL?

The Vercel frontend uses PostgreSQL (via Prisma) for the primary data store.
The Worker uses D1 for operational data (audit logs, KYC events, notifications)
that benefits from edge proximity and doesn't need cross-service transactions.
This avoids the complexity of connecting Workers to an external PostgreSQL instance.

### Why R2 for Documents?

R2 provides S3-compatible object storage with zero egress fees, making it ideal
for document storage. Documents uploaded via the Worker are stored in R2 and
tracked in D1 for metadata/access control.

### Why Hono?

Hono is a lightweight, type-safe web framework designed for Cloudflare Workers.
It provides Express-like routing with middleware support and has first-class
Workers compatibility with minimal overhead.
