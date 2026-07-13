# Canonical Vercel Project

Verified again on 2026-07-13 while consolidating repository deployment ownership.

## Canonical project

- Name: `support371-gem-enterprise`
- Team: `admin-25521151s-projects`
- Team ID: `team_7lMXW95WSLeyK4yAObe8FptW`
- Project ID: `prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z`
- Production domains:
  - `https://www.gemcybersecurityassist.com`
  - `https://gemcybersecurityassist.com`

This is the only Vercel project authorized to build and deploy `support371/gem-enterprise`.

## Repository enforcement

`scripts/vercel-ignore.mjs` is a fail-closed deployment guard:

- canonical project ID: build continues;
- any other explicit project ID: build is ignored;
- unknown Vercel or CI identity: build is ignored;
- local non-Vercel execution: normal development continues.

`src/__tests__/vercel-canonical-project.test.ts` protects those rules from regression.

## Legacy and duplicate status contexts

Current GitHub commits may still receive status contexts from projects outside the connected canonical team. Observed contexts include:

- `gem-enterprise`
- `gem-enterprise-in`
- `gem-enterprise-jx`
- `gem-enterprise-xf`
- `v0-continue-conversation`
- `v0-continue-conversation-3875`
- `v0-deployment-alignment-task`
- `v0-image-analysis`
- `v0-my-website`
- `v0-v0-geraldhoeven-4141-ff89f7f-5`

These contexts are not authoritative. Some belong to teams that are not connected to this workspace and therefore cannot be disconnected through the current Vercel integration. Their Git integrations must be removed by an owner of each respective Vercel team.

Previously identified duplicate projects include:

- `gem-enterprise` — `prj_iT8bNqbTiePiM2SZiWTkOUJXy3o0`
- `project-dtrl6` — `prj_TUZk9mqccnIGSsSpsti7jwg9D3W2`

Do not delete a legacy project until its domains, environment variables, deployment history, and ownership have been reviewed. Disconnect the Git integration first.

## Authoritative deployment rule

A pull request or `main` release is considered verified only when:

1. `Vercel – support371-gem-enterprise` reports for the exact commit SHA.
2. The canonical deployment reaches `READY`.
3. Canonical build logs show Prisma generation, ESLint, TypeScript, Vitest, and Next.js production compilation passing.
4. Production domains remain attached to project ID `prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z`.
5. Failures from legacy project contexts are not mistaken for canonical application failures.

## Remaining external cleanup

Repository-side prevention is complete when the guard test is green. Full Issue #33 completion additionally requires owners of the legacy Vercel teams to disconnect this GitHub repository from their projects so those status contexts stop appearing entirely.
