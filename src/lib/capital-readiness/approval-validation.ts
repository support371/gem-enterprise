import { z } from "zod";
import { CAPITAL_APPROVAL_ACTIONS } from "@/lib/capital-readiness/approvals";

const identifier = z.string().trim().min(1).max(240);

export const requestCapitalApprovalSchema = z.object({
  workspaceId: identifier,
  action: z.enum(CAPITAL_APPROVAL_ACTIONS),
  entityType: identifier,
  entityId: identifier,
  object: z.unknown(),
  requiredRole: identifier,
  expiresAt: z.coerce.date().optional(),
});

export const decideCapitalApprovalSchema = z.object({
  workspaceId: identifier,
  decision: z.enum(["approve", "reject", "revoke"]),
  reason: z.string().trim().min(10).max(2000),
});
