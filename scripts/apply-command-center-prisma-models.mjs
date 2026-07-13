import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
let schema = await readFile(schemaPath, "utf8");

const marker = "// ─── Command Center Operating Models ─────────────────────────────────────────";
if (schema.includes(marker)) {
  console.log("Command-center operating models already present.");
  process.exit(0);
}

function replaceOnce(source, search, replacement, label) {
  const index = source.indexOf(search);
  if (index === -1) throw new Error(`Schema promotion marker not found: ${label}`);
  if (source.indexOf(search, index + search.length) !== -1) {
    throw new Error(`Schema promotion marker is ambiguous: ${label}`);
  }
  return source.replace(search, replacement);
}

const enums = `

enum EnterpriseSubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  PAUSED
  CANCELLED
  EXPIRED
}

enum EnterpriseBillingInterval {
  MONTHLY
  QUARTERLY
  ANNUAL
  USAGE_BASED
  CUSTOM
}

enum EnterpriseUsageRecordStatus {
  PENDING
  ACCEPTED
  REJECTED
  REVERSED
}

enum EnterpriseSecurityAssetStatus {
  ACTIVE
  MONITORED
  DEGRADED
  RETIRED
}

enum EnterpriseSecurityIncidentStatus {
  OPEN
  INVESTIGATING
  CONTAINED
  RESOLVED
  CLOSED
}

enum EnterpriseSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum EnterpriseComplianceControlStatus {
  NOT_STARTED
  IN_PROGRESS
  READY
  EVIDENCE_REQUIRED
  OVERDUE
  BLOCKED
  COMPLETE
}

enum EnterpriseComplianceTaskStatus {
  OPEN
  IN_PROGRESS
  WAITING
  COMPLETE
  CANCELLED
}

enum EnterpriseRiskStatus {
  OPEN
  MITIGATING
  ACCEPTED
  TRANSFERRED
  CLOSED
}

enum EnterpriseGovernedAgentStatus {
  DRAFT
  ACTIVE
  PAUSED
  BLOCKED
  RETIRED
}

enum EnterpriseAgentRunStatus {
  QUEUED
  RUNNING
  WAITING_FOR_APPROVAL
  COMPLETED
  FAILED
  CANCELLED
  BLOCKED
}

enum EnterpriseIntegrationHealthStatus {
  UNKNOWN
  HEALTHY
  DEGRADED
  OUTAGE
  AUTHORIZATION_REQUIRED
  DISCONNECTED
}
`;

schema = replaceOnce(
  schema,
  "enum MeetingStatus {\n  REQUESTED\n  CONFIRMED\n  CANCELLED\n  COMPLETED\n}\n",
  `enum MeetingStatus {\n  REQUESTED\n  CONFIRMED\n  CANCELLED\n  COMPLETED\n}\n${enums}`,
  "MeetingStatus enum",
);

schema = replaceOnce(
  schema,
  "  workspaces      Workspace[]\n  serviceAccounts ServiceAccount[]\n",
  "  workspaces      Workspace[]\n  serviceAccounts ServiceAccount[]\n  subscriptions   EnterpriseSubscription[]\n",
  "Organization relations",
);

schema = replaceOnce(
  schema,
  "  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]\n\n  @@unique([organizationId, slug])",
  `  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]
  enterpriseSubscriptions      EnterpriseSubscription[]
  enterpriseUsageRecords       EnterpriseUsageRecord[]
  enterpriseSecurityAssets     EnterpriseSecurityAsset[]
  enterpriseSecurityIncidents  EnterpriseSecurityIncident[]
  enterpriseFrameworks         EnterpriseComplianceFramework[]
  enterpriseControls           EnterpriseComplianceControl[]
  enterpriseEvidence           EnterpriseComplianceEvidence[]
  enterpriseComplianceTasks    EnterpriseComplianceTask[]
  enterpriseRisks              EnterpriseRisk[]
  governedAgents               EnterpriseGovernedAgent[]
  governedAgentRuns            EnterpriseGovernedAgentRun[]
  integrationHealthRecords     EnterpriseIntegrationHealth[]

  @@unique([organizationId, slug])`,
  "Workspace relations",
);

schema = replaceOnce(
  schema,
  "  publishJobs          PublishJob[]\n\n  @@unique([workspaceId, provider, externalAccountId])",
  "  publishJobs          PublishJob[]\n  integrationHealth     EnterpriseIntegrationHealth?\n\n  @@unique([workspaceId, provider, externalAccountId])",
  "Connector relations",
);

