-- Command-center operating models
-- Generated for review only. Do not apply to production without disposable-database validation and explicit owner approval.

CREATE TYPE "EnterpriseSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "EnterpriseBillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'USAGE_BASED', 'CUSTOM');
CREATE TYPE "EnterpriseUsageRecordStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REVERSED');
CREATE TYPE "EnterpriseSecurityAssetStatus" AS ENUM ('ACTIVE', 'MONITORED', 'DEGRADED', 'RETIRED');
CREATE TYPE "EnterpriseSecurityIncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED');
CREATE TYPE "EnterpriseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "EnterpriseComplianceControlStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY', 'EVIDENCE_REQUIRED', 'OVERDUE', 'BLOCKED', 'COMPLETE');
CREATE TYPE "EnterpriseComplianceTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'COMPLETE', 'CANCELLED');
CREATE TYPE "EnterpriseRiskStatus" AS ENUM ('OPEN', 'MITIGATING', 'ACCEPTED', 'TRANSFERRED', 'CLOSED');
CREATE TYPE "EnterpriseGovernedAgentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'BLOCKED', 'RETIRED');
CREATE TYPE "EnterpriseAgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED');
CREATE TYPE "EnterpriseIntegrationHealthStatus" AS ENUM ('UNKNOWN', 'HEALTHY', 'DEGRADED', 'OUTAGE', 'AUTHORIZATION_REQUIRED', 'DISCONNECTED');

CREATE TABLE "enterprise_subscriptions" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT,
  "externalProvider" TEXT,
  "externalCustomerId" TEXT,
  "externalPlanId" TEXT,
  "status" "EnterpriseSubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
  "billingInterval" "EnterpriseBillingInterval" NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "unitAmount" DECIMAL(18,2),
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_usage_records" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "metric" TEXT NOT NULL,
  "quantity" DECIMAL(18,6) NOT NULL,
  "unit" TEXT NOT NULL,
  "status" "EnterpriseUsageRecordStatus" NOT NULL DEFAULT 'PENDING',
  "idempotencyKey" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enterprise_usage_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_security_assets" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "assetType" TEXT NOT NULL,
  "externalRef" TEXT,
  "status" "EnterpriseSecurityAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "criticality" "EnterpriseSeverity" NOT NULL DEFAULT 'MEDIUM',
  "ownerLabel" TEXT,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_security_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_security_incidents" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "assetId" TEXT,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" "EnterpriseSeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "EnterpriseSecurityIncidentStatus" NOT NULL DEFAULT 'OPEN',
  "detectedAt" TIMESTAMP(3) NOT NULL,
  "acknowledgedAt" TIMESTAMP(3),
  "containedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "summary" TEXT,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_security_incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_compliance_frameworks" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" TEXT,
  "jurisdiction" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_compliance_frameworks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_compliance_controls" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "frameworkId" TEXT NOT NULL,
  "controlCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "EnterpriseComplianceControlStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "ownerLabel" TEXT,
  "dueAt" TIMESTAMP(3),
  "lastReviewedAt" TIMESTAMP(3),
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_compliance_controls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_compliance_evidence" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "evidenceType" TEXT NOT NULL,
  "storageRef" TEXT NOT NULL,
  "checksum" TEXT,
  "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enterprise_compliance_evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_compliance_tasks" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "controlId" TEXT,
  "title" TEXT NOT NULL,
  "status" "EnterpriseComplianceTaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "EnterpriseSeverity" NOT NULL DEFAULT 'MEDIUM',
  "ownerLabel" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_compliance_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_risks" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" "EnterpriseRiskStatus" NOT NULL DEFAULT 'OPEN',
  "likelihood" "EnterpriseSeverity" NOT NULL DEFAULT 'MEDIUM',
  "impact" "EnterpriseSeverity" NOT NULL DEFAULT 'MEDIUM',
  "ownerLabel" TEXT,
  "mitigationPlan" TEXT,
  "reviewAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_risks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_agents" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "modelProvider" TEXT,
  "modelName" TEXT,
  "status" "EnterpriseGovernedAgentStatus" NOT NULL DEFAULT 'DRAFT',
  "autonomyLevel" INTEGER NOT NULL DEFAULT 0,
  "humanApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
  "allowedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "blockedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_agents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enterprise_agents_autonomyLevel_check" CHECK ("autonomyLevel" >= 0 AND "autonomyLevel" <= 5)
);

CREATE TABLE "enterprise_agent_runs" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "status" "EnterpriseAgentRunStatus" NOT NULL DEFAULT 'QUEUED',
  "approvalRef" TEXT,
  "inputHash" TEXT NOT NULL,
  "outputHash" TEXT,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_agent_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enterprise_integration_health" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "connectorId" TEXT NOT NULL,
  "status" "EnterpriseIntegrationHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
  "lastCheckedAt" TIMESTAMP(3),
  "lastHealthyAt" TIMESTAMP(3),
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "latencyMs" INTEGER,
  "safeMetadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "enterprise_integration_health_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enterprise_integration_health_failureCount_check" CHECK ("failureCount" >= 0),
  CONSTRAINT "enterprise_integration_health_latencyMs_check" CHECK ("latencyMs" IS NULL OR "latencyMs" >= 0)
);

