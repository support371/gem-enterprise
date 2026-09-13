CREATE TABLE "communication_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "channel" TEXT NOT NULL,
  "destinationNormalized" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "basis" TEXT,
  "jurisdiction" TEXT,
  "source" TEXT NOT NULL,
  "evidenceRef" TEXT,
  "changedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "communication_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "communication_preferences_channel_check" CHECK ("channel" IN ('EMAIL', 'SMS', 'PHONE')),
  CONSTRAINT "communication_preferences_purpose_check" CHECK ("purpose" IN ('MARKETING', 'TRANSACTIONAL', 'SUPPORT')),
  CONSTRAINT "communication_preferences_status_check" CHECK ("status" IN ('PENDING', 'ALLOWED', 'BLOCKED')),
  CONSTRAINT "communication_preferences_basis_check" CHECK ("basis" IS NULL OR "basis" IN ('EXPLICIT_CONSENT', 'EXISTING_RELATIONSHIP', 'LEGITIMATE_INTEREST_REVIEWED', 'TRANSACTIONAL_NECESSITY', 'OTHER_REVIEWED'))
);

CREATE TABLE "communication_preference_events" (
  "id" TEXT NOT NULL,
  "preferenceId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorUserId" TEXT,
  "source" TEXT NOT NULL,
  "evidence" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "communication_preference_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "communication_preference_events_type_check" CHECK ("eventType" IN ('CREATED', 'ALLOWED', 'BLOCKED', 'UNSUBSCRIBED', 'RESUBSCRIBED'))
);

CREATE UNIQUE INDEX "communication_preferences_channel_destination_purpose_key"
  ON "communication_preferences"("channel", "destinationNormalized", "purpose");
CREATE INDEX "communication_preferences_status_purpose_idx"
  ON "communication_preferences"("status", "purpose", "channel");
CREATE INDEX "communication_preferences_userId_idx"
  ON "communication_preferences"("userId");
CREATE INDEX "communication_preference_events_preferenceId_createdAt_idx"
  ON "communication_preference_events"("preferenceId", "createdAt");

ALTER TABLE "communication_preferences" ADD CONSTRAINT "communication_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_preferences" ADD CONSTRAINT "communication_preferences_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Event history is evidence. A preference row cannot be deleted while its immutable events exist.
ALTER TABLE "communication_preference_events" ADD CONSTRAINT "communication_preference_events_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "communication_preferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "communication_preference_events" ADD CONSTRAINT "communication_preference_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enforce the documented append-only event contract at the database boundary, including for
-- privileged application connections. New evidence is inserted; existing evidence is never
-- rewritten or removed by normal application/database operations.
CREATE OR REPLACE FUNCTION "prevent_communication_preference_event_mutation"()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'communication_preference_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "communication_preference_events_append_only"
BEFORE UPDATE OR DELETE ON "communication_preference_events"
FOR EACH ROW EXECUTE FUNCTION "prevent_communication_preference_event_mutation"();

ALTER TABLE "communication_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "communication_preference_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "communication_preferences" FROM anon, authenticated;
REVOKE ALL ON TABLE "communication_preference_events" FROM anon, authenticated;
