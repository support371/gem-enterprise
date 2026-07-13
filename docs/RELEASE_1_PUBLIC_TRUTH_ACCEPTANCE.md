# Release 1 Public Truth Acceptance Checklist

- [ ] `/community` returns a temporary redirect to `/community-hub`.
- [ ] `/register` returns a permanent redirect to `/get-started`.
- [ ] `/community-hub` renders the “Fictional interface preview” label.
- [ ] `/community-hub` states that no live members, opportunities, events, secure messaging, or verified network are represented.
- [ ] `/community-hub` includes non-indexing metadata.
- [ ] `README.md` uses Node 24 and pnpm 10.28.
- [ ] `DEVELOPER_ONBOARDING.md` uses the frozen pnpm lockfile and `pnpm run verify`.
- [ ] `DEPLOYMENT.md` identifies Vercel Git integration as the canonical production deployment path.
- [ ] `docs/CANONICAL_PRODUCTION_ARCHITECTURE.md` records the system-of-record and Base44 boundaries.
- [ ] No Prisma schema or migration files changed.
- [ ] No production secrets changed.
- [ ] No provider or restricted feature was activated.
- [ ] `pnpm run verify` passes.
- [ ] Canonical Vercel preview passes.
- [ ] Production smoke checks pass after an approved merge.
