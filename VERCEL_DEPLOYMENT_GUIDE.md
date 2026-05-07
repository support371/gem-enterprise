# GEM Enterprise - Vercel Deployment Guide

## Quick Start - Deploy to Your Vercel Account

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/support371/gem-enterprise&project-name=gem-enterprise&repository-name=gem-enterprise)

Click the button above to deploy directly to your Vercel account.

### Option 2: Manual Deployment via Vercel CLI

#### Prerequisites
```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

#### Deploy Steps

1. **Navigate to project directory**
   ```bash
   cd path/to/gem-enterprise
   ```

2. **Build locally (optional, to verify)**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   # First deployment (interactive setup)
   vercel

   # Follow the prompts:
   # - Link to existing project or create new one
   # - Confirm project name
   # - Configure settings
   # - Deploy
   ```

4. **Set environment variables (if needed)**
   ```bash
   # In Vercel dashboard:
   # Settings → Environment Variables
   # Add any required variables (currently none required)
   ```

5. **Verify deployment**
   - Check Vercel dashboard for deployment status
   - Visit your deployment URL
   - Test all features

#### Redeploy (after changes)

After making changes and pushing to GitHub:
```bash
# Automatic redeploy on git push
# Vercel watches GitHub and auto-deploys on new commits

# Or manual redeploy
vercel --prod
```

### Option 3: GitHub Integration (Recommended for Teams)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect GitHub to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select GitHub integration
   - Choose `gem-enterprise` repository
   - Configure project settings
   - Click Deploy

3. **Auto-deployment enabled**
   - Every push to `main` → auto-deploys
   - Preview deployments for pull requests
   - Rollback if needed

---

## Environment Variables

### Current Setup
The project currently requires **NO environment variables** for basic functionality.

### If Adding Features That Need Env Vars

1. **In your local development**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=https://api.example.com
   SECRET_KEY=your_secret_here
   ```

2. **In Vercel Dashboard**
   ```
   Settings → Environment Variables
   
   Add each variable:
   - Name: NEXT_PUBLIC_API_URL
   - Value: https://api.example.com
   - Select: Production
   - Click: Add
   ```

3. **Accessing in code**
   ```typescript
   // Public variables (accessible in browser)
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   
   // Secret variables (server-side only)
   const secret = process.env.SECRET_KEY;
   ```

---

## Project Configuration

### vercel.json (Optional)

If you need advanced configuration, create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_APP_NAME": "GEM Enterprise"
  },
  "regions": ["sfo1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### .vercelignore

Already configured to exclude:
- `.git` - Git repository files
- `.next` - Build output
- `node_modules` - Dependencies
- `.env.local` - Local environment variables
- Development files

---

## Custom Domain Setup

### Add Custom Domain

1. **In Vercel Dashboard**
   ```
   Project Settings → Domains
   → Add Domain
   ```

2. **Configure DNS**
   - Point domain nameservers to Vercel, or
   - Add CNAME record: `your-app.vercel.app`

3. **SSL/HTTPS**
   - Automatic with Let's Encrypt
   - No additional setup needed

### Example Domains
```
gem-enterprise.vercel.app (default)
gem-enterprise.com (custom domain)
staging.gem-enterprise.com (preview)
```

---

## Deployment Checklist

Before deploying to production:

```
Code Quality
  ☐ npm run lint passes
  ☐ npm run build succeeds
  ☐ npm run dev starts without errors
  ☐ All TypeScript types correct

Testing
  ☐ Navigation works (all links)
  ☐ Mobile menu responsive
  ☐ Mobile layout correct
  ☐ Touch interactions smooth

Performance
  ☐ Performance optimizations active
  ☐ Bundle size acceptable
  ☐ No console errors
  ☐ No memory leaks

Deployment
  ☐ All code committed to main branch
  ☐ No sensitive data in code
  ☐ Environment variables configured
  ☐ Custom domain ready (if applicable)
```

---

## Monitoring After Deployment

### Speed Insights

Vercel automatically tracks Core Web Vitals:

1. **In Vercel Dashboard**
   ```
   Project → Speed Insights
   ```

2. **Monitor These Metrics**
   - LCP (Largest Contentful Paint)
   - INP (Interaction to Next Paint)
   - CLS (Cumulative Layout Shift)

3. **View Real User Data**
   - Check after 24-48 hours
   - Monitor trends over time
   - Alert if metrics degrade

### Deployment Logs

Check deployment logs for issues:

```
Vercel Dashboard → Deployments → [Your Deployment] → Logs
```

Look for:
- Build errors (red)
- Warnings (yellow)
- Build time
- Function cold starts

---

## Troubleshooting

### Deployment Fails

**Issue**: Build fails during deployment

**Solution**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Verify environment variables are set
echo $NEXT_PUBLIC_API_URL
```

