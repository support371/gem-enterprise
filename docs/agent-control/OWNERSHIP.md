# Ownership

One mutation owner controls each overlapping file set. Read-only review may be
parallel; mutation may not. No agent silently assumes another lane.

## ChatGPT Work

- Coordinator and integration/review authority
- Dependency reconciliation and task-spec maintenance
- Exact-head verification and merge-readiness assessment
- Does not mutate an implementation lane while another owner is active

## Codex

- Primary repository implementation agent
- Targeted security and architecture work, tests, and focused fixes
- Owns one task and branch at a time
- Stops before overlapping files owned by another lane

## Jules

- Parallel implementation agent for isolated substantial workstreams
- Uses the same task contract, failure taxonomy, handoff, and merge gates
- Must not overlap mutation with Codex

## Human

- Provider credential rotation/revocation and secret-store updates
- Production approvals and regulated/legal governance
- Real media, likeness, voice, and device acceptance
- Any task contract explicitly marked `HUMAN_REQUIRED`

Ownership transfers require a recorded handoff naming the task, exact head,
changed files, tests, blocker class, rollback point, and next safe action.
