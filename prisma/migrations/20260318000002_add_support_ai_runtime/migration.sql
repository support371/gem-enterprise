-- GEM Enterprise — Support Chat + AI Governance Tables
-- Adds support session persistence and AI run audit trail.
-- Replaces in-memory support store with Prisma-backed persistence.

-- AlterEnum: add support + AI audit actions
ALTER TYPE "AuditAction" ADD VALUE 'support_session_started';
ALTER TYPE "AuditAction" ADD VALUE 'support_session_closed';
ALTER TYPE "AuditAction" ADD VALUE 'support_consent_given';
ALTER TYPE "AuditAction" ADD VALUE 'support_escalated';
ALTER TYPE "AuditAction" ADD VALUE 'support_booking_created';
ALTER TYPE "AuditAction" ADD VALUE 'ai_session_opened';
ALTER TYPE "AuditAction" ADD VALUE 'ai_message_responded';
ALTER TYPE "AuditAction" ADD VALUE 'ai_message_escalated';
ALTER TYPE "AuditAction" ADD VALUE 'ai_session_closed';

-- CreateEnum
CREATE TYPE "SupportSessionStatus" AS ENUM ('active', 'escalated', 'closed');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateTable: support_sessions
-- Persists chat widget sessions: consent, messages (JSONB), tier, status.
CREATE TABLE "support_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userTier" TEXT NOT NULL DEFAULT 'standard',
    "status" "SupportSessionStatus" NOT NULL DEFAULT 'active',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: support_escalations
-- Records each time a support session was escalated to a human queue.
CREATE TABLE "support_escalations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "queue" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: support_bookings
-- Advisory / consultation bookings created from support sessions.
CREATE TABLE "support_bookings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preferredAt" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ai_runs
-- Immutable record of each governed AI chat session opened by a user.
-- disclosureTextHash links the session to the exact disclosure text accepted.
CREATE TABLE "ai_runs" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "promptClass" TEXT NOT NULL DEFAULT 'GENERAL',
    "consentReceiptId" TEXT NOT NULL,
    "disclosureTextHash" TEXT NOT NULL,
    "transcriptPointer" TEXT,
    "escalationTriggered" BOOLEAN NOT NULL DEFAULT false,
    "escalationReason" TEXT,
    "outputStatus" TEXT NOT NULL DEFAULT 'open',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: consent_records
-- One record per AiRun; proves the user saw and accepted the AI disclosure.
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "aiRunId" TEXT NOT NULL,
    "userId" TEXT,
    "disclosureTextHash" TEXT NOT NULL,
    "consentGivenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ai_escalation_events
-- Records each message that triggered a restricted class escalation.
CREATE TABLE "ai_escalation_events" (
    "id" TEXT NOT NULL,
    "aiRunId" TEXT NOT NULL,
    "restrictedClass" TEXT NOT NULL,
    "messagePreview" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_escalation_events_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "consent_records_aiRunId_key" ON "consent_records"("aiRunId");

-- AddForeignKey
ALTER TABLE "support_escalations" ADD CONSTRAINT "support_escalations_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "support_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_bookings" ADD CONSTRAINT "support_bookings_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "support_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_aiRunId_fkey"
    FOREIGN KEY ("aiRunId") REFERENCES "ai_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_escalation_events" ADD CONSTRAINT "ai_escalation_events_aiRunId_fkey"
    FOREIGN KEY ("aiRunId") REFERENCES "ai_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
