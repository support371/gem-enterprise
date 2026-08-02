import { createHash, randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export const CAPITAL_APPROVAL_ACTIONS = [
  "COMMITTEE_RELEASE",
  "PARTNER_ROUTING",
  "CONTROLLED_OUTREACH",
  "TRANSACTION_BASED_FEE",
  "EXTERNAL_COMMUNICATION",
  "DOCUMENT_RELEASE",
  "DATA_ROOM_ACCESS",
  "CLOSING_AUTHORIZATION",
  "CRITICAL_RISK_ACCEPTANCE",
  "HIGH_IMPACT_AI_ACTION",
] as const;

export type CapitalApprovalAction = (typeof CAPITAL_APPROVAL_ACTIONS)[number];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

export function capitalObjectHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function actionKey(action: CapitalApprovalAction, entityType: string, entityId: string) {
  return `capital:${action}:${entityType}:${entityId}`;
}

export interface RequestCapitalApprovalInput {
  workspaceId: string;
  actorId: string;
  action: CapitalApprovalAction;
  entityType: string;
  entityId: string;
  object: unknown;
  requiredRole: string;
  expiresAt?: Date;
}

export async function requestCapitalApproval(input: RequestCapitalApprovalInput) {
  const objectHash = capitalObjectHash(input.object);
  const action = actionKey(input.action, input.entityType, input.entityId);
  const existing = await db.approvalRequest.findFirst({
    where: {
      workspaceId: input.workspaceId,
      action,
      objectHash,
      state: { in: ["APPROVAL_REQUIRED", "APPROVED"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return { approval: existing, reused: true };

  const correlationId = randomUUID();
  const approval = await db.$transaction(async (transaction) => {
    const created = await transaction.approvalRequest.create({
      data: {
        workspaceId: input.workspaceId,
        requestedById: input.actorId,
        requiredRole: input.requiredRole,
        action,
        objectHash,
        state: "APPROVAL_REQUIRED",
        expiresAt: input.expiresAt,
      },
    });
    await transaction.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: "CAPITAL_APPROVAL_REQUESTED",
        entityType: input.entityType,
        entityId: input.entityId,
        correlationId,
        outcome: "SUCCESS",
        sourceChannel: "COMMAND_CENTER_API",
        safeMetadata: {
          approvalRequestId: created.id,
          approvalAction: input.action,
          requiredRole: input.requiredRole,
          objectHash,
        },
      },
    });
    return created;
  });

  return { approval, reused: false, correlationId };
}

export interface DecideCapitalApprovalInput {
  workspaceId: string;
  approvalRequestId: string;
  actorId: string;
  actorWorkspaceRole: string;
  decision: "approve" | "reject" | "revoke";
  reason: string;
}

export async function decideCapitalApproval(input: DecideCapitalApprovalInput) {
  const approval = await db.approvalRequest.findFirst({
    where: { id: input.approvalRequestId, workspaceId: input.workspaceId },
    include: { decisions: { orderBy: { createdAt: "desc" } } },
  });
  if (!approval) return { kind: "not_found" as const };

  if (approval.requestedById === input.actorId) {
    return {
      kind: "blocked" as const,
      code: "SEPARATION_OF_DUTIES_REQUIRED",
      reason: "The requester cannot decide their own approval request.",
    };
  }

  if (approval.expiresAt && approval.expiresAt.getTime() <= Date.now()) {
    await db.approvalRequest.update({ where: { id: approval.id }, data: { state: "EXPIRED" } });
    return { kind: "blocked" as const, code: "APPROVAL_EXPIRED", reason: "The approval request has expired." };
  }

  if (!["APPROVAL_REQUIRED", "APPROVED"].includes(approval.state)) {
    return {
      kind: "blocked" as const,
      code: "APPROVAL_NOT_ACTIONABLE",
      reason: `Approval state ${approval.state} cannot accept this decision.`,
    };
  }

  const requiredRole = approval.requiredRole.trim().toLowerCase();
  const actorRole = input.actorWorkspaceRole.trim().toLowerCase();
  const elevatedRoles = new Set(["super_admin", "internal", "compliance officer", "compliance_officer"]);
  if (requiredRole && requiredRole !== actorRole && !elevatedRoles.has(actorRole)) {
    return {
      kind: "blocked" as const,
      code: "APPROVER_ROLE_REQUIRED",
      reason: `The approval requires the ${approval.requiredRole} workspace role.`,
    };
  }

  const nextState = input.decision === "approve" ? "APPROVED" : input.decision === "reject" ? "REJECTED" : "REVOKED";
  const correlationId = randomUUID();
  await db.$transaction(async (transaction) => {
    await transaction.approvalDecision.create({
      data: {
        approvalRequestId: approval.id,
        actorId: input.actorId,
        decision: input.decision,
        objectHash: approval.objectHash,
        reason: input.reason,
      },
    });
    await transaction.approvalRequest.update({ where: { id: approval.id }, data: { state: nextState } });
    await transaction.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: `CAPITAL_APPROVAL_${input.decision.toUpperCase()}`,
        entityType: "ApprovalRequest",
        entityId: approval.id,
        correlationId,
        outcome: nextState,
        sourceChannel: "COMMAND_CENTER_API",
        safeMetadata: {
          approvalAction: approval.action,
          requiredRole: approval.requiredRole,
          objectHash: approval.objectHash,
          reason: input.reason,
        },
      },
    });
  });

  return { kind: "decided" as const, approvalRequestId: approval.id, state: nextState, correlationId };
}

export interface VerifyCapitalApprovalInput {
  workspaceId: string;
  approvalRequestId: string;
  action: CapitalApprovalAction;
  entityType: string;
  entityId: string;
  object: unknown;
}

export async function verifyCapitalApproval(input: VerifyCapitalApprovalInput) {
  const expectedHash = capitalObjectHash(input.object);
  const expectedAction = actionKey(input.action, input.entityType, input.entityId);
  const approval = await db.approvalRequest.findFirst({
    where: {
      id: input.approvalRequestId,
      workspaceId: input.workspaceId,
      action: expectedAction,
      objectHash: expectedHash,
      state: "APPROVED",
    },
    include: {
      decisions: {
        where: { decision: "approve", objectHash: expectedHash },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!approval) {
    return { valid: false, code: "APPROVAL_NOT_FOUND_OR_STALE", reason: "No approved record matches the current action and object version." };
  }
  if (approval.expiresAt && approval.expiresAt.getTime() <= Date.now()) {
    return { valid: false, code: "APPROVAL_EXPIRED", reason: "The matching approval has expired." };
  }
  if (approval.decisions.length === 0) {
    return { valid: false, code: "APPROVAL_DECISION_MISSING", reason: "The approval has no matching approval decision." };
  }

  return {
    valid: true,
    code: "APPROVED",
    reason: "The current action and object version have an independent approval decision.",
    approvalRequestId: approval.id,
    approvedById: approval.decisions[0]?.actorId ?? null,
  };
}
