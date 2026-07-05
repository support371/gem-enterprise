-- CreateEnum
CREATE TYPE "TokMetricConnectorProvider" AS ENUM ('TIKTOK_LOGIN_KIT', 'TIKTOK_DISPLAY_API', 'TIKTOK_CONTENT_POSTING_API', 'TIKTOK_BUSINESS_API', 'TIKTOK_SHOP_SELLER', 'TIKTOK_SHOP_CREATOR');

-- CreateEnum
CREATE TYPE "TokMetricConnectorState" AS ENUM ('NOT_CONFIGURED', 'AUTHORIZATION_REQUIRED', 'AUTHORIZATION_PENDING', 'CONNECTED', 'DEGRADED', 'TOKEN_EXPIRED', 'REAUTHORIZATION_REQUIRED', 'DISCONNECTED', 'PLATFORM_APPROVAL_REQUIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TokMetricObjectState" AS ENUM ('DRAFT', 'REVIEW_READY', 'APPROVAL_REQUIRED', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TokMetricPolicyResult" AS ENUM ('PASS', 'PASS_WITH_DISCLOSURE', 'CHANGES_REQUIRED', 'HUMAN_REVIEW_REQUIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TokMetricPublishState" AS ENUM ('QUEUED', 'RUNNING', 'RETRYING', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_EXTERNAL_AUTHORIZATION', 'WAITING_FOR_PLATFORM', 'COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TokMetricExternalPublishState" AS ENUM ('NOT_SUBMITTED', 'UPLOAD_INITIALIZED', 'UPLOADED', 'PROCESSING', 'PUBLISHED_CONFIRMED', 'FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TokMetricAnalyticsSource" AS ENUM ('LIVE_PLATFORM', 'IMPORTED', 'MANUAL', 'SEEDED', 'CALCULATED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "workspaceId" TEXT;

-- CreateTable
CREATE TABLE "tokmetric_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_workspaces" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "globalEmergencyLock" BOOLEAN NOT NULL DEFAULT false,
    "publishingDisabled" BOOLEAN NOT NULL DEFAULT true,
    "advertisingDisabled" BOOLEAN NOT NULL DEFAULT true,
    "shopWriteDisabled" BOOLEAN NOT NULL DEFAULT true,
    "connectorDisabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_roles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_service_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_service_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_connectors" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "TokMetricConnectorProvider" NOT NULL,
    "state" "TokMetricConnectorState" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "displayName" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disabledAt" TIMESTAMP(3),
    "lastHealthAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_connector_credential_references" (
    "id" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "secretRef" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "rotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_connector_credential_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_campaigns" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "state" "TokMetricObjectState" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_campaign_versions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_campaign_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_contents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "state" "TokMetricObjectState" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_content_versions" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectHash" TEXT NOT NULL,
    "script" TEXT,
    "caption" TEXT,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "settings" JSONB NOT NULL DEFAULT '{}',
    "mediaAssetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_media_assets" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "ownerId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "objectHash" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "storageRef" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_compliance_policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'active',
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_compliance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_compliance_policy_versions" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectHash" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_compliance_policy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_compliance_reviews" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contentId" TEXT,
    "contentVersionId" TEXT,
    "policyVersionId" TEXT,
    "result" "TokMetricPolicyResult" NOT NULL,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_compliance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_approval_requests" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contentId" TEXT,
    "contentVersionId" TEXT,
    "requestedById" TEXT,
    "requiredRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "objectHash" TEXT NOT NULL,
    "state" "TokMetricObjectState" NOT NULL DEFAULT 'APPROVAL_REQUIRED',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_approval_decisions" (
    "id" TEXT NOT NULL,
    "approvalRequestId" TEXT NOT NULL,
    "actorId" TEXT,
    "decision" TEXT NOT NULL,
    "objectHash" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_approval_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_publish_jobs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "connectorId" TEXT,
    "contentId" TEXT,
    "contentVersionId" TEXT,
    "requestedById" TEXT,
    "idempotencyKey" TEXT,
    "internalState" "TokMetricPublishState" NOT NULL DEFAULT 'QUEUED',
    "externalState" "TokMetricExternalPublishState" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "externalRequestId" TEXT,
    "objectHash" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_publish_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_job_attempts" (
    "id" TEXT NOT NULL,
    "publishJobId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "state" "TokMetricPublishState" NOT NULL,
    "safeMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_job_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_analytics_snapshots" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "source" "TokMetricAnalyticsSource" NOT NULL DEFAULT 'UNKNOWN',
    "metric" TEXT NOT NULL,
    "value" DECIMAL(18,6) NOT NULL,
    "dimensions" JSONB NOT NULL DEFAULT '{}',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_webhook_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "safeMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_domain_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "safeMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_audit_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "correlationId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "sourceChannel" TEXT NOT NULL,
    "safeMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokmetric_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokmetric_idempotency_records" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokmetric_idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_organizations_slug_key" ON "tokmetric_organizations"("slug");

-- CreateIndex
CREATE INDEX "tokmetric_workspaces_organizationId_idx" ON "tokmetric_workspaces"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_workspaces_organizationId_slug_key" ON "tokmetric_workspaces"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "tokmetric_workspace_members_userId_idx" ON "tokmetric_workspace_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_workspace_members_workspaceId_userId_key" ON "tokmetric_workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_roles_workspaceId_name_key" ON "tokmetric_roles"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_permissions_roleId_action_scope_key" ON "tokmetric_permissions"("roleId", "action", "scope");

-- CreateIndex
CREATE INDEX "tokmetric_service_accounts_organizationId_idx" ON "tokmetric_service_accounts"("organizationId");

-- CreateIndex
CREATE INDEX "tokmetric_connectors_workspaceId_state_idx" ON "tokmetric_connectors"("workspaceId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_connectors_workspaceId_provider_externalAccountId_key" ON "tokmetric_connectors"("workspaceId", "provider", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_connector_credential_references_connectorId_refer_key" ON "tokmetric_connector_credential_references"("connectorId", "referenceType");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_campaigns_currentVersionId_key" ON "tokmetric_campaigns"("currentVersionId");

-- CreateIndex
CREATE INDEX "tokmetric_campaigns_workspaceId_state_idx" ON "tokmetric_campaigns"("workspaceId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_campaign_versions_campaignId_version_key" ON "tokmetric_campaign_versions"("campaignId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_campaign_versions_campaignId_objectHash_key" ON "tokmetric_campaign_versions"("campaignId", "objectHash");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_contents_currentVersionId_key" ON "tokmetric_contents"("currentVersionId");

-- CreateIndex
CREATE INDEX "tokmetric_contents_workspaceId_state_idx" ON "tokmetric_contents"("workspaceId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_content_versions_contentId_version_key" ON "tokmetric_content_versions"("contentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_content_versions_contentId_objectHash_key" ON "tokmetric_content_versions"("contentId", "objectHash");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_media_assets_workspaceId_checksum_version_key" ON "tokmetric_media_assets"("workspaceId", "checksum", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_compliance_policies_currentVersionId_key" ON "tokmetric_compliance_policies"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_compliance_policies_workspaceId_name_key" ON "tokmetric_compliance_policies"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_compliance_policy_versions_policyId_version_key" ON "tokmetric_compliance_policy_versions"("policyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_compliance_policy_versions_policyId_objectHash_key" ON "tokmetric_compliance_policy_versions"("policyId", "objectHash");

-- CreateIndex
CREATE INDEX "tokmetric_compliance_reviews_workspaceId_result_idx" ON "tokmetric_compliance_reviews"("workspaceId", "result");

-- CreateIndex
CREATE INDEX "tokmetric_approval_requests_workspaceId_state_idx" ON "tokmetric_approval_requests"("workspaceId", "state");

-- CreateIndex
CREATE INDEX "tokmetric_approval_decisions_approvalRequestId_decision_idx" ON "tokmetric_approval_decisions"("approvalRequestId", "decision");

-- CreateIndex
CREATE INDEX "tokmetric_publish_jobs_workspaceId_internalState_externalSt_idx" ON "tokmetric_publish_jobs"("workspaceId", "internalState", "externalState");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_publish_jobs_workspaceId_idempotencyKey_key" ON "tokmetric_publish_jobs"("workspaceId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_job_attempts_publishJobId_attempt_key" ON "tokmetric_job_attempts"("publishJobId", "attempt");

-- CreateIndex
CREATE INDEX "tokmetric_analytics_snapshots_workspaceId_metric_capturedAt_idx" ON "tokmetric_analytics_snapshots"("workspaceId", "metric", "capturedAt");

-- CreateIndex
CREATE INDEX "tokmetric_webhook_events_workspaceId_eventType_idx" ON "tokmetric_webhook_events"("workspaceId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_webhook_events_provider_eventId_key" ON "tokmetric_webhook_events"("provider", "eventId");

-- CreateIndex
CREATE INDEX "tokmetric_domain_events_workspaceId_aggregateType_aggregate_idx" ON "tokmetric_domain_events"("workspaceId", "aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "tokmetric_domain_events_correlationId_idx" ON "tokmetric_domain_events"("correlationId");

-- CreateIndex
CREATE INDEX "tokmetric_audit_events_workspaceId_createdAt_idx" ON "tokmetric_audit_events"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "tokmetric_audit_events_correlationId_idx" ON "tokmetric_audit_events"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_idempotency_records_workspaceId_key_key" ON "tokmetric_idempotency_records"("workspaceId", "key");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_workspaces" ADD CONSTRAINT "tokmetric_workspaces_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "tokmetric_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_workspace_members" ADD CONSTRAINT "tokmetric_workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_workspace_members" ADD CONSTRAINT "tokmetric_workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_workspace_members" ADD CONSTRAINT "tokmetric_workspace_members_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tokmetric_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_permissions" ADD CONSTRAINT "tokmetric_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tokmetric_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_service_accounts" ADD CONSTRAINT "tokmetric_service_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "tokmetric_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_connectors" ADD CONSTRAINT "tokmetric_connectors_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_connector_credential_references" ADD CONSTRAINT "tokmetric_connector_credential_references_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "tokmetric_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_campaigns" ADD CONSTRAINT "tokmetric_campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_campaigns" ADD CONSTRAINT "tokmetric_campaigns_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_campaign_versions" ADD CONSTRAINT "tokmetric_campaign_versions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "tokmetric_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_campaign_versions" ADD CONSTRAINT "tokmetric_campaign_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_contents" ADD CONSTRAINT "tokmetric_contents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_contents" ADD CONSTRAINT "tokmetric_contents_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "tokmetric_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_contents" ADD CONSTRAINT "tokmetric_contents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_content_versions" ADD CONSTRAINT "tokmetric_content_versions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "tokmetric_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_content_versions" ADD CONSTRAINT "tokmetric_content_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_media_assets" ADD CONSTRAINT "tokmetric_media_assets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_media_assets" ADD CONSTRAINT "tokmetric_media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_policies" ADD CONSTRAINT "tokmetric_compliance_policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_policy_versions" ADD CONSTRAINT "tokmetric_compliance_policy_versions_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "tokmetric_compliance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_policy_versions" ADD CONSTRAINT "tokmetric_compliance_policy_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_reviews" ADD CONSTRAINT "tokmetric_compliance_reviews_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_reviews" ADD CONSTRAINT "tokmetric_compliance_reviews_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "tokmetric_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_reviews" ADD CONSTRAINT "tokmetric_compliance_reviews_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "tokmetric_content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_reviews" ADD CONSTRAINT "tokmetric_compliance_reviews_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "tokmetric_compliance_policy_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_compliance_reviews" ADD CONSTRAINT "tokmetric_compliance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_requests" ADD CONSTRAINT "tokmetric_approval_requests_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_requests" ADD CONSTRAINT "tokmetric_approval_requests_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "tokmetric_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_requests" ADD CONSTRAINT "tokmetric_approval_requests_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "tokmetric_content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_requests" ADD CONSTRAINT "tokmetric_approval_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_decisions" ADD CONSTRAINT "tokmetric_approval_decisions_approvalRequestId_fkey" FOREIGN KEY ("approvalRequestId") REFERENCES "tokmetric_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_approval_decisions" ADD CONSTRAINT "tokmetric_approval_decisions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_publish_jobs" ADD CONSTRAINT "tokmetric_publish_jobs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_publish_jobs" ADD CONSTRAINT "tokmetric_publish_jobs_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "tokmetric_connectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_publish_jobs" ADD CONSTRAINT "tokmetric_publish_jobs_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "tokmetric_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_publish_jobs" ADD CONSTRAINT "tokmetric_publish_jobs_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "tokmetric_content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_publish_jobs" ADD CONSTRAINT "tokmetric_publish_jobs_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_job_attempts" ADD CONSTRAINT "tokmetric_job_attempts_publishJobId_fkey" FOREIGN KEY ("publishJobId") REFERENCES "tokmetric_publish_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_analytics_snapshots" ADD CONSTRAINT "tokmetric_analytics_snapshots_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_webhook_events" ADD CONSTRAINT "tokmetric_webhook_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_domain_events" ADD CONSTRAINT "tokmetric_domain_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_audit_events" ADD CONSTRAINT "tokmetric_audit_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_audit_events" ADD CONSTRAINT "tokmetric_audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_idempotency_records" ADD CONSTRAINT "tokmetric_idempotency_records_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

