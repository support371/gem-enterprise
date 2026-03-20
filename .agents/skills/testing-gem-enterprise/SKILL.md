# Testing: GEM Enterprise Portal

## Overview
GEM Enterprise is a Vite + React SPA with Supabase authentication. It deploys to Vercel.

## Local Dev Server
```bash
npm install
npm run dev
```
The dev server runs at `http://localhost:8080` (configured in `vite.config.ts`).

## Environment Variables
The app requires a `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Copy from `.env.example` and fill in values. The app handles missing env vars gracefully (shows a config error instead of crashing).

## Key Routes to Test

### Public routes (no auth needed)
- `/` — Homepage with "Next-Generation Security & Trust Solutions" heading
- `/solutions` — Solutions listing page
- `/pricing` — Pricing page
- `/contact` — Contact form
- `/auth` — Login form with email/password fields
- `/register` — New user registration

### Protected routes (require auth)
- `/portal/dashboard` — Main portal dashboard
- `/portal/services` — Services page
- `/portal/community` — Community page
- `/portal/workspace` — Workspace page
- `/profile` — User profile
- `/support` — Support page

Unauthenticated users accessing protected routes should be redirected to `/auth`.

## Console Error Patterns
- **Expected warnings**: React Router v6→v7 migration warnings (`v7_startTransition`, `v7_relativeSplatPath`) — these are pre-existing and harmless.
- **Red flags**: Any `module not found`, `Failed to resolve import`, or `chunk load error` messages indicate broken imports.
- **Auth warnings**: `[supabase] Missing Supabase configuration` appears when env vars are not set — this is handled gracefully.

## Build Verification
```bash
npm run build   # Production build to dist/
npm test        # Vitest test suite
```

## Deployment
- Deploys to Vercel with `vercel.json` SPA rewrite rules
- `vercel.json` rewrites all non-asset requests to `index.html` for client-side routing
- Environment variables must be set in Vercel project settings (not committed to repo)

## Devin Secrets Needed
- No secrets are required for basic local testing (public routes work without Supabase credentials)
- For authenticated flow testing, Supabase test account credentials would be needed

## Common Gotchas
- The repo previously had stale Next.js files at root level (`lib/`, `components/`). If these reappear, they are not used by the Vite app — the actual code lives under `src/`.
- The `.env` file should NOT be committed to git. If it appears in git tracking, use `git rm --cached .env` to remove it.
- The `components.json` (shadcn config) uses `@/` aliases that resolve to `src/` via Vite, not to root-level directories.
