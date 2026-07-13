-- Release 2: separated enterprise, Community, and product intake funnels.
-- This migration is additive. It must be validated on a disposable PostgreSQL database
-- before any production deployment or `prisma migrate deploy` execution.

CREATE TYPE "IntakeKind" AS ENUM (
  'ENTERPRISE',
  'COMMUNITY',
  'PRODUCT_REQUEST'
);

CREATE TYPE "IntakeSubmissionStatus" AS ENUM (
  'RECEIVED',
  'TRIAGE',
  'NEEDS_INFORMATION',
  'QUALIFIED',
  'APPROVED',
  'DECLINED',
  'CONVERTED',
  'CLOSED'
);

CREATE TABLE "intake_submissions" (
  "id" TEXT NOT NULL,
  "public_id" TEXT NOT NULL,
  "kind" "IntakeKind" NOT NULL,
  "status" "IntakeSubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
  "queue" TEXT NOT NULL,
  "user_id" TEXT,
  "assigned_to_id" TEXT,
  "product_slug" TEXT,
  "product_name" TEXT,
  "product_sku" TEXT,
  "product_category" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "organization" TEXT,
  "title" TEXT,
  "jurisdiction" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "consent_version" TEXT NOT NULL,
  "consent_given_at" TIMESTAMP(3) NOT NULL,
  "privacy_version" TEXT NOT NULL,
  "privacy_accepted_at" TIMESTAMP(3) NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'web',
  "ip_hash" TEXT,
  "user_agent_hash" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "intake_submissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intake_submissions_public_id_key" UNIQUE ("public_id"),
  CONSTRAINT "intake_submissions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "intake_submissions_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "intake_status_events" (
  "id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "from_status" "IntakeSubmissionStatus",
  "to_status" "IntakeSubmissionStatus" NOT NULL,
  "actor_id" TEXT,
  "reason" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "intake_status_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intake_status_events_submission_id_fkey"
    FOREIGN KEY ("submission_id") REFERENCES "intake_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "intake_status_events_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Supabase exposes public-schema tables through PostgREST. Keep both tables fail-closed:
-- application access uses the trusted server-side PostgreSQL connection and no public RLS
-- policies are created by this migration.
ALTER TABLE "intake_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "intake_status_events" ENABLE ROW LEVEL SECURITY;

CREATE INDEX "intake_submissions_kind_status_created_at_idx"
  ON "intake_submissions"("kind", "status", "created_at" DESC);

CREATE INDEX "intake_submissions_queue_status_created_at_idx"
  ON "intake_submissions"("queue", "status", "created_at" DESC);

CREATE INDEX "intake_submissions_email_created_at_idx"
  ON "intake_submissions"("email", "created_at" DESC);

CREATE INDEX "intake_submissions_product_slug_created_at_idx"
  ON "intake_submissions"("product_slug", "created_at" DESC);

CREATE INDEX "intake_submissions_user_id_idx"
  ON "intake_submissions"("user_id");

CREATE INDEX "intake_submissions_assigned_to_id_status_idx"
  ON "intake_submissions"("assigned_to_id", "status");

CREATE INDEX "intake_status_events_submission_id_created_at_idx"
  ON "intake_status_events"("submission_id", "created_at");

CREATE INDEX "intake_status_events_actor_id_created_at_idx"
  ON "intake_status_events"("actor_id", "created_at" DESC);
