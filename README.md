# GEM Enterprise (Vercel-ready)

Enterprise web + portal experience with public sections, KYC workflow, access bridge routing, protected application routes, and admin surfaces.

## Stack
- React + TypeScript + Vite
- React Router
- Tailwind + shadcn/ui
- Supabase SQL migrations for relational schema

## Local Run
```bash
npm install
npm run dev
```

## Demo Credentials
- Client: `client@gem-enterprise.com` / `client123`
- Admin: `admin@gem-enterprise.com` / `admin123`

## Required public routes
Implemented route map includes Home, Intel, Services, Community, Hub, Resources, Company, Contact, Get Started, KYC flow, decision pages, legal pages, and utility routes.

## Protected routes
`/app/*` includes dashboard, products, portfolios, documents, support, compliance, requests, profile/settings/security, notifications/messages, and admin review surfaces.

## Backend/data model
- Runtime service layer: `src/lib/platform.ts`
- Relational schema + seed inserts: `supabase/migrations/20260316090000_gem_enterprise_schema.sql`

## Docs
- Deployment guide: `DEPLOYMENT.md`
- Route map: `ROUTES.md`
- API notes: `API.md`
