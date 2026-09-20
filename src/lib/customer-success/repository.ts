import { randomUUID } from "node:crypto";
import { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const customerLifecycleStates = ["ACTIVE", "AT_RISK", "PAUSED", "COMPLETED", "DORMANT"] as const;
export const customerHealthStatuses = ["UNKNOWN", "HEALTHY", "WATCH", "AT_RISK"] as const;
export const customerOutcomeStatuses = ["NOT_REVIEWED", "IN_PROGRESS", "ACHIEVED", "PARTIAL", "NOT_ACHIEVED"] as const;
export const customerSuccessActionTypes = ["FOLLOW_UP", "OUTCOME", "EXPANSION", "RENEWAL", "REFERRAL", "WIN_BACK"] as const;
export const customerSuccessActionStatuses = ["PLANNED", "OPEN", "WAITING", "COMPLETED", "CANCELLED"] as const;

export type CustomerLifecycleState = (typeof customerLifecycleStates)[number];
export type CustomerHealthStatus = (typeof customerHealthStatuses)[number];
export type CustomerOutcomeStatus = (typeof customerOutcomeStatuses)[number];
export type CustomerSuccessActionType = (typeof customerSuccessActionTypes)[number];
export type CustomerSuccessActionStatus = (typeof customerSuccessActionStatuses)[number];

export interface CustomerSuccessProfileRecord {
  id: string;
  workspaceId: string;
  projectId: string | null;
  ownerUserId: string | null;
  lifecycleState: CustomerLifecycleState;
  healthStatus: CustomerHealthStatus;
  outcomeStatus: CustomerOutcomeStatus;
  satisfactionScore: number | null;
  outcomeSummary: string | null;
  lastReviewAt: Date | null;
  nextReviewAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  workspaceName: string;
  organizationName: string;
  projectName: string | null;
}

export interface CustomerSuccessActionRecord {
  id: string;
  profileId: string;
  workspaceId: string;
  projectId: string | null;
  createdById: string | null;
  actionType: CustomerSuccessActionType;
  status: CustomerSuccessActionStatus;
  title: string;
  notes: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  evidence: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSuccessAuditInput {
  userId: string;
  metadata: Prisma.InputJsonObject;
  ipAddress?: string;
  userAgent?: string;
}

export class CustomerSuccessStoreUnavailableError extends Error {
  constructor() {
    super("Customer-success storage is not ready. Apply the customer-success foundation migration before using this workflow.");
    this.name = "CustomerSuccessStoreUnavailableError";
  }
}

function isStorageMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /customer_success_(profiles|actions)|relation .* does not exist|42P01/i.test(message);
}

async function assertWorkspaceProject(workspaceId: string, projectId?: string | null) {
  const workspaces = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "tokmetric_workspaces" WHERE "id" = ${workspaceId} LIMIT 1
  `);
  if (workspaces.length === 0) throw new Error("Workspace not found");

  if (!projectId) return;
  const projects = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id"
    FROM "organization_projects"
    WHERE "id" = ${projectId} AND "workspaceId" = ${workspaceId}
    LIMIT 1
  `);
  if (projects.length === 0) throw new Error("Project does not belong to the selected workspace");
}

export async function listCustomerSuccessProfiles(limit = 100): Promise<CustomerSuccessProfileRecord[]> {
  try {
    return await db.$queryRaw<CustomerSuccessProfileRecord[]>(Prisma.sql`
      SELECT
        p."id", p."workspaceId", p."projectId", p."ownerUserId", p."lifecycleState",
        p."healthStatus", p."outcomeStatus", p."satisfactionScore", p."outcomeSummary",
        p."lastReviewAt", p."nextReviewAt", p."createdAt", p."updatedAt",
        w."name" AS "workspaceName", o."name" AS "organizationName",
        pr."name" AS "projectName"
      FROM "customer_success_profiles" p
      JOIN "tokmetric_workspaces" w ON w."id" = p."workspaceId"
      JOIN "tokmetric_organizations" o ON o."id" = w."organizationId"
      LEFT JOIN "organization_projects" pr ON pr."id" = p."projectId"
      ORDER BY COALESCE(p."nextReviewAt", p."updatedAt") ASC
      LIMIT ${limit}
    `);
  } catch (error) {
    if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError();
    throw error;
  }
}

export async function listCustomerSuccessActions(profileId: string): Promise<CustomerSuccessActionRecord[]> {
  try {
    return await db.$queryRaw<CustomerSuccessActionRecord[]>(Prisma.sql`
      SELECT
        "id", "profileId", "workspaceId", "projectId", "createdById", "actionType", "status",
        "title", "notes", "dueAt", "completedAt", "evidence", "createdAt", "updatedAt"
      FROM "customer_success_actions"
      WHERE "profileId" = ${profileId}
      ORDER BY COALESCE("dueAt", "createdAt") ASC, "createdAt" ASC
    `);
  } catch (error) {
    if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError();
    throw error;
  }
}

