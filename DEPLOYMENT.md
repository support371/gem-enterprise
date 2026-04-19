# GEM Enterprise — Vercel Deployment Guide

## Stack

Next.js 16 · Prisma 5 · PostgreSQL · Vercel

---

## Required Environment Variables

Add every variable below in **Vercel Dashboard → Project → Settings →
Environment Variables**. Do not place real values in `vercel.json` or commit
them to the repository.

| Variable | Required | Build-time | Description |
|----------|----------|-----------|-------------|
| `DATABASE_URL` | **Yes** | Yes | PostgreSQL connection string. Use a pooler for serverless (Neon, Supabase, PgBouncer). Example: `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | **Yes** | Yes | Minimum 32 characters. Generate: `openssl rand -hex 32`. App throws at runtime if absent or equal to the default dev value. |
| `ANTHROPIC_API_KEY` | No | No | Anthropic key for GEM Concierge chat. If absent, falls back to rule-based replies — no build failure. |
| `NEXT_PUBLIC_AI_DISCLOSURE_TEXT` | **Yes** | Yes | Disclosure text shown before the first AI message. SHA-256 of this string is stored in `consent_records`. Keep stable — changing it invalidates prior consent receipts. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Yes | Canonical URL, e.g. `https://gem-enterprise.com` |
| `NEXT_PUBLIC_APP_NAME` | **Yes** | Yes | Display name, e.g. `GEM Enterprise` |
| `SMTP_HOST` | **Yes** | No | SMTP server hostname |
| `SMTP_PORT` | **Yes** | No | `587` for TLS, `465` for SSL |
| `SMTP_USER` | **Yes** | No | SMTP username / sending address |
| `SMTP_PASS` | **Yes** | No | SMTP password or app-password |
| `EMAIL_FROM` | **Yes** | No | Display name + address, e.g. `GEM Enterprise <noreply@example.com>` |
| `ADMIN_EMAIL` | **Yes** | No | Email for the initial admin account (used by seed script once) |
| `ADMIN_INITIAL_PASSWORD` | **Yes** | No | Temporary password. **Change immediately after first login.** |
| `AUDIT_ENABLED` | No | No | Set `true` to write audit events to `audit_logs`. |

> `vercel.json` references these as `@secret_name` placeholders. The placeholders
> only resolve if the corresponding secret is added in Vercel Project Settings.
> No real values are stored in the repository.

---

## Manual Deployment Steps — Exact Order

### Step 1 — Add secrets in Vercel Project Settings

In the Vercel dashboard, go to **Project → Settings → Environment Variables**
and add each variable from the table above.

For the Vercel CLI alternative:

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_AI_DISCLOSURE_TEXT
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add EMAIL_FROM
vercel env add ADMIN_EMAIL
vercel env add ADMIN_INITIAL_PASSWORD
vercel env add AUDIT_ENABLED
```

### Step 2 — Trigger a Vercel redeploy

After adding all variables, force a redeploy so the build picks up the new
values (build-time variables are baked in at build time):

```bash
vercel redeploy --force
```

Or click **Redeploy** in the Vercel dashboard on the most recent deployment.

### Step 3 — Apply database migrations

Vercel does not run `prisma migrate deploy` automatically. Run this once from
a machine with a direct connection to the target Postgres instance:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

This applies both pending migrations in order:

1. `20260318000001_init` — all base tables, enums, FK constraints
2. `20260318000002_add_support_ai_runtime` — support sessions, AI runs,
   consent records, escalation events

Confirm the output shows both migrations applied with no errors.

### Step 4 — Seed the initial admin account (first deployment only)

```bash
DATABASE_URL="..." \
ADMIN_EMAIL="admin@example.com" \
ADMIN_INITIAL_PASSWORD="replace-this" \
npm run db:seed
```

**Change the admin password immediately after first login** via `/app/security`.

### Step 5 — Smoke tests

Run these checks against the deployed preview or production URL in order.

#### Auth and protected routes

```
GET  /                          → 200, page renders
GET  /client-login              → 200, login form renders
GET  /app/dashboard             → 302 → /client-login  (no cookie)
GET  /app/admin                 → 302 → /client-login  (no cookie)
GET  /kyc/start                 → 302 → /client-login  (no cookie)
GET  /decision/pending          → 302 → /client-login  (no cookie)
GET  /portal                    → 302 → /client-login  (no cookie)

POST /api/auth/login            body: { email, password } (wrong creds)
                                → 401

POST /api/auth/login            body: { email, password } (correct creds)
                                → 200, Set-Cookie: gem_session

GET  /app/dashboard             (with valid cookie)  → 200
GET  /app/admin                 (client cookie)      → 302 → /app/dashboard
GET  /app/admin                 (admin cookie)       → 200
```

#### Support consent

```
POST /api/support/session
     → 201, returns { sessionId }
     → verify row exists in support_sessions table

POST /api/support/consent       body: { sessionId, accepted: true }
     → 200
     → verify support_sessions.consent_given = true in DB

POST /api/support/message       body: { sessionId, message: "..." }
     → 200, returns { reply }
     → verify messages JSONB column updated in support_sessions
```

#### AI governance — disclosure gate

```
POST /api/assistant/session
     body: { profileId: "PRF-005", consentGiven: false, disclosureTextHash: "x" }
     → 422  "AI session cannot start without disclosure acceptance"

POST /api/assistant/session
     body: { profileId: "PRF-005", consentGiven: true, disclosureTextHash: "<sha256 of NEXT_PUBLIC_AI_DISCLOSURE_TEXT>" }
     → 201, returns { sessionId }
     → verify row in ai_runs AND consent_records tables
```

#### AI escalation

```
POST /api/assistant/message
     body: { sessionId: "<id>", message: "What is my account balance?" }
     → 200, { escalated: false, response: "..." }
     → verify ai_runs.message_count incremented

POST /api/assistant/message
     body: { sessionId: "<id>", message: "You should invest in this stock" }
     → 200, { escalated: true, restrictedClass: "FINANCIAL_ADVICE" }
     → verify row in ai_escalation_events
     → verify ai_runs.escalation_triggered = true, output_status = "escalated"

POST /api/assistant/message     (same session, after escalation)
     → 409  "Session has been escalated"
```

#### Audit trail

```sql
SELECT action, resource, resource_id, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
-- Expected rows: ai_session_opened, ai_message_responded, ai_message_escalated
```

---

## Local Development

```bash
cp .env.example .env.local
# Fill in .env.local with real values

npm install
npm run db:generate      # generates Prisma client
npx prisma migrate deploy  # or: npx prisma db push (dev only)
npm run db:seed
npm run dev
```

---

## Notes

- `JWT_SECRET` must be at least 32 characters. The app throws at startup in
  production if the variable is absent or equal to the default dev placeholder.
- `NEXT_PUBLIC_*` variables are embedded at build time. A redeploy is required
  after changing them.
- `consent_records` rows must not be deleted — they are the audit trail for
  AI disclosure acceptance.
- The `lodash` moderate CVE (transitive from `recharts`) has no upstream fix.
  No lodash 5.x exists. Risk accepted; attack surface is internal to recharts.
