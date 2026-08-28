# IWW Product Launcher — Independent SaaS Boundary

## Identity

- Owner: Codex / enterprise product directory lane
- Base: `29a7134`
- Branch: `codex/workspace-iww-product-launch`
- Status: `IMPLEMENTED — LOCAL GATES PASSED`

## Objective

Add a governed GEM Workspace OS product directory that locates company control
domains and launches Infinite World of Well-Being without merging repositories,
identity, data, secrets, or deployment authority.

## Owned files

- `src/lib/enterpriseProductRegistry.ts`
- `src/app/app/platform-products/page.tsx`
- `src/app/api/platform-products/route.ts`
- `src/__tests__/enterprise-product-registry.test.ts`
- `src/components/command-center/CommandCenterDirectory.tsx` (one directory card only)
- `docs/agent-control/tasks/IWW-PRODUCT-LAUNCHER.md`

## Requirements

- Keep GEM and IWW repositories, sessions, data, service keys, and deployments separate.
- Require a server-authoritative GEM administrator role for the directory and API.
- Treat the IWW launch as navigation only; it never grants IWW access.
- Keep unbuilt crypto products fail closed with no live launch URL.
- Link company production, team, marketing/sales, development, crypto governance,
  AI/agent, and integration work to their GEM operating areas.
- Do not overlap the active strict-role portal or Workspace OS connector lanes.

## Verification

Run focused tests, lint, typecheck, full repository verification, tracked-secret
checks already included by the repository, `git diff --check`, and exact-head
preview validation before merge.

Local evidence: public claims current; lint and typecheck passed; 113 test files
and 675 tests passed; the Next.js production build passed and generated the new
page and API route. Exact-head hosted preview remains the merge gate.