const models = `

${marker}

model EnterpriseSubscription {
  id                 String                       @id @default(cuid())
  organizationId     String
  workspaceId        String?
  externalProvider   String?
  externalCustomerId String?
  externalPlanId     String?
  status             EnterpriseSubscriptionStatus @default(TRIALING)
  billingInterval    EnterpriseBillingInterval
  currency           String                       @default("USD")
  unitAmount         Decimal?                     @db.Decimal(18, 2)
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelledAt        DateTime?
  safeMetadata       Json                         @default("{}")
  createdAt          DateTime                     @default(now())
  updatedAt          DateTime                     @updatedAt

  organization Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  workspace    Workspace?              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  usageRecords EnterpriseUsageRecord[]

  @@index([organizationId, status])
  @@index([workspaceId, status])
  @@unique([externalProvider, externalCustomerId, externalPlanId])
  @@map("enterprise_subscriptions")
}

model EnterpriseUsageRecord {
  id             String                      @id @default(cuid())
  workspaceId    String
  subscriptionId String?
  metric         String
  quantity       Decimal                     @db.Decimal(18, 6)
  unit           String
  status         EnterpriseUsageRecordStatus @default(PENDING)
  idempotencyKey String
  occurredAt     DateTime
  safeMetadata   Json                        @default("{}")
  createdAt      DateTime                    @default(now())

  workspace    Workspace               @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  subscription EnterpriseSubscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)

  @@unique([workspaceId, idempotencyKey])
  @@index([workspaceId, metric, occurredAt])
  @@index([subscriptionId, occurredAt])
  @@map("enterprise_usage_records")
}

model EnterpriseSecurityAsset {
  id           String                        @id @default(cuid())
  workspaceId  String
  name         String
  assetType    String
  externalRef  String?
  status       EnterpriseSecurityAssetStatus @default(ACTIVE)
  criticality  EnterpriseSeverity            @default(MEDIUM)
  ownerLabel   String?
  safeMetadata Json                           @default("{}")
  createdAt    DateTime                       @default(now())
  updatedAt    DateTime                       @updatedAt

  workspace Workspace                    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  incidents EnterpriseSecurityIncident[]

  @@unique([workspaceId, externalRef])
  @@index([workspaceId, status, criticality])
  @@map("enterprise_security_assets")
}

model EnterpriseSecurityIncident {
  id             String                           @id @default(cuid())
  workspaceId    String
  assetId        String?
  title          String
  category       String
  severity       EnterpriseSeverity               @default(MEDIUM)
  status         EnterpriseSecurityIncidentStatus @default(OPEN)
  detectedAt     DateTime
  acknowledgedAt DateTime?
  containedAt    DateTime?
  resolvedAt     DateTime?
  summary        String?
  safeMetadata   Json                             @default("{}")
  createdAt      DateTime                         @default(now())
  updatedAt      DateTime                         @updatedAt

  workspace Workspace                @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  asset     EnterpriseSecurityAsset? @relation(fields: [assetId], references: [id], onDelete: SetNull)

  @@index([workspaceId, status, severity])
  @@index([workspaceId, detectedAt])
  @@map("enterprise_security_incidents")
}

model EnterpriseComplianceFramework {
  id           String   @id @default(cuid())
  workspaceId  String
  code         String
  name         String
  version      String?
  jurisdiction String?
  isActive     Boolean  @default(true)
  safeMetadata Json     @default("{}")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspace Workspace                     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  controls  EnterpriseComplianceControl[]

  @@unique([workspaceId, code, version])
  @@index([workspaceId, isActive])
  @@map("enterprise_compliance_frameworks")
}

model EnterpriseComplianceControl {
  id             String                            @id @default(cuid())
  workspaceId    String
  frameworkId    String
  controlCode    String
  title          String
  description    String?
  status         EnterpriseComplianceControlStatus @default(NOT_STARTED)
  ownerLabel     String?
  dueAt          DateTime?
  lastReviewedAt DateTime?
  safeMetadata   Json                              @default("{}")
  createdAt      DateTime                          @default(now())
  updatedAt      DateTime                          @updatedAt

  workspace Workspace                     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  framework EnterpriseComplianceFramework @relation(fields: [frameworkId], references: [id], onDelete: Cascade)
  evidence  EnterpriseComplianceEvidence[]
  tasks     EnterpriseComplianceTask[]

  @@unique([frameworkId, controlCode])
  @@index([workspaceId, status, dueAt])
  @@map("enterprise_compliance_controls")
}

model EnterpriseComplianceEvidence {
  id           String   @id @default(cuid())
  workspaceId  String
  controlId    String
  evidenceType String
  storageRef   String
  checksum     String?
  collectedAt  DateTime @default(now())
  expiresAt    DateTime?
  safeMetadata Json     @default("{}")
  createdAt    DateTime @default(now())

  workspace Workspace                   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  control   EnterpriseComplianceControl @relation(fields: [controlId], references: [id], onDelete: Cascade)

  @@index([workspaceId, collectedAt])
  @@index([controlId, expiresAt])
  @@map("enterprise_compliance_evidence")
}

model EnterpriseComplianceTask {
  id           String                         @id @default(cuid())
  workspaceId  String
  controlId    String?
  title        String
  status       EnterpriseComplianceTaskStatus @default(OPEN)
  priority     EnterpriseSeverity              @default(MEDIUM)
  ownerLabel   String?
  dueAt        DateTime?
  completedAt  DateTime?
  safeMetadata Json                            @default("{}")
  createdAt    DateTime                        @default(now())
  updatedAt    DateTime                        @updatedAt

  workspace Workspace                    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  control   EnterpriseComplianceControl? @relation(fields: [controlId], references: [id], onDelete: SetNull)

  @@index([workspaceId, status, dueAt])
  @@map("enterprise_compliance_tasks")
}

model EnterpriseRisk {
  id             String               @id @default(cuid())
  workspaceId    String
  title          String
  category       String
  status         EnterpriseRiskStatus @default(OPEN)
  likelihood     EnterpriseSeverity   @default(MEDIUM)
  impact         EnterpriseSeverity   @default(MEDIUM)
  ownerLabel     String?
  mitigationPlan String?
  reviewAt       DateTime?
  closedAt       DateTime?
  safeMetadata   Json                 @default("{}")
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, status, impact])
  @@index([workspaceId, reviewAt])
  @@map("enterprise_risks")
}

model EnterpriseGovernedAgent {
  id                   String                        @id @default(cuid())
  workspaceId          String
  name                 String
  purpose              String
  modelProvider        String?
  modelName            String?
  status               EnterpriseGovernedAgentStatus @default(DRAFT)
  autonomyLevel        Int                           @default(0)
  humanApprovalRequired Boolean                      @default(true)
  allowedActions       String[]                      @default([])
  blockedActions       String[]                      @default([])
  safeMetadata         Json                          @default("{}")
  createdAt            DateTime                      @default(now())
  updatedAt            DateTime                      @updatedAt

  workspace Workspace                    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  runs      EnterpriseGovernedAgentRun[]

  @@unique([workspaceId, name])
  @@index([workspaceId, status])
  @@map("enterprise_agents")
}

model EnterpriseGovernedAgentRun {
  id             String                   @id @default(cuid())
  workspaceId    String
  agentId        String
  correlationId  String
  status         EnterpriseAgentRunStatus @default(QUEUED)
  approvalRef    String?
  inputHash      String
  outputHash     String?
  safeMetadata   Json                     @default("{}")
  startedAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime                 @default(now())
  updatedAt      DateTime                 @updatedAt

  workspace Workspace               @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  agent     EnterpriseGovernedAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, correlationId])
  @@index([agentId, status, createdAt])
  @@map("enterprise_agent_runs")
}

model EnterpriseIntegrationHealth {
  id             String                            @id @default(cuid())
  workspaceId    String
  connectorId    String                            @unique
  status         EnterpriseIntegrationHealthStatus @default(UNKNOWN)
  lastCheckedAt  DateTime?
  lastHealthyAt  DateTime?
  failureCount   Int                               @default(0)
  latencyMs      Int?
  safeMetadata   Json                              @default("{}")
  createdAt      DateTime                          @default(now())
  updatedAt      DateTime                          @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  connector Connector @relation(fields: [connectorId], references: [id], onDelete: Cascade)

  @@index([workspaceId, status])
  @@map("enterprise_integration_health")
}
`;

schema = `${schema.trimEnd()}${models}\n`;
await writeFile(schemaPath, schema, "utf8");
console.log("Applied command-center operating models to prisma/schema.prisma");
