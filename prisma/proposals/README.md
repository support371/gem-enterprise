# Prisma SQL Proposals

Files in this directory are **not automatic migrations**.

They exist for database changes that require schema consolidation, compatibility review, rollback planning, disposable-database testing, and explicit production approval before they can enter `prisma/migrations`.

## Command-center operating layer

`20260713_command_center_operating_layer.sql` proposes persistence for:

- subscriptions and plan state;
- usage-meter records;
- security incidents;
- compliance controls;
- governed AI agents;
- external integration health.

The proposal intentionally reuses the existing organization, workspace, user, and approval foundations. It does not store API secrets or payment credentials.

## Promotion procedure

1. Add the equivalent models and enums to `prisma/schema.prisma`.
2. Generate a Prisma migration against a disposable PostgreSQL database.
3. Compare the generated SQL with the reviewed proposal.
4. Run Prisma generation, lint, type checking, unit tests, and a production build.
5. Test forward migration and rollback on a database copy containing representative non-sensitive data.
6. Obtain explicit owner approval before production migration execution.
7. Apply the approved migration through the controlled deployment process, never from an unreviewed CI step.

Until those steps are complete, the command center reports `migration_required` and continues using clearly disclosed demo data for the new operating domains.
