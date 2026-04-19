# ADR-001 — Technology Stack

**Date:** 2026-03-18
**Status:** Accepted
**Deciders:** Platform architect, engineering lead
**Dossier ref:** Master Dossier §7 (Build Stack)

## Context

The platform must support a governed multi-service web system covering cybersecurity, real estate, financial, and legal service lines. It must operate under auditable controls, emit evidence records for every material workflow, and support regulated human escalation gates.

## Decision

| Layer | Choice | Rationale |
|---|---|---|
| Frontend / SSR | Next.js 15 (App Router) | Strong ecosystem, SSR for SEO, server actions, streaming, Vercel-native |
| Language | TypeScript throughout | Type safety at API boundaries, ADR enforceability |
| Database | PostgreSQL via Prisma ORM | Structured transactions, ACID, row-level filtering, evidence indexing |
| Auth | Custom bcrypt + jose JWT (no external SaaS auth) | Full control of session lifecycle, RBAC in middleware, no Supabase dependency |
| Styling | Tailwind CSS + shadcn/ui | Consistent design tokens, service color system (`--svc-*`) |
| Cache / queue | Redis (future) | Async jobs, retries, notification fanout |
| Storage | Azure Blob / S3 (adapter pattern) | Evidence artifacts, profile media, documents |
| AI | OpenAI / Azure AI Foundry (adapter pattern) | Abstracted — swap without code changes |
| Payments | Stripe (adapter pattern, future sprint) | Proven PCI DSS tooling |
| Comms | SendGrid (email) + Twilio (SMS/voice) | Separate adapters, fallback per channel |
| Observability | Vercel Analytics + structured JSON logs | Build-time and runtime visibility |
| IaC | Not yet configured — use Vercel project settings for now | Document when Azure infra is added |
| CI/CD | GitHub Actions (see `.github/workflows/`) | Quality gates before deploy |

## Rejected alternatives

- **Supabase** — Vite/React SPA pattern; this repo is Next.js 15 with custom auth. Not applicable.
- **Next-auth** — Adds external session provider; custom JWT gives more control over RBAC injection.
- **Separate micro-repos** — Single mono-repo preferred per dossier §6 until team scale justifies split.

## Consequences

- All third-party integrations must be wrapped in adapter layers (`src/lib/*-adapter.ts`).
- No direct SDK calls in route handlers or components — always via adapter.
- `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` are required at build time.
