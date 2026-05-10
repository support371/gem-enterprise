# Environment Variables Setup Guide

## Quick Start

### 1. Local Development Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

### 2. Required Variables for Development

#### Database (REQUIRED)
```env
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/gem_enterprise
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/gem_enterprise
```

**Options:**
- **Local PostgreSQL:** Self-hosted PostgreSQL server
- **Cloud Databases:** 
  - Neon (recommended) - Serverless PostgreSQL
  - AWS Aurora PostgreSQL
  - Supabase - PostgreSQL + Auth + Storage

#### Authentication (REQUIRED for Production)
```env
JWT_SECRET=your-32-character-random-string-here
```

**Generate with:**
```bash
openssl rand -hex 32
```

#### Application URLs
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For local dev
NEXT_PUBLIC_APP_NAME=GEM Enterprise
```

### 3. Optional but Recommended

#### AI Integration
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
NEXT_PUBLIC_AI_DISCLOSURE_TEXT=GEM Concierge is an AI assistant. It does not provide legal, financial, or investment advice...
```

**Get API Key:** https://console.anthropic.com

#### Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=GEM Enterprise <noreply@example.com>
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password as `SMTP_PASS`

#### Admin Bootstrap (First Time Only)
```env
ADMIN_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=TempPassword123!
```

**Important:** Change password after first login!

#### Features
```env
AUDIT_ENABLED=true  # Enable compliance audit logging
```

---

## Database Setup Instructions

### Option A: Local PostgreSQL (Development)

```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb gem_enterprise

# Set connection string
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/gem_enterprise
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/gem_enterprise
```

### Option B: Neon (Recommended - Free Tier Available)

1. Sign up: https://neon.tech
2. Create project
3. Copy connection string from dashboard
4. Update `.env.local`:
```env
POSTGRES_PRISMA_URL=postgresql://user:password@ep-xxx.neon.tech/neondb
POSTGRES_URL_NON_POOLING=postgresql://user:password@ep-xxx.neon.tech/neondb
```

### Option C: AWS Aurora PostgreSQL

1. Create Aurora cluster in AWS Console
2. Get endpoint and credentials
3. Update `.env.local`:
```env
POSTGRES_PRISMA_URL=postgresql://admin:password@your-cluster.amazonaws.com:5432/gem_enterprise
POSTGRES_URL_NON_POOLING=postgresql://admin:password@your-cluster.amazonaws.com:5432/gem_enterprise
```

### Option D: Supabase (Auth + Database)

1. Sign up: https://supabase.com
2. Create project
3. Copy PostgreSQL connection string from settings
4. Update `.env.local`:
```env
POSTGRES_PRISMA_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

---

## Initialize Database

Once environment variables are set:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations (development)
npm run db:migrate

# Seed initial data (creates admin account)
npm run db:seed

# Open Prisma Studio (GUI for database)
npm run db:studio
```

---

## Vercel Deployment Setup

### 1. Connect Project to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Link to existing project or create new
```

### 2. Set Environment Variables in Vercel

**Via CLI:**
```bash
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NON_POOLING
vercel env add JWT_SECRET
vercel env add ANTHROPIC_API_KEY
# ... etc
```

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select project
3. Settings → Environment Variables
4. Add each variable for production/preview/development

### 3. Production Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `POSTGRES_PRISMA_URL` | Yes | `postgresql://...` |
| `POSTGRES_URL_NON_POOLING` | Yes | `postgresql://...` |
| `JWT_SECRET` | Yes | 32-char random string |
| `ANTHROPIC_API_KEY` | No | `sk-ant-...` |
| `SMTP_HOST` | No | `smtp.gmail.com` |
| `SMTP_PORT` | No | `587` |
| `SMTP_USER` | No | `email@gmail.com` |
| `SMTP_PASS` | No | `app-password` |
| `EMAIL_FROM` | No | `noreply@example.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | No | `GEM Enterprise` |
| `AUDIT_ENABLED` | No | `true` |

---

## Verification Checklist

- [ ] Database credentials configured
- [ ] JWT_SECRET set (32+ characters)
- [ ] App URL configured correctly
- [ ] SMTP settings configured (if email needed)
- [ ] Admin credentials set for initial user
- [ ] AI_DISCLOSURE_TEXT set
- [ ] Database tables created (run `npm run db:push`)
- [ ] Initial data seeded (run `npm run db:seed`)
- [ ] Can start dev server (`npm run dev`)
- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)

---

## Troubleshooting

### Database Connection Issues

```
Error: Could not connect to the database server
```

**Solutions:**
1. Check credentials in `POSTGRES_PRISMA_URL`
2. Verify database server is running
3. Check firewall allows connections
4. Use `POSTGRES_URL_NON_POOLING` for migrations

### Tests Failing

```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm run db:generate
```

### Missing AI Responses

```
AI widget shows generic responses
```

**Solution:** Set `ANTHROPIC_API_KEY` environment variable

### Email Not Sending

**Verify:**
- SMTP credentials are correct
- App passwords enabled (Gmail)
- Firewall allows SMTP connections (port 587)

---

## Security Best Practices

1. **Never commit secrets** - Always use `.env.local` (in .gitignore)
2. **Use strong JWT_SECRET** - Minimum 32 characters
3. **Rotate credentials** - Especially after deployment
4. **Use app-specific passwords** - For SMTP/email
5. **Limit database user permissions** - Don't use admin account
6. **Enable HTTPS** - Always in production
7. **Secure SMTP** - Use TLS/SSL (port 587 or 465)

---

## Environment Variable Validation

The application validates on startup:

```
✓ POSTGRES_PRISMA_URL configured
✓ POSTGRES_URL_NON_POOLING configured
✓ JWT_SECRET meets minimum length requirement
✓ NEXT_PUBLIC_APP_URL is valid
```

**Missing critical variables will prevent the app from starting.**

---

## Support

- Check `.env.example` for complete template
- View `SETUP_VERIFICATION_REPORT.md` for system status
- See `/docs` routes for full API documentation
- Check logs: `tail -f .next/server.log`

---

*Last updated: 2026-05-10*