### Deployment Succeeds but Site Shows Error

**Issue**: Site deploys but shows error page

**Solution**:
```bash
# Check Vercel logs
vercel logs

# Verify functions are running
# Check runtime errors in browser console
# Test locally: npm run dev
```

### Changes Not Reflecting

**Issue**: Push to main but site not updating

**Solution**:
```bash
# Verify GitHub integration is connected
# Check Deployments tab in Vercel dashboard
# Rebuild if needed: vercel --prod
# Clear browser cache: Ctrl+Shift+Delete
```

---

## Advanced Deployment Options

### Preview Deployments

Automatically created for pull requests:

```bash
# Push to feature branch
git push origin feature/my-feature

# Create pull request on GitHub
# Vercel creates preview URL automatically

# Preview URL format: gem-enterprise-pr-123.vercel.app
```

### Multiple Environments

Set up different environments:

```bash
# Preview (from pull requests)
# Staging (from staging branch)
# Production (from main branch)

# Each can have different environment variables
```

### Rollback to Previous Deployment

```
Vercel Dashboard → Deployments
→ Choose previous deployment
→ Click "Redeploy"
```

---

## Performance Optimization on Vercel

The project includes optimizations:

1. **Package Import Optimization**
   - Radix UI tree-shaking enabled
   - Reduces bundle by 15-25KB

2. **Image Optimization**
   - Automatic resizing for different devices
   - WebP format support
   - Lazy loading ready

3. **Caching Strategy**
   - Static assets cached for 1 year
   - API responses cached short-term
   - CDN caching enabled

4. **Monitoring**
   - Speed Insights (Core Web Vitals)
   - Analytics (user interactions)
   - Error tracking (if configured)

---

## Team Collaboration

### Share Project Access

1. **In Vercel Dashboard**
   ```
   Settings → Team
   → Add Team Member
   → Invite via email
   ```

2. **GitHub Permissions**
   - Each team member needs GitHub access
   - Recommended: Push only to branches, not main
   - Use pull requests for code review

### Environment Variables for Team

1. **Sensitive Variables**
   ```
   Settings → Environment Variables
   → Add with Team-level scope
   → Only visible to team members
   ```

2. **Preview Environment**
   ```
   Preview deployments automatically created
   All team members can view and test
   ```

---

## Cost & Limits

### Free Tier
- 100 deployments/month
- 100GB bandwidth/month
- Serverless Functions: 10GB execution/month
- All features included

### Pro Tier ($20/month)
- Unlimited deployments
- 1TB bandwidth/month
- 1TB serverless execution/month
- Advanced analytics

### See Current Usage
```
Vercel Dashboard → Settings → Billing → Usage
```

---

## Best Practices

### Do's
- ✓ Use environment variables for secrets
- ✓ Test locally before deploying
- ✓ Use meaningful commit messages
- ✓ Keep main branch stable
- ✓ Use pull requests for features
- ✓ Monitor performance metrics
- ✓ Set up custom domain

### Don'ts
- ✗ Commit secrets to Git
- ✗ Deploy directly to main without testing
- ✗ Mix environments (dev/prod) in code
- ✗ Ignore deployment warnings
- ✗ Leave unused code/branches
- ✗ Skip performance monitoring

---

## Support & Resources

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Speed Insights](https://vercel.com/docs/speed-insights)

### Getting Help
- [Vercel Support](https://vercel.com/help)
- [GitHub Issues](https://github.com/support371/gem-enterprise/issues)
- [Vercel Community](https://github.com/vercel/next.js/discussions)

### Project Settings
```
Vercel Dashboard → Settings
├── General (project name, region)
├── Environments (prod, preview, dev)
├── Domains (custom domain setup)
├── Environment Variables
├── Functions (serverless function config)
├── Build & Development
├── Integrations (GitHub, Slack, etc)
└── Team (add members, permissions)
```

---

## Deployment Summary

| Method | Ease | Auto-Deploy | Best For |
|--------|------|------------|----------|
| One-Click | ⭐⭐⭐⭐⭐ | N/A | First-time setup |
| Vercel CLI | ⭐⭐⭐⭐ | Manual | Quick deployments |
| GitHub | ⭐⭐⭐⭐⭐ | Yes | Team collaboration |

---

**Last Updated**: May 6, 2026
**Status**: Ready for Production
**Next Step**: Follow one of the deployment options above
