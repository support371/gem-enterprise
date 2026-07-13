# Release 1 Public Truth Changelog

## Added

- Canonical production architecture document
- Public truth routing test
- Release verification, rollback, and acceptance records

## Changed

- Temporary redirect from `/community` to `/community-hub`
- Permanent redirect from `/register` to `/get-started`
- Community Hub root metadata to prevent indexing
- README to match the current production stack and safety posture
- Developer onboarding to use Node 24, pnpm 10.28, and the real verification gate
- Deployment guide to preserve one canonical Vercel Git deployment path

## Not changed

- Prisma schema
- Database migrations
- Production secrets
- Authentication provider
- Payment configuration
- KYC upload activation
- External publishing or advertising gates
