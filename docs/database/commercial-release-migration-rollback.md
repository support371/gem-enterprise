# Commercial release migration rollback procedure

Applies to:

- `20260913163000_customer_success_foundation`
- `20260913170000_communication_governance`

This is a controlled rollback procedure, not an automatic downgrade script. The preferred response to an application defect is **roll the application back while retaining additive tables and evidence**, then roll forward after the defect is corrected. Destructive schema rollback requires explicit owner approval after evidence preservation and retention review.

## Preconditions

1. Stop commercial release promotion and campaign delivery.
2. Set `COMMUNICATION_GOVERNANCE_ENABLED=false` before any communication-governance rollback.
3. Do not use `prisma db push`, `AUTO_DB_PUSH`, or `AUTO_DB_SEED` to attempt a rollback.
4. Capture the production deployment SHA, database project reference, migration state, and UTC start time in the release incident record.
5. Take a database backup/snapshot using the production Supabase backup mechanism or an equivalent verified PostgreSQL backup.
6. Export the affected tables and record row counts before any destructive action:
   - `customer_success_profiles`
   - `customer_success_actions`
   - `communication_preferences`
   - `communication_preference_events`
7. Treat `communication_preference_events` as compliance/audit evidence. Do not delete it merely to make a rollback convenient. Destructive removal requires explicit retention/legal approval and an archived copy with integrity evidence.

## Level 1 — application rollback (preferred)

Use this path when the new application behavior is defective but the additive schema is healthy.

1. Keep the two migrations applied.
2. Keep campaign sending disabled if communication behavior is implicated.
3. Roll the Vercel production deployment back to the last verified application release that does not depend on the new commercial tables, or deploy the approved prior application SHA.
4. Confirm `/api/health` and core authentication/intake/support routes are healthy.
5. Confirm no background or operator path is writing to the new commercial tables from the rolled-back application.
6. Preserve the tables for diagnosis and roll forward with a corrected application release.

This level avoids data loss and is the default rollback strategy.

## Level 2 — schema rollback (exception only)

Use only when the schema itself must be removed and the owner has approved destructive rollback after the backup/evidence checks above.

### A. Communication governance

Before removal:

- campaign delivery must be disabled;
- the application must already be rolled back to a version that does not query these tables;
- `communication_preference_events` must be exported and retained with row count and backup reference;
- retention approval must explicitly permit destructive removal.

Removal order is important because event history uses `ON DELETE RESTRICT` and an append-only trigger:

```sql
BEGIN;

DROP TRIGGER IF EXISTS "communication_preference_events_append_only"
  ON "communication_preference_events";

DROP TABLE IF EXISTS "communication_preference_events";
DROP TABLE IF EXISTS "communication_preferences";
DROP FUNCTION IF EXISTS "prevent_communication_preference_event_mutation"();

COMMIT;
```

Do not run this block unless the archived event evidence has been verified and destructive rollback has been approved.

### B. Customer Success

Before removal:

- the application must already be rolled back to a version that does not query these tables;
- both tables must be exported and row counts recorded.

Remove children before parents:

```sql
BEGIN;

DROP TABLE IF EXISTS "customer_success_actions";
DROP TABLE IF EXISTS "customer_success_profiles";

COMMIT;
```

## Migration-history handling

Do not falsify Prisma migration history and do not mark a migration rolled back merely because an application deployment was rolled back. If Level 2 schema rollback is approved, record the exact database commands, backup reference, operator, UTC timestamps, and migration-history reconciliation in the release incident. Any subsequent reapplication must use the reviewed SQL migrations through the controlled database release mechanism.

## Post-rollback verification

After either rollback level:

1. `GET /api/health` returns healthy for the intended production database path.
2. Authentication, public intake, support, and existing workspace operations pass smoke tests.
3. Campaign delivery remains fail-closed unless communication governance storage and production sender configuration are verified.
4. No application route returns repeated missing-table errors.
5. Backup/export row counts and references are attached to the incident record.
6. For Level 2, verify the removed tables/functions are absent and confirm the application version no longer depends on them.
7. Record the final rollback status and the approved roll-forward plan.

## Owner approval gate

Production schema rollback is **HUMAN_REQUIRED**. The executing operator must record explicit owner approval before Level 2. Application rollback under Level 1 may follow the existing production rollback authority, but must still preserve evidence and be recorded.
