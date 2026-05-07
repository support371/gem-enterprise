# Quick Deployment Guide - 5 Minutes to Production

## Option A: One-Click Deploy (Easiest - 2 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/support371/gem-enterprise)

Click the button above, it will:
1. Clone the repository to your GitHub
2. Create a new Vercel project
3. Deploy automatically
4. Give you a live URL

**Done!** Your site is live.

---

## Option B: Deploy with Vercel CLI (3 minutes)

```bash
# 1. Install Vercel CLI (first time only)
npm install -g vercel

# 2. Build locally to verify
npm run build

# 3. Deploy
vercel --prod

# 4. Follow the prompts
```

Your site will be live at: `your-project.vercel.app`

---

## Option C: GitHub Auto-Deploy (5 minutes, best for teams)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Deploy
Vercel will automatically:
- Build your project
- Deploy to production
- Create preview URLs for pull requests

**Future deployments**: Just push to GitHub, Vercel deploys automatically!

---

## For Other Vercel Accounts

### 1. Update Repository URL
If deploying to a different account, update these files:

**vercel.json** - Already configured for portability ✓
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

**package.json** - Standard npm scripts ✓
```json
{
  "build": "next build",
  "dev": "next dev"
}
```

### 2. Deploy to New Account

**Option A**: Click one-click deploy button (creates new repo)

**Option B**: Manual steps
```bash
# Clone or fork the repository
git clone https://github.com/support371/gem-enterprise.git
cd gem-enterprise

# Connect to your Vercel account
vercel login

# Link to Vercel project
vercel link

# Deploy
vercel --prod
```

### 3. Environment Variables (if needed)

Current setup requires NO environment variables. If you add features:

1. Update `.env.example` with new variables
2. In Vercel dashboard: Settings → Environment Variables
3. Add each variable with the same name as in `.env.example`

---

## Verify Deployment

After deployment, check:

```bash
# ✓ Site is accessible
https://your-project.vercel.app

# ✓ Navigation works
- Click all main navigation items
- Test mobile menu

# ✓ Performance
- Open DevTools (F12)
- Check Network tab
- No 404 errors should appear

# ✓ Speed Insights (after 24 hours)
- Vercel dashboard → Speed Insights
- Check Core Web Vitals
```

---

## Troubleshooting

### "Build fails"
```bash
# Test build locally first
npm run build

# Check for errors
npm run lint
```

### "Site shows error page"
1. Check Vercel dashboard → Deployments → Logs
2. Look for error messages
3. Verify environment variables are set

### "Changes not showing"
1. Push to main branch
2. Wait for deployment to complete
3. Hard refresh browser (Ctrl+Shift+R)

---

## Next Steps

- **Add custom domain**: Settings → Domains
- **Monitor performance**: Speed Insights tab
- **Setup team access**: Settings → Team
- **Enable GitHub integration**: Settings → Git

---

## For Full Details

See `VERCEL_DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions.

---

**Status**: Ready for production deployment
**Time to deploy**: 2-5 minutes
**Downtime**: 0 minutes
