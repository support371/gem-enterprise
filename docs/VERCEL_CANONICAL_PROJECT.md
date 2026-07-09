# Canonical Vercel Project

Verified on 2026-07-09 after the dashboard cleanup.

## Canonical project

- Name: `support371-gem-enterprise`
- Project ID: `prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z`
- Production domains:
  - `https://www.gemcybersecurityassist.com`
  - `https://gemcybersecurityassist.com`

This is the only Vercel project authorized to build and deploy `support371/gem-enterprise`.

## Disconnected duplicate projects

- `gem-enterprise` — `prj_iT8bNqbTiePiM2SZiWTkOUJXy3o0`
- `project-dtrl6` — `prj_TUZk9mqccnIGSsSpsti7jwg9D3W2`

After their Git connections were removed, neither duplicate created a deployment from subsequent repository activity. The repository-level `scripts/vercel-ignore.mjs` guard remains enabled as defense in depth and fails closed for non-canonical or unknown Vercel projects.

## Verification rule

Before merging a pull request:

1. Confirm the pull-request head creates a deployment only in the canonical project.
2. Confirm the canonical preview reaches `READY`.
3. Inspect the canonical build logs for lint, TypeScript, unit-test, Prisma, and Next.js build results.
4. Do not treat historical checks from disconnected projects as current deployment evidence.
