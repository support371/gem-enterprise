import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyCapitalApproval } from "@/lib/capital-readiness/approvals";

const id = z.string().trim().min(1).max(240);
const text = (min = 1, max = 5000) => z.string().trim().min(min).max(max);

export const capitalLifecycleSchema = z.discriminatedUnion("action", [
  z.object({
    workspaceId: id,
    action: z.literal("QUALIFY_OPPORTUNITY"),
    payload: z.object({
      opportunityId: id,
      decision: z.enum(["QUALIFIED", "DECLINED", "REFERRED_OUT", "PENDING_INFORMATION"]),
      rationale: text(10, 3000),
      evidenceRefs: z.array(text(1, 1000)).max(100).default([]),
      conditions: z.record(z.unknown()).default({}),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("VERIFY_BENEFICIAL_OWNER"),
    payload: z.object({
      beneficialOwnerId: id,
      verificationStatus: z.enum(["VERIFIED", "REJECTED", "ENHANCED_DUE_DILIGENCE"]),
      evidenceRef: text(1, 1000),
      rationale: text(10, 2000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("DECIDE_KYB_CASE"),
    payload: z.object({
      kybCaseId: id,
      decision: z.enum(["APPROVED", "REJECTED", "EXPIRED"]),
      rationale: text(10, 3000),
      evidenceRef: text(1, 1000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("DECIDE_PARTNER_MANDATE"),
    payload: z.object({
      mandateId: id,
      decision: z.enum(["ACCEPTED", "DECLINED", "ADDITIONAL_DILIGENCE"]),
      rationale: text(10, 3000),
      partnerEvidenceRef: text(1, 1000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("UPDATE_OUTREACH_STATUS"),
    payload: z.object({
      outreachEventId: id,
      status: z.enum([
        "CONTACTED_BY_PARTNER",
        "RESPONSE_RECEIVED",
        "NDA_PENDING",
        "NDA_SIGNED",
        "MATERIALS_GRANTED",
        "DILIGENCE_ACTIVE",
        "INDICATION_RECEIVED",
        "DECLINED",
        "WITHDRAWN",
      ]),
      evidenceRef: text(1, 1000),
      occurredAt: z.coerce.date(),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("UPDATE_DILIGENCE_STATUS"),
    payload: z.object({
      questionId: id,
      status: z.enum([
        "INTERNAL_REVIEW",
        "SENT_TO_CLIENT",
        "CLIENT_RESPONSE",
        "ANALYST_REVIEW",
        "FOLLOW_UP_REQUIRED",
        "APPROVED",
        "CLOSED",
        "ESCALATED",
      ]),
      rationale: text(5, 2000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("UPDATE_CLOSING_CONDITION"),
    approvalRequestId: id.optional(),
    payload: z.object({
      conditionId: id,
      status: z.enum(["COMPLETE", "VERIFIED", "WAIVED_BY_COUNSEL", "REJECTED"]),
      evidenceRef: text(1, 1000),
      rationale: text(10, 3000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("UPDATE_SERVICE_CONTRACT"),
    payload: z.object({
      contractId: id,
      status: z.enum(["APPROVED", "SENT", "SIGNED", "ACTIVE", "PAUSED", "EXPIRED", "TERMINATED"]),
      effectiveAt: z.coerce.date().optional(),
      rationale: text(5, 2000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("UPDATE_GOVERNED_AGENT"),
    payload: z.object({
      agentId: id,
      status: z.enum(["ACTIVE", "PAUSED", "BLOCKED", "RETIRED"]),
      rationale: text(10, 2000),
    }),
  }),
  z.object({
    workspaceId: id,
    action: z.literal("COMPLETE_CLOSING"),
    approvalRequestId: id,
    payload: z.object({
      closingId: id,
      closedAt: z.coerce.date(),
      closingEvidenceRef: text(1, 1000),
      postCloseOwnersAssigned: z.literal(true),
    }),
  }),
]);

export type CapitalLifecycleAction = z.infer<typeof capitalLifecycleSchema>["action"];

/**
 * Requests are validated by capitalLifecycleSchema before reaching the executor.
 * The repository currently compiles with strictNullChecks disabled, which causes
 * Zod object inference to mark validated fields optional. Keep the runtime schema
 * authoritative and use a post-validation executor contract here.
 */
export interface CapitalLifecycleInput {
  workspaceId: string;
  action: CapitalLifecycleAction;
  approvalRequestId?: string;
  payload: Record<string, any>;
}

export class CapitalLifecycleError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CapitalLifecycleError";
  }
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function normalizedRole(role: string) {
  return role.trim().toLowerCase().replaceAll(" ", "_");
}

function isPartnerRole(role: string) {
  return ["licensed_partner", "partner", "broker_dealer", "placement_agent"].includes(normalizedRole(role));
}

function isComplianceRole(role: string) {
  return ["compliance_officer", "compliance", "super_admin", "internal", "admin"].includes(normalizedRole(role));
}

function isInternalOperator(role: string) {
  return ["analyst", "transaction_director", "compliance_officer", "compliance", "super_admin", "internal", "admin"].includes(
    normalizedRole(role),
  );
}

async function audit(input: {
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  outcome: string;
  metadata?: unknown;
}) {
  await db.auditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      correlationId: randomUUID(),
      outcome: input.outcome,
      sourceChannel: "CAPITAL_LIFECYCLE_API",
      safeMetadata: jsonValue(input.metadata ?? {}),
    },
  });
}

async function requireApproval(input: {
  workspaceId: string;
  approvalRequestId: string | undefined;
  action: "CRITICAL_RISK_ACCEPTANCE" | "CLOSING_AUTHORIZATION";
  entityType: string;
  entityId: string;
  object: unknown;
}) {
  if (!input.approvalRequestId) {
    throw new CapitalLifecycleError(409, "APPROVAL_REQUIRED", `${input.action} approval is required.`);
  }
  const result = await verifyCapitalApproval({
    workspaceId: input.workspaceId,
    approvalRequestId: input.approvalRequestId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    object: input.object,
  });
  if (!result.valid) {
    throw new CapitalLifecycleError(409, result.code, result.reason);
  }
  return result;
}

export async function executeCapitalLifecycle(
  input: CapitalLifecycleInput,
  actor: { id: string; workspaceRole: string },
) {
  const workspaceId = input.workspaceId;
  const payload = input.payload;

  switch (input.action) {
    case "QUALIFY_OPPORTUNITY": {
      if (!isInternalOperator(actor.workspaceRole)) {
        throw new CapitalLifecycleError(403, "INTERNAL_OPERATOR_REQUIRED", "Opportunity qualification requires an internal operator role.");
      }
      const opportunity = await db.capitalOpportunity.findFirst({ where: { id: payload.opportunityId, workspaceId } });
      if (!opportunity) throw new CapitalLifecycleError(404, "OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");
      const review = await db.$transaction(async (transaction) => {
        const created = await transaction.capitalQualificationReview.create({
          data: {
            opportunityId: opportunity.id,
            reviewerId: actor.id,
            fromStatus: opportunity.status,
            toStatus: payload.decision,
            rationale: payload.rationale,
            evidenceRefs: payload.evidenceRefs,
            conditions: jsonValue(payload.conditions),
          },
        });
        await transaction.capitalOpportunity.update({ where: { id: opportunity.id }, data: { status: payload.decision } });
        return created;
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_OPPORTUNITY_QUALIFIED",
        entityType: "CapitalOpportunity",
        entityId: opportunity.id,
        outcome: payload.decision,
        metadata: { reviewId: review.id },
      });
      return { opportunityId: opportunity.id, review, status: payload.decision };
    }

    case "VERIFY_BENEFICIAL_OWNER": {
      if (!isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(403, "COMPLIANCE_ROLE_REQUIRED", "Beneficial-owner verification requires compliance authority.");
      }
      const owner = await db.capitalBeneficialOwner.findFirst({ where: { id: payload.beneficialOwnerId, kybCase: { workspaceId } } });
      if (!owner) throw new CapitalLifecycleError(404, "BENEFICIAL_OWNER_NOT_FOUND", "Beneficial owner was not found.");
      const updated = await db.capitalBeneficialOwner.update({
        where: { id: owner.id },
        data: {
          verificationStatus: payload.verificationStatus,
          documentRef: payload.evidenceRef,
          safeMetadata: jsonValue({
            rationale: payload.rationale,
            verifiedById: actor.id,
            verifiedAt: new Date().toISOString(),
          }),
        },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_BENEFICIAL_OWNER_VERIFIED",
        entityType: "CapitalBeneficialOwner",
        entityId: owner.id,
        outcome: payload.verificationStatus,
        metadata: { evidenceRef: payload.evidenceRef },
      });
      return { owner: updated };
    }

    case "DECIDE_KYB_CASE": {
      if (!isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(403, "COMPLIANCE_ROLE_REQUIRED", "KYB decisions require compliance authority.");
      }
      const kybCase = await db.capitalKybCase.findFirst({
        where: { id: payload.kybCaseId, workspaceId },
        include: { beneficialOwners: true, screenings: true, holds: { where: { status: "ACTIVE" } } },
      });
      if (!kybCase) throw new CapitalLifecycleError(404, "KYB_CASE_NOT_FOUND", "KYB case was not found.");

      if (payload.decision === "APPROVED") {
        if (kybCase.holds.length > 0) {
          throw new CapitalLifecycleError(409, "ACTIVE_HOLD", "KYB cannot be approved while an active hold exists.");
        }
        if (
          kybCase.beneficialOwners.length === 0 ||
          kybCase.beneficialOwners.some((owner) => owner.verificationStatus !== "VERIFIED")
        ) {
          throw new CapitalLifecycleError(
            409,
            "BENEFICIAL_OWNER_VERIFICATION_REQUIRED",
            "Every beneficial owner and control person must be verified.",
          );
        }
        const required = ["ENTITY", "SANCTIONS", "PEP", "ADVERSE_MEDIA", "SOURCE_OF_FUNDS"] as const;
        for (const screeningType of required) {
          const latest = kybCase.screenings
            .filter((screening) => screening.screeningType === screeningType)
            .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
          if (!latest || latest.result !== "CLEAR" || (latest.expiresAt && latest.expiresAt <= new Date())) {
            throw new CapitalLifecycleError(
              409,
              "CLEAR_SCREENING_REQUIRED",
              `Current clear ${screeningType} screening is required.`,
            );
          }
        }
      }

      const updated = await db.$transaction(async (transaction) => {
        const record = await transaction.capitalKybCase.update({
          where: { id: kybCase.id },
          data: {
            status: payload.decision,
            approvedAt: payload.decision === "APPROVED" ? new Date() : undefined,
            rejectedAt: payload.decision === "REJECTED" ? new Date() : undefined,
            expiresAt: payload.decision === "EXPIRED" ? new Date() : kybCase.expiresAt,
            safeMetadata: jsonValue({
              rationale: payload.rationale,
              evidenceRef: payload.evidenceRef,
              decidedById: actor.id,
            }),
          },
        });
        await transaction.capitalOpportunity.update({
          where: { id: kybCase.opportunityId },
          data: {
            status:
              payload.decision === "APPROVED"
                ? "QUALIFIED"
                : payload.decision === "REJECTED"
                  ? "DECLINED"
                  : "PENDING_INFORMATION",
          },
        });
        return record;
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_KYB_CASE_DECIDED",
        entityType: "CapitalKybCase",
        entityId: kybCase.id,
        outcome: payload.decision,
        metadata: { rationale: payload.rationale, evidenceRef: payload.evidenceRef },
      });
      return { kybCase: updated };
    }

    case "DECIDE_PARTNER_MANDATE": {
      if (!isPartnerRole(actor.workspaceRole) && !isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "LICENSED_PARTNER_ROLE_REQUIRED",
          "Partner mandate decisions require a licensed-partner workspace role.",
        );
      }
      const mandate = await db.capitalPartnerMandate.findFirst({
        where: { id: payload.mandateId, matter: { workspaceId } },
        include: { partner: { include: { licenses: true } }, matter: true },
      });
      if (!mandate) throw new CapitalLifecycleError(404, "PARTNER_MANDATE_NOT_FOUND", "Partner mandate was not found.");
      if (mandate.partner.status !== "ACTIVE") {
        throw new CapitalLifecycleError(409, "ACTIVE_PARTNER_REQUIRED", "The partner must remain active when deciding the mandate.");
      }
      const now = new Date();
      const validLicense = mandate.partner.licenses.some(
        (license) =>
          license.jurisdiction === mandate.jurisdiction &&
          license.authorizedActivities.includes(mandate.instrument) &&
          (!license.expiresAt || license.expiresAt > now),
      );
      if (!validLicense) {
        throw new CapitalLifecycleError(409, "CURRENT_PARTNER_LICENSE_REQUIRED", "A current matching partner license is required.");
      }
      const updated = await db.$transaction(async (transaction) => {
        const record = await transaction.capitalPartnerMandate.update({
          where: { id: mandate.id },
          data: {
            status: payload.decision,
            acceptedAt: payload.decision === "ACCEPTED" ? now : undefined,
            declinedAt: payload.decision === "DECLINED" ? now : undefined,
            rationale: payload.rationale,
          },
        });
        if (payload.decision === "ACCEPTED") {
          await transaction.capitalMatter.update({
            where: { id: mandate.matterId },
            data: { status: "CONTROLLED_MARKET_PROCESS" },
          });
        }
        return record;
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_PARTNER_MANDATE_DECIDED",
        entityType: "CapitalPartnerMandate",
        entityId: mandate.id,
        outcome: payload.decision,
        metadata: { partnerEvidenceRef: payload.partnerEvidenceRef },
      });
      return { mandate: updated };
    }

    case "UPDATE_OUTREACH_STATUS": {
      if (!isPartnerRole(actor.workspaceRole) && !isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "LICENSED_PARTNER_ROLE_REQUIRED",
          "Only the licensed partner or compliance may update controlled outreach.",
        );
      }
      const outreach = await db.capitalOutreachEvent.findFirst({
        where: { id: payload.outreachEventId, targetEntry: { universe: { workspaceId } } },
      });
      if (!outreach) throw new CapitalLifecycleError(404, "OUTREACH_EVENT_NOT_FOUND", "Outreach event was not found.");
      if (outreach.status === "NOT_APPROVED" || !outreach.partnerApprovalRef || !outreach.complianceApprovalRef) {
        throw new CapitalLifecycleError(
          409,
          "APPROVED_OUTREACH_REQUIRED",
          "The outreach event lacks partner and compliance approval.",
        );
      }
      const updated = await db.capitalOutreachEvent.update({
        where: { id: outreach.id },
        data: {
          status: payload.status,
          occurredAt: payload.occurredAt,
          safeMetadata: jsonValue({ evidenceRef: payload.evidenceRef, updatedById: actor.id }),
        },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_OUTREACH_STATUS_UPDATED",
        entityType: "CapitalOutreachEvent",
        entityId: outreach.id,
        outcome: payload.status,
        metadata: { evidenceRef: payload.evidenceRef },
      });
      return { outreach: updated };
    }

    case "UPDATE_DILIGENCE_STATUS": {
      if (!isInternalOperator(actor.workspaceRole) && !isPartnerRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "DILIGENCE_ROLE_REQUIRED",
          "Diligence status requires an internal or licensed-partner role.",
        );
      }
      const question = await db.capitalDiligenceQuestion.findFirst({
        where: { id: payload.questionId, matter: { workspaceId } },
      });
      if (!question) throw new CapitalLifecycleError(404, "DILIGENCE_QUESTION_NOT_FOUND", "Diligence question was not found.");
      if (["APPROVED", "CLOSED"].includes(payload.status)) {
        const response = await db.capitalDiligenceResponse.findFirst({
          where: { questionId: question.id },
          orderBy: { version: "desc" },
        });
        if (!response || response.evidenceRefs.length === 0) {
          throw new CapitalLifecycleError(
            409,
            "EVIDENCED_RESPONSE_REQUIRED",
            "Approved or closed diligence requires an evidenced response.",
          );
        }
      }
      const updated = await db.capitalDiligenceQuestion.update({
        where: { id: question.id },
        data: { status: payload.status },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_DILIGENCE_STATUS_UPDATED",
        entityType: "CapitalDiligenceQuestion",
        entityId: question.id,
        outcome: payload.status,
        metadata: { rationale: payload.rationale },
      });
      return { question: updated };
    }

    case "UPDATE_CLOSING_CONDITION": {
      if (!isInternalOperator(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "INTERNAL_OPERATOR_REQUIRED",
          "Closing-condition decisions require an internal operator.",
        );
      }
      const condition = await db.capitalClosingCondition.findFirst({
        where: { id: payload.conditionId, matter: { workspaceId } },
      });
      if (!condition) {
        throw new CapitalLifecycleError(404, "CLOSING_CONDITION_NOT_FOUND", "Closing condition was not found.");
      }
      if (condition.ownerId === actor.id && ["VERIFIED", "WAIVED_BY_COUNSEL"].includes(payload.status)) {
        throw new CapitalLifecycleError(
          409,
          "SEPARATION_OF_DUTIES_REQUIRED",
          "The condition owner cannot independently verify or waive the condition.",
        );
      }
      if (payload.status === "WAIVED_BY_COUNSEL") {
        await requireApproval({
          workspaceId,
          approvalRequestId: input.approvalRequestId,
          action: "CRITICAL_RISK_ACCEPTANCE",
          entityType: "CapitalClosingCondition",
          entityId: condition.id,
          object: payload,
        });
      }
      const updated = await db.capitalClosingCondition.update({
        where: { id: condition.id },
        data: {
          status: payload.status,
          evidenceRef: payload.evidenceRef,
          verifiedById: ["VERIFIED", "WAIVED_BY_COUNSEL"].includes(payload.status) ? actor.id : undefined,
          verifiedAt: ["VERIFIED", "WAIVED_BY_COUNSEL"].includes(payload.status) ? new Date() : undefined,
        },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_CLOSING_CONDITION_UPDATED",
        entityType: "CapitalClosingCondition",
        entityId: condition.id,
        outcome: payload.status,
        metadata: { rationale: payload.rationale, evidenceRef: payload.evidenceRef },
      });
      return { condition: updated };
    }

    case "UPDATE_SERVICE_CONTRACT": {
      if (!isInternalOperator(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "INTERNAL_OPERATOR_REQUIRED",
          "Service-contract lifecycle requires an internal operator.",
        );
      }
      const contract = await db.capitalServiceContract.findFirst({
        where: { id: payload.contractId, workspaceId },
      });
      if (!contract) throw new CapitalLifecycleError(404, "SERVICE_CONTRACT_NOT_FOUND", "Service contract was not found.");
      if (["SIGNED", "ACTIVE"].includes(payload.status) && !payload.effectiveAt && !contract.startAt) {
        throw new CapitalLifecycleError(
          409,
          "EFFECTIVE_DATE_REQUIRED",
          "Signed or active contracts require an effective date.",
        );
      }
      const effectiveAt = payload.effectiveAt ?? contract.startAt;
      const updated = await db.capitalServiceContract.update({
        where: { id: contract.id },
        data: {
          status: payload.status,
          signedAt: payload.status === "SIGNED" ? new Date() : contract.signedAt,
          startAt: effectiveAt,
        },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_SERVICE_CONTRACT_UPDATED",
        entityType: "CapitalServiceContract",
        entityId: contract.id,
        outcome: payload.status,
        metadata: { rationale: payload.rationale },
      });
      return { contract: updated };
    }

    case "UPDATE_GOVERNED_AGENT": {
      if (!isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "COMPLIANCE_ROLE_REQUIRED",
          "Governed-agent status changes require compliance or administrator authority.",
        );
      }
      const agent = await db.capitalGovernedAgent.findFirst({ where: { id: payload.agentId, workspaceId } });
      if (!agent) throw new CapitalLifecycleError(404, "GOVERNED_AGENT_NOT_FOUND", "Governed agent was not found.");
      const priorConfiguration =
        agent.configuration && typeof agent.configuration === "object" && !Array.isArray(agent.configuration)
          ? (agent.configuration as Record<string, unknown>)
          : {};
      const updated = await db.capitalGovernedAgent.update({
        where: { id: agent.id },
        data: {
          status: payload.status,
          configuration: jsonValue({
            ...priorConfiguration,
            lastStatusRationale: payload.rationale,
            lastStatusActorId: actor.id,
          }),
        },
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_GOVERNED_AGENT_UPDATED",
        entityType: "CapitalGovernedAgent",
        entityId: agent.id,
        outcome: payload.status,
        metadata: { rationale: payload.rationale },
      });
      return { agent: updated };
    }

    case "COMPLETE_CLOSING": {
      if (!isComplianceRole(actor.workspaceRole)) {
        throw new CapitalLifecycleError(
          403,
          "CLOSING_AUTHORITY_REQUIRED",
          "Closing completion requires compliance or administrator authority.",
        );
      }
      const closing = await db.capitalClosing.findFirst({
        where: { id: payload.closingId, matter: { workspaceId } },
        include: { matter: true },
      });
      if (!closing) throw new CapitalLifecycleError(404, "CLOSING_NOT_FOUND", "Closing was not found.");
      if (closing.status !== "READY_TO_CLOSE") {
        throw new CapitalLifecycleError(
          409,
          "CLOSING_NOT_AUTHORIZED",
          "Closing must be READY_TO_CLOSE before completion.",
        );
      }
      await requireApproval({
        workspaceId,
        approvalRequestId: input.approvalRequestId,
        action: "CLOSING_AUTHORIZATION",
        entityType: "CapitalClosing",
        entityId: closing.id,
        object: payload,
      });
      const result = await db.$transaction(async (transaction) => {
        const updatedClosing = await transaction.capitalClosing.update({
          where: { id: closing.id },
          data: { status: "CLOSED", closedAt: payload.closedAt },
        });
        const updatedMatter = await transaction.capitalMatter.update({
          where: { id: closing.matterId },
          data: { status: "CLOSED", closedAt: payload.closedAt },
        });
        return { closing: updatedClosing, matter: updatedMatter };
      });
      await audit({
        workspaceId,
        actorId: actor.id,
        action: "CAPITAL_CLOSING_COMPLETED",
        entityType: "CapitalClosing",
        entityId: closing.id,
        outcome: "CLOSED",
        metadata: {
          closingEvidenceRef: payload.closingEvidenceRef,
          postCloseOwnersAssigned: payload.postCloseOwnersAssigned,
        },
      });
      return result;
    }
  }
}