export async function upsertCustomerSuccessProfile(input: {
  workspaceId: string;
  projectId?: string | null;
  ownerUserId?: string | null;
  lifecycleState?: CustomerLifecycleState;
  healthStatus?: CustomerHealthStatus;
  outcomeStatus?: CustomerOutcomeStatus;
  satisfactionScore?: number | null;
  outcomeSummary?: string | null;
  lastReviewAt?: Date | null;
  nextReviewAt?: Date | null;
  audit: CustomerSuccessAuditInput;
}): Promise<string> {
  await assertWorkspaceProject(input.workspaceId, input.projectId);
  const id = randomUUID();
  const preserveOwnerUserId = input.ownerUserId === undefined;
  const preserveLastReviewAt = input.lastReviewAt === undefined;

  try {
    return await db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        INSERT INTO "customer_success_profiles" (
          "id", "workspaceId", "projectId", "ownerUserId", "lifecycleState", "healthStatus",
          "outcomeStatus", "satisfactionScore", "outcomeSummary", "lastReviewAt", "nextReviewAt", "updatedAt"
        ) VALUES (
          ${id}, ${input.workspaceId}, ${input.projectId ?? null}, ${input.ownerUserId ?? null},
          ${input.lifecycleState ?? "ACTIVE"}, ${input.healthStatus ?? "UNKNOWN"},
          ${input.outcomeStatus ?? "NOT_REVIEWED"}, ${input.satisfactionScore ?? null},
          ${input.outcomeSummary ?? null}, ${input.lastReviewAt ?? null}, ${input.nextReviewAt ?? null}, CURRENT_TIMESTAMP
        )
        ON CONFLICT ("workspaceId") DO UPDATE SET
          "projectId" = EXCLUDED."projectId",
          "ownerUserId" = CASE
            WHEN ${preserveOwnerUserId} THEN "customer_success_profiles"."ownerUserId"
            ELSE EXCLUDED."ownerUserId"
          END,
          "lifecycleState" = EXCLUDED."lifecycleState",
          "healthStatus" = EXCLUDED."healthStatus",
          "outcomeStatus" = EXCLUDED."outcomeStatus",
          "satisfactionScore" = EXCLUDED."satisfactionScore",
          "outcomeSummary" = EXCLUDED."outcomeSummary",
          "lastReviewAt" = CASE
            WHEN ${preserveLastReviewAt} THEN "customer_success_profiles"."lastReviewAt"
            ELSE EXCLUDED."lastReviewAt"
          END,
          "nextReviewAt" = EXCLUDED."nextReviewAt",
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING "id"
      `);
      const profileId = rows[0].id;

      await tx.auditLog.create({
        data: {
          userId: input.audit.userId,
          action: AuditAction.admin_action,
          resource: "customer_success_profile",
          resourceId: profileId,
          metadata: input.audit.metadata,
          ipAddress: input.audit.ipAddress,
          userAgent: input.audit.userAgent,
        },
      });

      return profileId;
    });
  } catch (error) {
    if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError();
    throw error;
  }
}

export async function createCustomerSuccessAction(input: {
  profileId: string;
  createdById?: string | null;
  actionType: CustomerSuccessActionType;
  status?: CustomerSuccessActionStatus;
  title: string;
  notes?: string | null;
  dueAt?: Date | null;
  evidence?: unknown;
  audit: CustomerSuccessAuditInput;
}): Promise<string> {
  try {
    return await db.$transaction(async (tx) => {
      const profiles = await tx.$queryRaw<Array<{ workspaceId: string; projectId: string | null }>>(Prisma.sql`
        SELECT "workspaceId", "projectId"
        FROM "customer_success_profiles"
        WHERE "id" = ${input.profileId}
        LIMIT 1
      `);
      if (profiles.length === 0) throw new Error("Customer-success profile not found");

      const id = randomUUID();
      const profile = profiles[0];
      const evidenceJson = JSON.stringify(input.evidence ?? {});
      const status = input.status ?? "PLANNED";
      const completedAt = status === "COMPLETED" ? new Date() : null;

      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "customer_success_actions" (
          "id", "profileId", "workspaceId", "projectId", "createdById", "actionType", "status",
          "title", "notes", "dueAt", "completedAt", "evidence", "updatedAt"
        ) VALUES (
          ${id}, ${input.profileId}, ${profile.workspaceId}, ${profile.projectId}, ${input.createdById ?? null},
          ${input.actionType}, ${status}, ${input.title}, ${input.notes ?? null},
          ${input.dueAt ?? null}, ${completedAt}, CAST(${evidenceJson} AS JSONB), CURRENT_TIMESTAMP
        )
      `);

      await tx.auditLog.create({
        data: {
          userId: input.audit.userId,
          action: AuditAction.admin_action,
          resource: "customer_success_action",
          resourceId: id,
          metadata: input.audit.metadata,
          ipAddress: input.audit.ipAddress,
          userAgent: input.audit.userAgent,
        },
      });

      return id;
    });
  } catch (error) {
    if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError();
    throw error;
  }
}

export async function updateCustomerSuccessActionStatus(input: {
  actionId: string;
  status: CustomerSuccessActionStatus;
  audit: CustomerSuccessAuditInput;
}): Promise<boolean> {
  try {
    return await db.$transaction(async (tx) => {
      const changed = await tx.$executeRaw(Prisma.sql`
        UPDATE "customer_success_actions"
        SET "completedAt" = CASE
              WHEN ${input.status} = 'COMPLETED' AND "status" = 'COMPLETED' THEN "completedAt"
              WHEN ${input.status} = 'COMPLETED' THEN CURRENT_TIMESTAMP
              ELSE NULL
            END,
            "status" = ${input.status},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${input.actionId}
      `);
      if (changed === 0) return false;

      await tx.auditLog.create({
        data: {
          userId: input.audit.userId,
          action: AuditAction.admin_action,
          resource: "customer_success_action",
          resourceId: input.actionId,
          metadata: input.audit.metadata,
          ipAddress: input.audit.ipAddress,
          userAgent: input.audit.userAgent,
        },
      });

      return true;
    });
  } catch (error) {
    if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError();
    throw error;
  }
}
