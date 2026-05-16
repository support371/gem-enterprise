# Cloudflare Backend Deployment Guide

## Prerequisites

1. **Cloudflare Account** with Workers, D1, R2, and KV enabled
2. **Wrangler CLI** — installed via `pnpm add -g wrangler` or `pnpm dlx wrangler`
3. **Node.js 20+** and **pnpm 10+**
4. **GitHub Secrets** configured for CI/CD (optional)

## Initial Setup

### 1. Authenticate Wrangler

```bash
wrangler login
```

### 2. Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create gem-enterprise-db
# Copy the database_id into wrangler.toml

# Create R2 bucket
wrangler r2 bucket create gem-enterprise-vault

# Create KV namespace
wrangler kv namespace create CACHE
# Copy the namespace id into wrangler.toml
```

### 3. Update `wrangler.toml`

Replace placeholder IDs with the real values from step 2:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gem-enterprise-db"
database_id = "YOUR_REAL_DATABASE_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_REAL_KV_NAMESPACE_ID"
```

### 4. Set Secrets

```bash
cd cloudflare-worker

# JWT secret — MUST match the Vercel frontend's JWT_SECRET
wrangler secret put JWT_SECRET

# Cloudflare API token (for DNS/cache/deploy operations)
wrangler secret put CLOUDFLARE_API_TOKEN

# Cloudflare Account ID
wrangler secret put CLOUDFLARE_ACCOUNT_ID

# Cloudflare Zone ID (for gemcybersecurityassist.com)
wrangler secret put CLOUDFLARE_ZONE_ID
```

### 5. Run D1 Migrations

```bash
# Local (for development)
pnpm run db:migrate

# Remote (for production)
pnpm run db:migrate:remote
```

### 6. Deploy

```bash
# First deployment
pnpm run deploy

# Verify
curl https://gem-enterprise-worker.<your-subdomain>.workers.dev/api/health
```

## CI/CD with GitHub Actions

The workflow at `.github/workflows/cloudflare-worker.yml` runs automatically when
files in `cloudflare-worker/` change.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers/D1/R2 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

Set these in **GitHub → Repository → Settings → Secrets and variables → Actions**.

### Workflow Behavior

- **Pull requests**: runs type checking only
- **Push to main**: runs type checking, then deploys to Cloudflare

## Environment Configuration

### Production

Default environment in `wrangler.toml`. Uses:
- `FRONTEND_URL = "https://www.gemcybersecurityassist.com"`
- `CORS_ORIGINS = "https://www.gemcybersecurityassist.com,https://gemcybersecurityassist.com"`

### Staging

```bash
wrangler deploy --env staging
```

### Development

```bash
pnpm dev
# Runs on http://localhost:8787
```

## Custom Domain (Optional)

To serve the Worker on a subdomain like `api.gemcybersecurityassist.com`:

1. Go to **Cloudflare Dashboard → Workers & Pages → gem-enterprise-worker**
2. Click **Settings → Triggers → Custom Domains**
3. Add `api.gemcybersecurityassist.com`
4. Update `CORS_ORIGINS` in `wrangler.toml` to include the new domain

## Monitoring

```bash
# Tail production logs
pnpm run tail

# Tail staging logs
wrangler tail --env staging
```

## Rolling Back

```bash
# List recent deployments
wrangler deployments list

# Roll back to a specific deployment
wrangler rollback <deployment-id>
```

## Troubleshooting

### "D1_ERROR: no such table"
Run migrations: `pnpm run db:migrate:remote`

### "Error: JWT_SECRET is not defined"
Set the secret: `wrangler secret put JWT_SECRET`

### CORS errors from frontend
Check `CORS_ORIGINS` in `wrangler.toml` includes your frontend URL.

### Worker exceeds CPU time limit
Check audit log queries — add date range filters to prevent full table scans.
