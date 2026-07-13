# GEM Verify Pilot Evidence — Release Verification

## Scope

PR #178 adds a read-only administrator evidence report for one exact GEM Verify Phase 1B synthetic application and one exact analyst account.

## Production gateway

- Supabase function: `gem-pilot-evidence-read-v4`
- Project: `slzdjoqpzbkwzuaexlkj`
- Deployment status: `ACTIVE`
- Deployed source hash: `0994609dfb8250944762deb114acedcbd3417518278d28a2434701d2d3417b66`
- Supabase JWT verification: disabled intentionally
- Mandatory custom authentication: valid, active GEM administrator session verified through `gem-admin-read`
- Existing authentication, administration, audit, readiness, and retention functions are unchanged.

The application sends no embedded Supabase JWT or API key to this function. Every request must still carry a valid GEM administrator session token in its JSON body. The function validates that session through the existing administrator gateway before performing any read.

The gateway accepts both production gateway login audits (`resource=auth`) and local login audits (`resource=user`), then normalizes successful login evidence to the evaluator contract.

## Evidence requirements

A report passes only when all of the following are present:

- explicit `gem-verify-phase-1b` synthetic marker;
- a genuinely new synthetic case rather than a repurposed active application;
- active verified applicant, analyst, and administrator-level decision maker;
- audited analyst role designation;
- successful login audits for all three controlled identities;
- audited case creation, consent, initial submission, assignment, first review start, information request, resubmission, second review start, and final decision;
- ordered and unique review history;
- decision-role separation;
- zero attached documents.

## Data boundary

The report returns no applicant names, email addresses, form fields, review notes, document metadata, passwords, tokens, connection strings, or database credentials. The production gateway only returns IDs, role/status flags, timestamps, workflow action names, the explicit synthetic marker, document count, and four allowlisted audit metadata keys.

## Canonical verification

- Verified preview commit: `72134f418dc604484607eedcaaee841481d7c40a`
- Canonical preview deployment: `dpl_ActjmFcBBF7UwJD5x3G8iscYXwop` — `READY`
- Production merge commit: `774787397d5abe5316ec0cb6fe0d92cfd9f17b8e`
- Production deployment: `dpl_75LCB2yeYvA6nFRg36mxRw84tfvz` — `READY`
- Production aliases: `gemcybersecurityassist.com` and `www.gemcybersecurityassist.com`

The exact preview passed Prisma generation, ESLint with zero warnings, `tsc --noEmit`, 40 Vitest files, 302 tests, Next.js optimized compilation, the framework TypeScript pass, and generation of 269 pages.

The production deployment passed Prisma generation, Next.js optimized compilation, the framework TypeScript pass, and generation of 269 pages. The live administrator page redirects unauthenticated users to the client login while preserving its destination. The live evidence API returns `401 Unauthorized` without an administrator session and uses `Cache-Control: no-store`.

## Operational acceptance boundary

The reporting infrastructure is released, but Issue #152 remains open until company-controlled analyst and applicant identities are provisioned and the authenticated synthetic workflow is completed. Production currently contains one active verified administrator-level identity, no eligible analyst or applicant identities, and zero verification applications. No test account or case was created as part of this release.