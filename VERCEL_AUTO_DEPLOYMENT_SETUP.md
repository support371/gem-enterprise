# Vercel Auto-Deployment Configuration

## Status: OPTIMIZED FOR AUTOMATIC DEPLOYMENT

This document outlines the complete auto-deployment configuration for Vercel with the GEM Enterprise project.

---

## Deployment Flow (Fully Automated)

```
Push to main branch
    ↓
GitHub detects push
    ↓
Vercel webhook triggered
    ↓
Vercel runs build: "pnpm run db:generate && pnpm run build"
    ↓
Success? → Promote to production
Failed?  → Keep in preview (no production impact)
```

---

## Key Configuration Files

### 1. **vercel.json** (PRIMARY DEPLOYMENT CONFIG)
**Location:** `/vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm run db:generate && pnpm run build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "nodejs": "20.x",
  "regions": ["sfo1"],
  "git": {
    "deploymentEnabled": {
      "main": true
    },
    "deploymentEnabledForPR": false,
    "deploymentBranches": ["main"],
    "deploymentInvocationHook": {
      "events": ["push"]
    }
  }
}
```

**Key Settings:**
- ✅ Auto-deploys on push to `main`
- ✅ Skips deployments for PRs (testing only)
- ✅ Explicit invocation on push events
- ✅ Node.js 20.x (stable, matches project)
- ✅ Prisma client generation included in build

---

## GitHub Workflows (VALIDATION ONLY)

### CI Workflow (`.github/workflows/ci.yml`)
**Purpose:** Validate code quality on pull requests
**Triggers:** Pull requests to main only
**Actions:**
- Run unit tests
- Lint code
- Build verification

**Why PR-only?** Deployment is handled by Vercel, not GitHub Actions. This workflow validates PRs before merge.

### CodeQL Workflow (`.github/workflows/codeql.yml`)
**Purpose:** Security scanning
**Triggers:** Pull requests and scheduled weekly runs
**No deployment trigger** - Security analysis only

### Guardian Workflow (`.github/workflows/main.yml`)
**Status:** DISABLED
**Reason:** Conflicted with Vercel auto-deployment and duplicated build process
- This workflow tried to handle deployment independently
- Removed from main branch trigger
- Only runnable via manual `workflow_dispatch`

---

## What Was Removed (To Prevent Conflicts)

### ❌ Removed from Workflows
1. **Guardian's main branch trigger** - Was rebuilding and attempting to verify deployment
2. **CodeQL on push to main** - Was running on every production push
3. **CI on push to main** - Was duplicating build that Vercel already does

### ✅ What Remains
1. **Vercel's automated deployment** - Single source of truth for production
2. **PR validation workflows** - Ensures quality before merge
3. **Scheduled security scans** - Weekly CodeQL analysis

---

## Environment Variables Setup

### Required for Production Deployment
Set these in Vercel Dashboard (`Settings → Environment Variables`):

```env
# Database (REQUIRED)
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/db
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/db

# Auth (REQUIRED)
JWT_SECRET=your-min-32-character-secret-key

# Application (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# AI Integration (RECOMMENDED)
ANTHROPIC_API_KEY=your-anthropic-key

# Email (OPTIONAL)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Monitoring (OPTIONAL)
AUDIT_ENABLED=true
```

---

## Deployment Process (Step by Step)

### 1. Before Deployment
- [ ] All tests pass locally: `pnpm test`
- [ ] Build succeeds: `pnpm run build`
- [ ] Code lints: `pnpm run lint`
- [ ] All env vars configured in Vercel

### 2. Trigger Deployment
```bash
git push origin main
```

### 3. What Happens (Automatic)
1. Vercel detects push to main
2. Webhook triggers build:
   - `pnpm install --frozen-lockfile`
   - `pnpm run db:generate`
   - `pnpm run build`
3. Deployment status visible at: `https://vercel.com/gem-enterprise`

### 4. Post-Deployment (Manual)
If first deployment after environment setup:
```bash
# Run via Vercel CLI or direct SSH
npx prisma migrate deploy
npx prisma db seed
```

---

## Verification Checklist

### After Each Deployment

#### Health Checks
- [ ] Application loads at production URL
- [ ] API endpoints respond (check `/api/health` if exists)
- [ ] Database queries work
- [ ] Auth flows complete successfully
- [ ] No 5xx errors in Vercel logs

