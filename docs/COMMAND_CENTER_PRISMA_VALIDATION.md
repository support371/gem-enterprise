# Command Center Prisma Validation

This draft-branch record exists to trigger canonical preview validation after enabling the deterministic schema-promotion hook.

Validation scope:

- apply the reviewed command-center operating-model transformation in the preview workspace;
- run `prisma validate` and `prisma generate`;
- run lint, TypeScript validation, unit tests, and the Next.js production build;
- do not connect to or migrate the production database;
- keep PR #173 in draft until a formal disposable-database migration and rollback test are complete.
