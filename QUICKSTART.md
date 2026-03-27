# Quick Start

## Prerequisites

- Node.js 18+
- A Supabase project (get one free at supabase.com)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Both variables are required. The app will warn and disable auth if either is missing, but will not crash.

## 3. Start the dev server

```bash
npm run dev
```

Opens at `http://localhost:8080` by default (see `vite.config.ts`).

## 4. Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 5. Run tests

```bash
npm test
```

## Key files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route tree, auth providers |
| `src/hooks/useAuth.tsx` | Auth context, sign-in/up/out/reset |
| `src/integrations/supabase/client.ts` | Supabase client init with env-var guard |
| `src/components/auth/ProtectedRoute.tsx` | Auth + RBAC guard for portal routes |
| `src/components/auth/PublicOnlyRoute.tsx` | Redirects authenticated users away from public-only routes |
| `src/hooks/useUserRole.tsx` | Fetches the current user's role from Supabase |

## Onboarding flow

```
/register → /kyc → /kyc/status → /handoff → /portal/dashboard
```

## Deployment

The project deploys to Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in the Vercel project settings.
