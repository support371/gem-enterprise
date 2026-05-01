# GEM Enterprise — Agent Instructions

## Project Overview
GEM Enterprise is a cybersecurity, financial security, asset recovery, and real estate protection platform.
- **Domain**: gemcybersecurityassist.com
- **Repository**: github.com/support371/gem-enterprise
- **Branch**: fix/stabilize-and-finalize-330047221298805619
- **Deployed on**: Vercel

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode should be enabled)
- **Database**: PostgreSQL via Prisma 5 ORM
- **Auth**: Custom JWT using `jose` library + `bcryptjs` for password hashing
- **Session**: Cookie-based (`gem_session`), httpOnly, 7-day expiry
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **AI**: Anthropic Claude API via direct integration (NOT Vercel AI SDK)
- **Email**: Resend (when configured)
- **Payments**: Stripe (when configured)
- **Package Manager**: pnpm (NEVER use npm or yarn)
- **Testing**: Vitest (unit) + Playwright (E2E)

## Architecture Rules — DO NOT VIOLATE
1. **Auth system**: The auth implementation is in `src/lib/auth.ts`. Do NOT replace it with NextAuth, Supabase Auth, Clerk, or any other auth library. Extend the existing JWT implementation.
2. **Database**: All models go in `prisma/schema.prisma`. Use `db` import from `src/lib/db.ts` for all database access. Never use raw SQL.
3. **Package manager**: Use `pnpm` for all commands. Never reference npm or yarn.
4. **API validation**: All API route inputs must be validated with Zod schemas. Never trust raw `req.json()`.
5. **Audit logging**: All admin and sensitive actions must call `emitAuditLog()` from `src/lib/audit.ts`.
6. **Evidence retention**: Compliance-sensitive data follows 7-year retention per `src/lib/evidence.ts`.
7. **Roles**: The system has 5 roles: client, analyst, admin, super_admin, internal. Never allow role escalation to super_admin or internal via API.
8. **AI consent**: All AI interactions require user consent via `ConsentRecord` model before proceeding.
9. **File organization**: Pages go in `src/app/`, API routes in `src/app/api/`, shared libraries in `src/lib/`, React components in `src/components/`, hooks in `src/hooks/`.
10. **Styling**: Match the existing dark theme. Use Tailwind utility classes. Do not add custom CSS files.

## Key Files Reference
- `src/lib/auth.ts` — JWT sign/verify, session management, KYC-gated routing
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/audit.ts` — Audit logging with `emitAuditLog()`
- `src/lib/evidence.ts` — 7-year evidence retention
- `src/lib/orchestration/orchestrate-support-reply.ts` — AI chat orchestration
- `src/lib/policy/evaluate-policy.ts` — AI policy evaluation engine
- `prisma/schema.prisma` — Database schema (22 models, 9 enums)
- `next.config.ts` — Security headers, redirects, image optimization
- `vercel.json` — Vercel deployment configuration

## Environment Variables
Required env vars are documented in `.env.example`. For development/testing, use these defaults:
- DATABASE_URL=postgresql://test:test@localhost:5432/gem_test
- JWT_SECRET=test-secret-that-is-at-least-32-characters-long-for-dev
- NEXT_PUBLIC_APP_URL=http://localhost:3000
- NEXT_PUBLIC_APP_NAME=GEM Enterprise
- AUDIT_ENABLED=true

## Verification Commands — RUN AFTER EVERY CHANGE
```bash
pnpm install --frozen-lockfile
pnpm run db:generate
pnpm build
pnpm test
```

If any of these fail, fix the errors before committing.

## Commit Convention
- Use conventional commits: feat:, fix:, chore:, test:, docs:
- Include the prompt number in commits: `feat(prompt-7): wire community hub to database`
- One logical change per commit when possible

## Testing Standards
- Unit tests go in `src/__tests__/`
- E2E tests go in `e2e/`
- Test files follow pattern: `*.test.ts` or `*.spec.ts`
- Mock external services (Anthropic, Resend, Stripe) — never call real APIs in tests
- Target 70%+ statement coverage

## PR Description Format
When creating a pull request, include:
1. **Prompt Reference**: Which prompt number this addresses
2. **Changes Summary**: What was added/modified/deleted
3. **Files Changed**: List of key files
4. **Testing**: What tests were added or updated
5. **Verification**: Confirm `pnpm build` and `pnpm test` pass
