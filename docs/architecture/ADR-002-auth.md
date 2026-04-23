# ADR-002 — Authentication and RBAC

**Date:** 2026-03-18
**Status:** Accepted
**Deciders:** Security team, engineering lead
**Dossier ref:** Master Dossier §4 (mandatory overlays), §12 (security guardrails)

## Context

The platform serves multiple user classes (clients, advisors, admins, super admins, analysts) across regulated service lines. Every route touching a regulated workflow must enforce role boundaries and emit an access log.

## Decision

### Authentication

- Passwords hashed with `bcrypt` (cost factor 12).
- Sessions issued as signed `jose` JWTs with a 24-hour expiry.
- JWT payload carries: `sub` (user ID), `role`, `email`, `iat`, `exp`.
- Tokens stored in `HttpOnly; Secure; SameSite=Strict` cookies — not `localStorage`.
- Refresh via `/api/auth/session` (reads cookie, re-issues token).

### RBAC

| Role | Access |
|---|---|
| `client` | `/app/*` (own data only) |
| `analyst` | `/app/*` read-only, no mutations |
| `admin` | `/app/admin/*`, all client data |
| `super_admin` | full platform, including secrets rotation |
| `internal` | advisory tools, profile management |

RBAC enforced in `src/middleware.ts` — role injected as `x-user-role` header for Server Components.

### MFA (current state + roadmap)

- **Now:** bcrypt password only. MFA UI scaffolded in `/app/security/`.
- **Sprint 5:** TOTP (authenticator app) enforced for `admin` and `super_admin`.
- **Sprint 6:** SMS backup enforced for all accounts with financial product access.

### Human review gate

Account creation for `admin` and `super_admin` roles requires manual approval from an existing `super_admin`. No self-service promotion.

## Rejected alternatives

- **Supabase Auth / Auth0 / Clerk** — Unnecessary external dependency for current scale. Revisit at Sprint 7 if SSO is required.
- **Session cookies without JWT** — JWT allows stateless role propagation to edge middleware.

## Consequences

- All API routes must validate `x-user-role` header or call `getServerSession()` — never trust client-supplied role.
- Audit log entry emitted on every login, logout, failed attempt, and role elevation.
- `JWT_SECRET` must be ≥ 32 random bytes, stored in Vercel environment variables, rotated quarterly.
