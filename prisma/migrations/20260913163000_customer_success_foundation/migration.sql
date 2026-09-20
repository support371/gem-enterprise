CREATE TABLE "customer_success_profiles" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "projectId" TEXT,
  "ownerUserId" TEXT,
  "lifecycleState" TEXT NOT NULL DEFAULT 'ACTIVE',
  "healthStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "outcomeStatus" TEXT NOT NULL DEFAULT 'NOT_REVIEWED',
  "satisfactionScore" INTEGER,
  "outcomeSummary" TEXT,
  "lastReviewAt" TIMESTAMP(3),
  "nextReviewAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_success_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_success_profiles_lifecycle_check" CHECK ("lifecycleState" IN ('ACTIVE', 'AT_RISK', 'PAUSED', 'COMPLETED', 'DORMANT')),
  CONSTRAINT "customer_success_profiles_health_check" CHECK ("healthStatus" IN ('UNKNOWN', 'HEALTHY', 'WATCH', 'AT_RISK')),
  CONSTRAINT "customer_success_profiles_outcome_check" CHECK ("outcomeStatus" IN ('NOT_REVIEWED', 'IN_PROGRESS', 'ACHIEVED', 'PARTIAL', 'NOT_ACHIEVED')),
  CONSTRAINT "customer_success_profiles_satisfaction_check" CHECK ("satisfactionScore" IS NULL OR ("satisfactionScore" >= 0 AND "satisfactionScore" <= 10))
);

CREATE TABLE "customer_success_actions" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "projectId" TEXT,
  "createdById" TEXT,
  "actionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "evidence" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_success_actions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_success_actions_type_check" CHECK ("actionType" IN ('FOLLOW_UP', 'OUTCOME', 'EXPANSION', 'RENEWAL', 'REFERRAL', 'WIN_BACK')),
  CONSTRAINT "customer_success_actions_status_check" CHECK ("status" IN ('PLANNED', 'OPEN', 'WAITING', 'COMPLETED', 'CANCELLED'))
);

CREATE UNIQUE INDEX "customer_success_profiles_workspaceId_key" ON "customer_success_profiles"("workspaceId");
CREATE INDEX "customer_success_profiles_healthStatus_nextReviewAt_idx" ON "customer_success_profiles"("healthStatus", "nextReviewAt");
CREATE INDEX "customer_success_actions_workspaceId_status_dueAt_idx" ON "customer_success_actions"("workspaceId", "status", "dueAt");
CREATE INDEX "customer_success_actions_profileId_actionType_idx" ON "customer_success_actions"("profileId", "actionType");

ALTER TABLE "customer_success_profiles" ADD CONSTRAINT "customer_success_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_success_profiles" ADD CONSTRAINT "customer_success_profiles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "organization_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_success_profiles" ADD CONSTRAINT "customer_success_profiles_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_success_actions" ADD CONSTRAINT "customer_success_actions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "customer_success_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_success_actions" ADD CONSTRAINT "customer_success_actions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_success_actions" ADD CONSTRAINT "customer_success_actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "organization_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_success_actions" ADD CONSTRAINT "customer_success_actions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_success_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_success_actions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "customer_success_profiles" FROM anon, authenticated;
REVOKE ALL ON TABLE "customer_success_actions" FROM anon, authenticated;
