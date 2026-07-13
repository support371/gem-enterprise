# Release 1 Public Truth Rollback

This release contains code and documentation changes only.

## Rollback conditions

Rollback when:

- `/community` does not redirect to `/community-hub` as intended.
- `/register` does not redirect to `/get-started`.
- The Community Hub loses its fictional-preview disclosure.
- The canonical Vercel build fails because of this change.
- A documentation or routing regression prevents normal public or authenticated access.

## Procedure

1. Stop the merge if the change is still in pull-request review.
2. If already merged, revert the merge commit through a focused reviewed pull request, or use Vercel's deployment rollback while the revert is prepared.
3. Confirm the previous production deployment is healthy.
4. Re-run public-route and protected-route smoke checks.
5. Record the incident and the exact failed acceptance criterion in issue #181.

## Data and provider impact

- No Prisma schema change
- No database migration
- No data backfill
- No provider activation
- No secret rotation
- No payment or billing action
- No external publishing

Rollback is therefore code-only.
