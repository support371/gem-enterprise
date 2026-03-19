# CLAUDE.md

## Project

`support371/gem-enterprise` is the authenticated portal frontend for the GEM Enterprise platform.

It is **not** the public marketing site and **not** the main backend service.

### Locked production structure
- **Vercel public platform** = public front, trust layer, service overview, registration, KYC, onboarding handoff
- **gem-enterprise** = authenticated portal, dashboard, services, community, workspace, profile, settings, support
- **Atlassian** = internal operations, incidents, runbooks, compliance, support workflow

### Primary objective
Move this repo from a partially working portal into a **stable, trustworthy, production-ready authenticated portal**.

This is a **production stabilization and finalization phase**, not a feature expansion phase.

---

## Current stack
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-style component system
- Supabase authentication

Key files already in use:
- `src/App.tsx`
- `src/main.tsx`
- `src/hooks/useAuth.tsx`
- `src/integrations/supabase/client.ts`
- `src/pages/*`

---

## Current production priority

### Priority 1: auth/bootstrap stabilization
The highest-priority issue is production instability during initial app boot.

Likely failure path:
`app boot -> auth context -> Supabase initialization -> protected route/session bootstrap`

### Requirements
- guard Supabase initialization properly
- validate required environment variables at startup
- prevent blank or partial first render
- provide safe loading state during auth bootstrap
- provide readable fallback/error state if auth/config is unavailable
- make protected route resolution deterministic

### Required env vars
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

No secrets should be hardcoded.

---

## Portal scope to keep
Do not expand beyond these routes until production stability is proven:
- `/portal/dashboard`
- `/portal/services`
- `/portal/community`
- `/portal/workspace`
- `/profile`
- `/settings`
- `/support`

---

## Public-to-portal bridge
This is the next production-critical flow after auth stabilization.

### Required onboarding flow
`/register -> /kyc -> /kyc/status -> /handoff -> /portal/dashboard`

### Goal
A user must be able to move from:
`public site -> register -> KYC -> approval -> portal dashboard`

without confusion, dead ends, broken redirects, or route loops.

---

## Authentication requirements
Must work reliably in production:
- signup
- login
- logout
- password reset
- session persistence after refresh
- protected route enforcement
- redirect unauthenticated users to login
- redirect authenticated users away from login when appropriate

### UX requirements
- clean loading state during session check
- no redirect loops
- no flicker between auth states
- readable auth/config failure state

---

## Trust requirements
The portal must feel like a real product, not a prototype.

Minimum trust standards:
- no blank shell render
- no broken first load
- no route loops
- no silent auth failures
- dashboard accessible after login
- stable navigation across portal routes
- profile/settings/support reachable
- clear sign-out path

---

## Branch and deployment discipline
Use **one production branch** and **one production deployment truth**.

Do not keep preview branches acting like the real future while production behaves differently.

Production-critical fixes must land in the branch that owns the real deployment.

---

## Code expectations
Keep and reuse the existing stack.

Focus cleanup on:
- centralized auth bootstrap logic
- reduced duplicated auth handling
- deterministic session resolution
- consistent protected route guarding
- standardized auth/config error handling

Do not spend time on unrelated redesign or major new features during this phase.

---

## Testing checklist
Before calling this stable, verify in production:

### Auth flow
- signup works
- login works
- logout works
- password reset works
- session survives refresh
- invalid session is handled safely

### Route behavior
- unauthenticated access redirects correctly
- authenticated access works correctly
- portal routes render fully
- no protected-route loops
- profile/settings/support routes load correctly

### Onboarding
- register flow works
- KYC entry works
- KYC status works
- approved-user handoff to dashboard works

### UX
- loading state appears during auth check
- readable error appears if config/auth fails
- no empty shell page in production

---

## Non-goals for this phase
Do not spend time on:
- major new features
- unrelated redesign work
- parallel product lines
- hybrid Mainapp/Replit finalization
- deep backend complexity unrelated to portal stability

This phase is only about:
**stability, trust, onboarding continuity, and production-safe behavior**.

---

## Recommended execution order

### Phase 1 — production auth stabilization
- fix Supabase bootstrap
- confirm env vars
- stabilize first render
- validate session persistence
- validate protected routes

### Phase 2 — portal stabilization
- confirm core portal routes
- fix navigation issues
- fix auth/redirect inconsistencies
- confirm dashboard pattern works end to end

### Phase 3 — public-to-portal bridge
- finalize register
- finalize KYC entry/status
- finalize handoff to dashboard
- verify approved-user path

### Phase 4 — ops linkage
- connect support/compliance exceptions to Atlassian only where necessary

---

## Final success definition
This repo is considered production-ready for this phase when:
1. it deploys cleanly in production
2. auth works reliably
3. session persists correctly
4. protected routes behave correctly
5. core portal routes are stable
6. public onboarding can hand users into the portal
7. the app feels trustworthy to a real user

---

## Direct instruction for Claude Code

You are working on production stabilization for `support371/gem-enterprise`.

Do not expand feature scope.
Do not redesign unrelated areas.
Do not create parallel product directions.

First, stabilize auth/bootstrap and eliminate any blank or partial first render caused by Supabase initialization or session bootstrap.

Then confirm login, signup, logout, password reset, and session persistence all work in production.

Then stabilize the core portal routes only:
- `/portal/dashboard`
- `/portal/services`
- `/portal/community`
- `/portal/workspace`
- `/profile`
- `/settings`
- `/support`

Then complete the public-to-portal bridge:
`register -> kyc -> kyc/status -> handoff -> /portal/dashboard`

Keep the final production structure locked:
- Vercel public platform = public front
- gem-enterprise = authenticated portal
- Atlassian = internal operations