#### Performance
- [ ] Check Vercel Analytics: `https://vercel.com/gem-enterprise/analytics`
- [ ] Response time: < 500ms
- [ ] Edge function performance: < 100ms

#### Security
- [ ] HTTPS enabled (automatic via Vercel)
- [ ] Security headers present (set in next.config.js)
- [ ] No secrets exposed in logs

#### Monitoring
- [ ] Check error logs: `Vercel Dashboard → Function Logs`
- [ ] Review build duration (should be ~15-30s)
- [ ] Verify no deployment warnings

---

## Rollback Procedure

### If Deployment Fails

1. **Check Vercel Logs**
   ```
   Dashboard → Select Failed Deployment → View Logs
   ```

2. **Common Issues**
   - **Missing env var:** Add to Vercel → Redeploy
   - **Build timeout:** Increase timeout → Redeploy
   - **Database issue:** Check connection → Redeploy

3. **Instant Rollback**
   ```
   Vercel Dashboard → Deployments → Select Previous → Promote to Production
   ```

### If Code is the Issue

1. **Revert commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Vercel auto-deploys** the reverted code (same push trigger)

---

## Monitoring & Logs

### Real-time Monitoring
- **Vercel Dashboard:** https://vercel.com/gem-enterprise
- **Analytics:** Response times, errors, usage
- **Edge Function Logs:** Real-time function execution

### Environment-Specific Logs
- **Production:** `Vercel → Deployments → Select Production → Logs`
- **Preview:** Each PR gets preview deployment with separate logs
- **Build Logs:** Available for 48 hours after deployment

### Common Log Paths to Check
```
/var/log/vercel/build.log     # Build phase errors
/var/log/vercel/runtime.log   # Runtime errors
```

---

## Troubleshooting

### Issue: Deployment Not Triggered
**Check:**
1. Confirm push was to `main` branch
2. Verify Vercel webhook is connected (GitHub → Settings → Webhooks)
3. Check Vercel project settings are correct

**Fix:**
```bash
# Manual deployment trigger
vercel deploy --prod
```

### Issue: Build Timeout
**Check:**
1. Build logs for slow steps
2. Large dependencies being installed
3. Database operations in build

**Fix:**
1. Increase timeout in vercel.json
2. Optimize build command
3. Use build caching

### Issue: Environment Variables Not Applied
**Check:**
1. Variables set in Vercel Dashboard (not .env.local)
2. Correct scope (Production, Preview, Development)
3. Redeployed after adding variables

**Fix:**
```bash
# Redeploy to apply new env vars
vercel deploy --prod
```

---

## Best Practices

1. **Always test locally first**
   ```bash
   pnpm install
   pnpm run db:generate
   npm run build
   npm run start
   ```

2. **Use feature branches for development**
   - PRs trigger validation only
   - No production impact until merged to main

3. **Keep deployments small**
   - Smaller changes = faster deployments
   - Easier to debug if issues arise

4. **Monitor after deployment**
   - Check logs first 5 minutes
   - Monitor error rates
   - Verify core functionality

5. **Document environment changes**
   - When adding new env vars, update this document
   - Keep team informed of deployment status

---

## Quick Reference Commands

```bash
# Local development
pnpm dev                    # Start dev server

# Pre-deployment checks
pnpm test                   # Run tests
pnpm run lint              # Lint code
pnpm run build             # Build for production

# Database operations
pnpm run db:generate       # Generate Prisma client (included in build)
pnpm run db:migrate        # Create new migration
pnpm run db:push           # Push schema to database
pnpm run db:seed           # Seed database with initial data
pnpm run db:studio         # Open Prisma Studio GUI

# Deployment (if using Vercel CLI)
vercel deploy --prod       # Force production deployment
vercel logs                # View real-time logs
vercel rollback            # Rollback to previous deployment
```

---

## Related Documentation

- **Deployment Report:** `DEPLOYMENT_READINESS_REPORT.md`
- **Environment Setup:** `ENV_SETUP_GUIDE.md`
- **System Status:** `SETUP_VERIFICATION_REPORT.md`
- **Vercel Official Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment/vercel

---

**Last Updated:** 2026-05-10  
**Configuration Status:** Production Ready  
**Auto-Deployment:** Enabled ✅
