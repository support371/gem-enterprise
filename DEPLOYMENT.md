# GEM Enterprise — Deployment Checklist

## Stack

Next.js 16 · Prisma · PostgreSQL · Vercel

---

## Vercel Project Settings

Add all secrets via **Vercel dashboard → Project → Settings → Environment Variables**
or `vercel env add`. Never commit real values.

### Required — Database

| Variable | Environments | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Production, Preview | PostgreSQL URL. Use a connection pooler for serverless (PgBouncer / Neon / Supabase pooler). Format: `postgresql://USER:PASS@HOST:PORT/DB?sslmode=require` |

### Required — Authentication

| Variable | Environments | Notes |
|----------|-------------|-------|
| `JWT_SECRET` | Production, Preview | **Minimum 32 chars.** Generate: `openssl rand -hex 32`. App throws at startup if absent or uses the default dev value. |

### Required — AI Governance

| Variable | Environments | Notes |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | Production, Preview | Anthropic key for GEM Concierge chat. If absent the widget uses rule-based fallback replies — no build failure. |
| `NEXT_PUBLIC_AI_DISCLOSURE_TEXT` | Production, Preview | Disclosure text shown before first AI message. SHA-256 is stored in `consent_records`. Keep stable — changing it invalidates prior consent receipts. |

### Required — Email

| Variable | Environments | Notes |
|----------|-------------|-------|
| `SMTP_HOST` | Production | SMTP server hostname |
| `SMTP_PORT` | Production | 587 (TLS) or 465 (SSL) |
| `SMTP_USER` | Production | SMTP username |
| `SMTP_PASS` | Production | SMTP password or app-password |
| `EMAIL_FROM` | Production | e.g. `GEM Enterprise <noreply@gem-enterprise.com>` |

### Required — Application

| Variable | Environments | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_APP_URL` | Production | Canonical URL, e.g. `https://gem-enterprise.com` |
| `NEXT_PUBLIC_APP_NAME` | All | Display name. Default: `GEM Enterprise` |
| `AUDIT_ENABLED` | Production | Set `true` to write audit events to the database. |

### First-deployment only — Admin bootstrap

| Variable | Environment | Notes |
|----------|-------------|-------|
| `ADMIN_EMAIL` | Production | Email for the initial admin account. |
| `ADMIN_INITIAL_PASSWORD` | Production | Temporary password. **Change immediately after first login.** |

---

## Vercel CLI Setup

```bash
vercel link --project gem-enterprise

vercel secrets add database_url      "postgresql://..."
vercel secrets add jwt_secret        "$(openssl rand -hex 32)"
vercel secrets add anthropic_api_key "sk-ant-..."
vercel secrets add next_public_ai_disclosure_text "GEM Concierge is an AI assistant..."
vercel secrets add smtp_host         "smtp.example.com"
vercel secrets add smtp_port         "587"
vercel secrets add smtp_user         "noreply@gem-enterprise.com"
vercel secrets add smtp_pass         "..."
vercel secrets add next_public_app_url "https://gem-enterprise.com"
```

---

## First Deployment Steps

1. Set all env vars above in Vercel.
2. Push to `main` — Vercel runs `npm run db:generate && npm run build` automatically.
3. **Apply database migrations** (Vercel does not run this automatically):
   ```bash
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   ```
4. **Seed initial admin** (once):
   ```bash
   DATABASE_URL="<production-url>" npm run db:seed
   ```
5. Verify `/api/health` returns `200`.

---

## Preview Deployments

Use a **separate preview database** (`DATABASE_URL` pointing to a different DB)
to avoid polluting production data. Preview branches are auto-deployed by Vercel
on every PR.

---

## Post-Deploy Verification Checklist

- [ ] `/api/health` returns `{ "ok": true }`
- [ ] Homepage loads; navigation works
- [ ] `/client-login` accepts credentials; session cookie is set
- [ ] `/app/dashboard` is accessible after login; redirects to `/client-login` when unauthenticated
- [ ] `/app/admin` is accessible only for `admin` / `internal` roles
- [ ] KYC flow (`/kyc/start` → `/kyc/status`) completes without errors
- [ ] GEM Concierge chat widget requires disclosure acceptance before first message
- [ ] AI escalation routes to advisor message for financial/legal/security queries
- [ ] Audit log entries appear in `audit_logs` table after login and AI session open

---

## Security Notes

- **`JWT_SECRET`** must not use the default dev value in production. The app throws at startup if it does.
- **`ANTHROPIC_API_KEY`** must never use the `NEXT_PUBLIC_` prefix.
- Rotate `JWT_SECRET` and re-deploy to invalidate all active sessions.
- `consent_records` are append-only. Do not delete rows from this table.