CREATE UNIQUE INDEX "enterprise_subscriptions_externalProvider_externalCustomerId_externalPlanId_key" ON "enterprise_subscriptions"("externalProvider", "externalCustomerId", "externalPlanId");
CREATE INDEX "enterprise_subscriptions_organizationId_status_idx" ON "enterprise_subscriptions"("organizationId", "status");
CREATE INDEX "enterprise_subscriptions_workspaceId_status_idx" ON "enterprise_subscriptions"("workspaceId", "status");
CREATE UNIQUE INDEX "enterprise_usage_records_workspaceId_idempotencyKey_key" ON "enterprise_usage_records"("workspaceId", "idempotencyKey");
CREATE INDEX "enterprise_usage_records_workspaceId_metric_occurredAt_idx" ON "enterprise_usage_records"("workspaceId", "metric", "occurredAt");
CREATE INDEX "enterprise_usage_records_subscriptionId_occurredAt_idx" ON "enterprise_usage_records"("subscriptionId", "occurredAt");
CREATE UNIQUE INDEX "enterprise_security_assets_workspaceId_externalRef_key" ON "enterprise_security_assets"("workspaceId", "externalRef");
CREATE INDEX "enterprise_security_assets_workspaceId_status_criticality_idx" ON "enterprise_security_assets"("workspaceId", "status", "criticality");
CREATE INDEX "enterprise_security_incidents_workspaceId_status_severity_idx" ON "enterprise_security_incidents"("workspaceId", "status", "severity");
CREATE INDEX "enterprise_security_incidents_workspaceId_detectedAt_idx" ON "enterprise_security_incidents"("workspaceId", "detectedAt");
CREATE UNIQUE INDEX "enterprise_compliance_frameworks_workspaceId_code_version_key" ON "enterprise_compliance_frameworks"("workspaceId", "code", "version");
CREATE INDEX "enterprise_compliance_frameworks_workspaceId_isActive_idx" ON "enterprise_compliance_frameworks"("workspaceId", "isActive");
CREATE UNIQUE INDEX "enterprise_compliance_controls_frameworkId_controlCode_key" ON "enterprise_compliance_controls"("frameworkId", "controlCode");
CREATE INDEX "enterprise_compliance_controls_workspaceId_status_dueAt_idx" ON "enterprise_compliance_controls"("workspaceId", "status", "dueAt");
CREATE INDEX "enterprise_compliance_evidence_workspaceId_collectedAt_idx" ON "enterprise_compliance_evidence"("workspaceId", "collectedAt");
CREATE INDEX "enterprise_compliance_evidence_controlId_expiresAt_idx" ON "enterprise_compliance_evidence"("controlId", "expiresAt");
CREATE INDEX "enterprise_compliance_tasks_workspaceId_status_dueAt_idx" ON "enterprise_compliance_tasks"("workspaceId", "status", "dueAt");
CREATE INDEX "enterprise_risks_workspaceId_status_impact_idx" ON "enterprise_risks"("workspaceId", "status", "impact");
CREATE INDEX "enterprise_risks_workspaceId_reviewAt_idx" ON "enterprise_risks"("workspaceId", "reviewAt");
CREATE UNIQUE INDEX "enterprise_agents_workspaceId_name_key" ON "enterprise_agents"("workspaceId", "name");
CREATE INDEX "enterprise_agents_workspaceId_status_idx" ON "enterprise_agents"("workspaceId", "status");
CREATE UNIQUE INDEX "enterprise_agent_runs_workspaceId_correlationId_key" ON "enterprise_agent_runs"("workspaceId", "correlationId");
CREATE INDEX "enterprise_agent_runs_agentId_status_createdAt_idx" ON "enterprise_agent_runs"("agentId", "status", "createdAt");
CREATE UNIQUE INDEX "enterprise_integration_health_connectorId_key" ON "enterprise_integration_health"("connectorId");
CREATE INDEX "enterprise_integration_health_workspaceId_status_idx" ON "enterprise_integration_health"("workspaceId", "status");

ALTER TABLE "enterprise_subscriptions" ADD CONSTRAINT "enterprise_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "tokmetric_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_subscriptions" ADD CONSTRAINT "enterprise_subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_usage_records" ADD CONSTRAINT "enterprise_usage_records_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_usage_records" ADD CONSTRAINT "enterprise_usage_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "enterprise_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enterprise_security_assets" ADD CONSTRAINT "enterprise_security_assets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_security_incidents" ADD CONSTRAINT "enterprise_security_incidents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_security_incidents" ADD CONSTRAINT "enterprise_security_incidents_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "enterprise_security_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_frameworks" ADD CONSTRAINT "enterprise_compliance_frameworks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_controls" ADD CONSTRAINT "enterprise_compliance_controls_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_controls" ADD CONSTRAINT "enterprise_compliance_controls_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "enterprise_compliance_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_evidence" ADD CONSTRAINT "enterprise_compliance_evidence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_evidence" ADD CONSTRAINT "enterprise_compliance_evidence_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "enterprise_compliance_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_tasks" ADD CONSTRAINT "enterprise_compliance_tasks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_compliance_tasks" ADD CONSTRAINT "enterprise_compliance_tasks_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "enterprise_compliance_controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enterprise_risks" ADD CONSTRAINT "enterprise_risks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_agents" ADD CONSTRAINT "enterprise_agents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_agent_runs" ADD CONSTRAINT "enterprise_agent_runs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_agent_runs" ADD CONSTRAINT "enterprise_agent_runs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "enterprise_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_integration_health" ADD CONSTRAINT "enterprise_integration_health_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enterprise_integration_health" ADD CONSTRAINT "enterprise_integration_health_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "tokmetric_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
