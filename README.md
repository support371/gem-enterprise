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

## Architecture

### Mobile-First Design (Cyber-Noir Theme)

The platform uses a **dark-mode-default** design system with:
- **Bento-Grid** responsive layouts (`sm:` / `md:` / `lg:` breakpoints)
- **Glassmorphism** panels (`glass-panel` utility, `backdrop-blur`)
- **Cyber-Blue / Neon** accent tokens (`--electric-cyan`, `--neon-lime`, `--night-plum`)
- Touch-optimized targets (44px minimum per WCAG 2.5.8)
- Full-screen mobile bottom-sheet for GEM AI Assistant

### Nexus Gateway (Global Gateway)

The integration hub for third-party services and the crypto-fiat bridge:
- **Digital Asset Monitor** (`CryptoMarketTable`) -- real-time polled CoinGecko API
- **Transaction Queue** -- crypto-fiat bridge with HMAC-signed webhooks, idempotency keys, AML checks
- **Asset Recovery** -- standardized legal submission schema with per-case audit trails
- **Third-party integrations** -- Mailchimp, Slack, PagerDuty, Jira, Splunk, Datadog, Okta

### Domain Isolation

The platform enforces logical separation between service domains:
- **Fintech core** (`/portal/*`, `/global-gateway/*`) -- cybersecurity, asset recovery, transaction processing
- **Luxury infrastructure** (`/portal/alliance-trust`) -- Alliance Trust Realty real estate services (standalone layout, separate data domain)

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
| `npm test` | Run Vitest tests (16 tests) |

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
| `/global-gateway` | admin, manager, analyst, viewer |
| `/global-gateway/connect` | admin, manager, analyst, viewer |
| `/global-gateway/mailchimp` | admin, manager |
| `/profile` | admin, manager, analyst, viewer |
| `/support` | admin, manager, analyst, viewer |

---

## Authentication

Authentication is powered by Supabase Auth.

- Login/signup: `/auth`
- Password reset: `/auth` -> email link -> `/reset-password`
- Session is persisted in localStorage
- Unauthenticated users accessing protected routes are redirected to `/auth`
- Authenticated users accessing `/auth` or `/register` are redirected to `/portal`
- Role enforcement: roles are fetched from the `user_roles` Supabase table
- **Security:** New users are always assigned `client` role (role metadata in signup is ignored to prevent privilege escalation)

---

## Database Schema

### Core Tables (18)
`profiles`, `organizations`, `kyc_applications`, `kyc_documents`, `kyc_reviews`, `decisions`, `entitlements`, `products`, `portfolios`, `portfolio_memberships`, `portfolio_products`, `requests`, `support_tickets`, `ticket_messages`, `notifications`, `messages`, `documents`, `audit_logs`, `user_sessions`

### Nexus Gateway Tables (6)
`asset_recovery_cases`, `asset_recovery_reports`, `asset_recovery_activity`, `transaction_queue`, `transaction_audit_trail`, `exchange_rate_snapshots`

All tables have RLS enabled with appropriate policies.

---

## Security

- **CORS:** Strict origin allowlist on all edge functions (production domains only)
- **Input validation:** Message count/length caps, body size limits, control character stripping
- **RLS:** Row-level security on all 24 tables
- **Auth:** Role-based access control with fail-closed policy
- **Audit:** Immutable transaction audit trail, per-case recovery activity logs

---

## Edge Functions

| Function | Purpose |
|---|---|
| `gem-assist` | AI chat proxy (ARIA concierge) with streaming SSE |
| `contact-form` | Contact form handler with sanitized input |

---

## Deployment

Production deployment is on Vercel with SPA catch-all rewrite. See `vercel.json` for configuration.
