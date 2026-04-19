# GEM Enterprise — Deployment & Smoke Check Checklist

Use this document for every production deployment and for pre-deployment review. Work through each section in order. Do not mark a step complete until it has been verified.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Environment Variables Setup](#vercel-environment-variables-setup)
3. [Database Migration Steps](#database-migration-steps)
4. [Admin Setup Steps](#admin-setup-steps)
5. [Post-Deployment Smoke Checks](#post-deployment-smoke-checks)
6. [Rollback Procedure](#rollback-procedure)

---

## Pre-Deployment Checklist

Complete all items before merging to `main` or triggering a production deployment.

### Code Quality

- [ ] All TypeScript errors resolved — `npm run build` completes with zero errors
- [ ] ESLint passes with no new warnings — `npm run lint`
- [ ] All tests pass — `npm test`
- [ ] No `console.log` or debug statements left in production code
- [ ] No hardcoded secrets, API keys, or credentials in source code
- [ ] `.env.local` and any real `.env` files are listed in `.gitignore`

### Security Review

- [ ] New API routes have appropriate auth checks (middleware or explicit session validation)
- [ ] Admin-only routes check `role === "ADMIN"` before processing
- [ ] User input is validated and sanitised before database writes
- [ ] File uploads (KYC documents) enforce MIME type and size limits
- [ ] CORS headers are correctly configured for the production domain
- [ ] HTTP security headers are present (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### Database

- [ ] All new Prisma migrations have been generated with `npx prisma migrate dev`
- [ ] Migration files are committed to the repository
- [ ] The seed script works correctly in a clean database — `npx prisma db seed`
- [ ] No breaking schema changes that require a data migration script
- [ ] Indexes exist on frequently queried columns (userId, status, createdAt)

### Environment Variables

- [ ] `.env.example` is up to date with all required variables
- [ ] All required variables are set in the Vercel dashboard (see section below)
- [ ] `JWT_SECRET` is at least 32 characters and unique to production
- [ ] `ADMIN_INITIAL_PASSWORD` is a strong temporary password
- [ ] `DATABASE_URL` points to the production PostgreSQL instance
- [ ] SMTP credentials are valid and tested

### Vercel Configuration

- [ ] `vercel.json` is present with `"framework": "nextjs"`
- [ ] Build command is `npm run build`
- [ ] Install command is `npm ci`

---

## Vercel Environment Variables Setup

### Step 1 — Navigate to Environment Variables

1. Open the [Vercel dashboard](https://vercel.com/dashboard).
2. Select the **GEM Enterprise** project.
3. Go to **Settings → Environment Variables**.

### Step 2 — Create Vercel Secrets

For sensitive values, create encrypted secrets using the Vercel CLI before referencing them:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Create secrets (run once per secret)
vercel secrets add database_url "postgresql://user:pass@host:5432/gem_enterprise"
vercel secrets add jwt_secret "your-min-32-char-secret-here"
vercel secrets add smtp_host "smtp.example.com"
vercel secrets add smtp_port "587"
vercel secrets add smtp_user "noreply@gem-enterprise.com"
vercel secrets add smtp_pass "your-smtp-password"
```

Secrets are referenced in `vercel.json` using the `@secret_name` syntax and are already wired up.

### Step 3 — Set Plain Environment Variables

Add these directly in the Vercel dashboard (not as secrets, as they are not sensitive):

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://gem-enterprise.com` | Production |
| `NEXT_PUBLIC_APP_NAME` | `GEM Enterprise` | All |
| `NODE_ENV` | `production` | Production |
| `ADMIN_EMAIL` | `admin@gem-enterprise.com` | Production |
| `ADMIN_INITIAL_PASSWORD` | `<strong-temp-password>` | Production |
| `EMAIL_FROM` | `GEM Enterprise <noreply@gem-enterprise.com>` | Production |
| `AUDIT_ENABLED` | `true` | Production |

### Step 4 — Pull Variables Locally

After setting all variables in Vercel, sync them to your local environment:

```bash
vercel env pull .env.local
```

This overwrites `.env.local` with the current Vercel environment variables.

---

## Database Migration Steps

### First Deployment (New Database)

Run these steps the first time the application is deployed to a new database instance.

```bash
# 1. Ensure DATABASE_URL is pointing to the production database
echo $DATABASE_URL

# 2. Apply the full schema (creates all tables)
npx prisma migrate deploy

# 3. Verify the migration completed successfully
npx prisma migrate status

# 4. Seed reference data and create the admin user
npx prisma db seed
```

### Subsequent Deployments (Existing Database)

For routine deployments with schema changes:

```bash
# 1. Apply any pending migrations (safe — does not drop data)
npx prisma migrate deploy

# 2. Verify migration status
npx prisma migrate status
```

**Important:** Never run `npx prisma db push` against a production database. Always use `npx prisma migrate deploy` to apply version-controlled migrations.

### Verifying the Migration

```bash
# Connect with Prisma Studio to visually verify the schema
npx prisma studio

# Or check migration history directly in the database
# SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 10;
```

---

## Admin Setup Steps

### Creating the Initial Admin Account

The seed script creates an admin account using the `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` environment variables.

```bash
# Run the seed script (idempotent — safe to run multiple times)
npx prisma db seed
```

### Verifying Admin Access

1. Navigate to `https://gem-enterprise.com/client-login`.
2. Sign in with `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`.
3. Confirm you are redirected through `/access/continue` to `/app/dashboard`.
4. Navigate to `/app/admin` and verify the admin panel loads.
5. Verify you can access `/app/admin/kyc`, `/app/admin/users`, `/app/admin/approvals`, and `/app/admin/allocations`.

### Changing the Admin Password

Immediately after verifying admin access:

1. Navigate to `/app/security`.
2. Change the password to a strong, unique password (minimum 16 characters, mixed case, numbers, and symbols).
3. Store the new password in your organisation's password manager.
4. Remove `ADMIN_INITIAL_PASSWORD` from the Vercel environment variables or set it to an empty string.

### Promoting Additional Admins

To promote an existing user to admin role via the admin panel:

1. Go to `/app/admin/users`.
2. Search for the target user.
3. Change their role to `ADMIN`.

Or via the database directly:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'new-admin@gem-enterprise.com';
```

---

## Post-Deployment Smoke Checks

Run these checks immediately after every deployment. All checks should pass before announcing the deployment complete.

### Infrastructure

- [ ] `GET /api/health` returns `200 { "status": "ok" }`
- [ ] `GET /api/routes` returns `200` with a routes array
- [ ] Database connectivity is healthy (health check should confirm this)

### Public Routes

- [ ] `GET /` returns `200` — landing page renders correctly
- [ ] `GET /intel` returns `200`
- [ ] `GET /assets` returns `200`
- [ ] `GET /about` returns `200`
- [ ] `GET /contact` returns `200`
- [ ] `GET /get-started` returns `200`
- [ ] `GET /eligibility` returns `200`
- [ ] `GET /privacy` returns `200`
- [ ] `GET /terms` returns `200`
- [ ] `GET /compliance-notice` returns `200`

### Authentication

- [ ] `GET /client-login` returns `200` — login form renders
- [ ] `POST /api/auth/login` with invalid credentials returns `401`
- [ ] `POST /api/auth/login` with valid admin credentials returns `200` and sets cookie
- [ ] `GET /api/auth/session` without cookie returns `401`
- [ ] `GET /api/auth/session` with valid cookie returns `200` and user object
- [ ] `POST /api/auth/logout` with valid cookie returns `200` and clears cookie

### Auth Gating (Unauthenticated)

- [ ] `GET /app/dashboard` (no cookie) redirects to `/client-login`
- [ ] `GET /app/admin` (no cookie) redirects to `/client-login`
- [ ] `GET /kyc/start` (no cookie) redirects to `/client-login`
- [ ] `GET /decision/pending` (no cookie) redirects to `/client-login`

### Auth Gating (Non-Admin)

- [ ] `GET /app/admin` with a `CLIENT` role session returns `403` or redirects appropriately
- [ ] `GET /api/admin/kyc` with a `CLIENT` role session returns `403`
- [ ] `GET /api/admin/users` with a `CLIENT` role session returns `403`

### KYC Flow

- [ ] `GET /kyc/start` (authenticated) returns `200`
- [ ] `GET /kyc/individual` (authenticated) returns `200`
- [ ] `GET /kyc/upload` (authenticated) returns `200`
- [ ] `GET /kyc/review` (authenticated) returns `200`
- [ ] `GET /api/kyc` (authenticated, no submission) returns `404`

### Admin Panel

- [ ] `GET /app/admin` (admin session) returns `200`
- [ ] `GET /app/admin/kyc` (admin session) returns `200`
- [ ] `GET /app/admin/users` (admin session) returns `200`
- [ ] `GET /api/admin/kyc` (admin session) returns `200` with paginated data
- [ ] `GET /api/admin/users` (admin session) returns `200` with paginated data

### Legacy Redirects

- [ ] `GET /login` redirects `301` to `/client-login`
- [ ] `GET /register` redirects `301` to `/get-started`
- [ ] `GET /apply` redirects `301` to `/kyc/start`
- [ ] `GET /dashboard` redirects `301` to `/app/dashboard`
- [ ] `GET /admin` redirects `301` to `/app/admin`

### Contact Form

- [ ] `POST /api/contact` with valid body returns `200`
- [ ] `POST /api/contact` with missing required fields returns `400`

### Performance

- [ ] Core Web Vitals are within acceptable range (check Vercel Analytics)
- [ ] No oversized JavaScript bundles flagged in build output
- [ ] Static assets are served with correct `Cache-Control` headers

---

## Rollback Procedure

If a deployment causes a critical failure, follow these steps in order.

### Option 1 — Instant Rollback via Vercel (Preferred)

1. Open the [Vercel dashboard](https://vercel.com/dashboard).
2. Select the **GEM Enterprise** project.
3. Go to **Deployments**.
4. Find the last known-good deployment.
5. Click the three-dot menu and select **Promote to Production**.
6. Vercel will instantly route traffic to the previous deployment with zero downtime.

### Option 2 — Git Revert

If the bad deployment was caused by a code change:

```bash
# Identify the last good commit
git log --oneline -10

# Revert the bad commit (creates a new commit, does not rewrite history)
git revert <bad-commit-sha>

# Push to trigger a new Vercel deployment
git push origin main
```

### Option 3 — Database Rollback

If the deployment included a breaking migration:

**Only proceed if the Vercel rollback above is insufficient and data loss is acceptable or already handled.**

```bash
# Check current migration status
npx prisma migrate status

# Roll back the most recent migration
# WARNING: this may cause data loss if the migration added columns or tables with data
npx prisma migrate resolve --rolled-back <migration-name>
```

For destructive rollbacks, consult the database backup before proceeding. All production databases should have automated daily backups with point-in-time recovery.

### Post-Rollback Verification

After rolling back:

- [ ] Re-run the full [Post-Deployment Smoke Checks](#post-deployment-smoke-checks)
- [ ] Confirm `GET /api/health` returns `200`
- [ ] Confirm affected functionality is restored
- [ ] File a post-incident report documenting the cause, impact, and resolution
- [ ] Schedule a root-cause analysis before re-attempting the failed deployment
