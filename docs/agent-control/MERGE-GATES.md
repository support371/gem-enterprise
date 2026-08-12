# Merge Gates

Allowed statuses are `NOT_STARTED`, `IN_PROGRESS`, `PASS`, `PARTIAL`,
`BLOCKED`, and `HUMAN_REQUIRED`.

A task may be recommended for merge review only when evidence proves:

- Correct repository, default branch, base, working branch, and exact head
- Exact changed-file inventory and no unexpected ownership overlap
- Intended configuration-independent and configuration-dependent tests passed
- `git diff --check` passed
- CI result names, conclusions, and exact SHA captured
- Reviews and unresolved review threads refreshed
- Stale-base and drift assessed; no blind rebase
- Rollback point identified
- Secret-like material absent
- Human gates classified separately from automatable blockers
- Any old PR is superseded only after current-main behavior and replacement
  evidence prove supersession
- The merge has a product/evidence purpose, not backlog reduction

Vercel success alone is insufficient. A check that did not start is not a pass.
`PASS` requires exact-head evidence. `BLOCKED` and `HUMAN_REQUIRED` require
new evidence before transition. Merge and production activation remain separate
decisions.
