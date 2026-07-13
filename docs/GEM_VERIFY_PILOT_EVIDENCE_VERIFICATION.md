# GEM Verify Pilot Evidence — Release Verification

## Scope

PR #178 adds a read-only administrator evidence report for one exact GEM Verify Phase 1B synthetic application and one exact analyst account.

## Production gateway

- Supabase function: `gem-pilot-evidence-read-v4`
- Project: `slzdjoqpzbkwzuaexlkj`
- Deployment status: `ACTIVE`
- Supabase JWT verification: disabled intentionally
- Mandatory custom authentication: valid, active GEM administrator session verified through `gem-admin-read`
- Existing authentication, administration, audit, readiness, and retention functions are unchanged.

The application sends no embedded Supabase JWT or API key to this function. Every request must still carry a valid GEM administrator session token in its JSON body. The function validates that session through the existing administrator gateway before performing any read.

The gateway accepts both production gateway login audits (`resource=auth`) and local login audits (`resource=user`), then normalizes successful login evidence to the evaluator contract.

## Evidence requirements

A report passes only when all of the following are present:

- explicit `gem-verify-phase-1b` synthetic marker;
- active verified applicant, analyst, and administrator-level decision maker;
- audited analyst role designation;
- successful login audits for all three controlled identities;
- audited case creation, consent, initial submission, assignment, first review start, information request, resubmission, second review start, and final decision;
- ordered and unique review history;
- decision-role separation;
- zero attached documents.

## Data boundary

The report returns no applicant names, email addresses, form fields, review notes, document metadata, passwords, tokens, connection strings, or database credentials. The production gateway only returns IDs, role/status flags, timestamps, workflow action names, the explicit synthetic marker, document count, and four allowlisted audit metadata keys.

## Merge gate

Merge only when the canonical `Vercel – support371-gem-enterprise` deployment for the exact synchronized head passes Prisma generation, ESLint, TypeScript, Vitest, and Next.js production compilation.
