# GEM Enterprise Portal

Authenticated portal frontend for the GEM Enterprise platform.

**Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Vercel

---

## Overview

This repo contains the **authenticated portal** only. It is not the public marketing site and not the backend service.

- Public marketing site: deployed separately on Vercel
- Authenticated portal: this repo (`support371/gem-enterprise`)
- Internal operations: Atlassian

---

## Requirements

- Node.js 18+
- npm 9+

---

## Development Setup

```bash
git clone https://github.com/support371/gem-enterprise.git
cd gem-enterprise
npm install
cp .env.example .env   # fill in Supabase credentials
npm run dev
```

### Required environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://<id>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

Do **not** commit `.env` to the repo. Both variables are public-safe (anon key) and embedded in the client bundle.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

---

## Route Map

### Public routes
| Route | Description |
|---|---|
| `/` | Home / marketing landing page |
| `/solutions` | Solutions overview |
| `/solutions/:slug` | Solution detail |
| `/pricing` | Pricing page |
| `/resources` | Resources page |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post |
| `/trust-center` | Trust Center |
| `/contact` | Contact form |
| `/auth` | Login / sign up |
| `/register` | New user registration (public-only) |
| `/reset-password` | Password reset (from email link) |

### Onboarding flow (authenticated)
| Route | Description |
|---|---|
| `/kyc` | KYC form submission |
| `/kyc/status` | KYC review status |
| `/handoff` | Approved user handoff to portal |

### Portal routes (authenticated + role-gated)
| Route | Allowed Roles |
|---|---|
| `/portal/dashboard` | admin, manager, analyst, viewer |
| `/portal/services` | admin, manager, analyst, viewer |
| `/portal/community` | admin, manager, analyst, viewer |
| `/portal/workspace` | admin, manager, analyst, viewer |
| `/portal/tasks` | admin, manager, analyst |
| `/portal/incidents` | admin, manager, analyst |
| `/portal/team` | admin, manager |
| `/portal/activity` | admin, manager, analyst |
| `/portal/alliance-trust` | admin, manager, analyst, viewer |
| `/portal/settings` | admin |
| `/profile` | admin, manager, analyst, viewer |
| `/support` | admin, manager, analyst, viewer |
| `/settings` | Redirects to `/portal/settings` (admin) |

---

## Authentication

Authentication is powered by Supabase Auth.

- Login/signup: `/auth`
- Password reset: `/auth` -> email link -> `/reset-password`
- Session is persisted in localStorage
- Unauthenticated users accessing protected routes are redirected to `/auth`
- Authenticated users accessing `/auth` or `/register` are redirected to `/portal`
- Role enforcement: roles are fetched from the `user_roles` Supabase table

---

## Deployment

Deployed on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

**Key points:**
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel environment variables
- `vercel.json` rewrites all routes to `index.html` for SPA routing

---

## Project Structure

```
src/
  App.tsx                    # Route definitions and providers
  main.tsx                   # Entry point with ErrorBoundary + ThemeProvider
  hooks/
    useAuth.tsx              # Auth context and provider
    useUserRole.tsx          # Role fetching hook (react-query)
  integrations/
    supabase/
      client.ts              # Supabase client init with env var guard
      types.ts               # Generated Supabase types
  components/
    auth/
      ProtectedRoute.tsx     # Auth + role guard
      PublicOnlyRoute.tsx    # Redirects authenticated users
      AccessDenied.tsx       # Access denied screen
    ErrorBoundary.tsx        # Top-level error boundary
    Navigation.tsx           # Public site navigation
    portal/
      PortalLayout.tsx       # Portal sidebar layout
      PortalSidebar.tsx      # Portal navigation sidebar
  pages/
    portal/                  # Portal page components
    Auth.tsx                 # Login/signup
    Register.tsx             # Registration
    KYC.tsx / KYCStatus.tsx  # KYC flow
    Handoff.tsx              # Portal handoff
    Profile.tsx
    Support.tsx
    ResetPassword.tsx
```
