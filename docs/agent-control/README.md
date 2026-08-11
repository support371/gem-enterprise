# Agent Control Plane

This directory is the persistent, repository-native contract shared by ChatGPT
Work, Codex, Jules, and future coding agents. Chat history is context, not the
system of record.

## Start here

1. Read [ACTIVE-WORK](ACTIVE-WORK.md).
2. Confirm ownership in [OWNERSHIP](OWNERSHIP.md).
3. Open the linked task contract under [tasks/](tasks/).
4. Classify blockers with [FAILURE-TAXONOMY](FAILURE-TAXONOMY.md).
5. Apply [MERGE-GATES](MERGE-GATES.md).
6. Leave a [SESSION-HANDOFF](SESSION-HANDOFF.md).

New work starts from [TASK-TEMPLATE](TASK-TEMPLATE.md). Unassigned work remains
in [BACKLOG](BACKLOG.md). Completed contracts move to [completed/](completed/).

Live PR facts are snapshots and must be refreshed before mutation or readiness
claims. Exact resulting commit SHAs belong in GitHub/CI evidence and session
handoffs; a document must not require its own future commit SHA.
