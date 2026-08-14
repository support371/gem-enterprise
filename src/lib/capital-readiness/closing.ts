import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyCapitalApproval } from "@/lib/capital-readiness/approvals";
import { evaluateCapitalClosingGates } from "@/lib/capital-readiness/workflow";

const id = z.string().trim().min(1).max(240);
const text = (min = 1, max = 3000) => z.string().trim().min(min).max(max);

export const authorizeCapitalClosingSchema = z.object({
  workspaceId: id,
  approvalRequestId: id,
  finalKybRefreshAt: z.coerce.date(),
  finalSanctionsRefreshAt: z.coerce.date(),
  partnerConfirmationRef: text(1, 1000),
  counselConfirmationRef: text(1, 1000),
  feeApprovalRef: text(1, 1000),
  signatoryEvidenceRef: text(1, 1000),
  fundsFlowVerificationRef: text(1, 1000),
  postCloseOwnerRefs: z.array(id).min(1).max(100),
  noGemCustodyConfirmed: z.literal(true),
  rationale: text(10, 3000),
});

export type AuthorizeCapitalClosingInput = z.infer<typeof authorizeCapitalClosingSchema>;

export class CapitalClosingError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CapitalClosingError";
  }
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

export async function authorizeCapitalClosing(input: {
  closingId: string;
  actorId: string;
  workspaceRole: string;
  data: AuthorizeCapitalClosingInput;
}) {
  const normalizedRole = input.workspaceRole.trim().toLowerCase().replaceAll(" ", "_");
  if (!["compliance_officer", "compliance", "super_admin", "internal", "admin"].includes(normalizedRole)) {
    throw new CapitalClosingError(403, "CLOSING_AUTHORITY_REQUIRED", "Closing authorization requires compliance or administrator authority.");
  }

  const closing = await db.capitalClosing.findFirst({
    where: { id: input.closingId, matter: { workspaceId: input.data.workspaceId } },
    include: {
      matter: {
        include: {
          opportunity: {
            include: {
              kybCases: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: {
                  beneficialOwners: true,
                  screenings: true,
                  holds: { where: { status: "ACTIVE" } },
                },
              },
            },
          },
          partnerMandates: {
            where: { status: { in: ["ACCEPTED", "ACTIVE"] } },
            include: { partner: true },
          },
          closingConditions: true,
          dataRooms: {
            include: {
              documents: true,
            },
          },
        },
      },
    },
  });
  if (!closing) throw new CapitalClosingError(404, "CLOSING_NOT_FOUND", "Closing was not found.");
  if (!["CONDITIONS_OUTSTANDING", "PRE_CLOSING"].includes(closing.status)) {
    throw new CapitalClosingError(409, "CLOSING_NOT_AUTHORIZABLE", `Closing status ${closing.status} cannot be authorized.`);
  }

  const kybCase = closing.matter.opportunity.kybCases[0];
  const finalKybRefresh = Boolean(
    kybCase &&
      kybCase.status === "APPROVED" &&
      kybCase.holds.length === 0 &&
      input.data.finalKybRefreshAt <= new Date(),
  );
  const latestSanctions = kybCase?.screenings
    .filter((screening) => screening.screeningType === "SANCTIONS")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
  const finalSanctionsRefresh = Boolean(
    latestSanctions &&
      latestSanctions.result === "CLEAR" &&
      (!latestSanctions.expiresAt || latestSanctions.expiresAt > new Date()) &&
      input.data.finalSanctionsRefreshAt <= new Date(),
  );
  const ownershipConfirmed = Boolean(
    kybCase &&
      kybCase.beneficialOwners.length > 0 &&
      kybCase.beneficialOwners.every((owner) => owner.verificationStatus === "VERIFIED"),
  );
  const documents = closing.matter.dataRooms.flatMap((room) => room.documents);
  const documentsApproved =
    closing.matter.dataRooms.length > 0 &&
    documents.length > 0 &&
    documents.every((document) => document.status === "RELEASED" && document.currentVersion > 0 && !document.legalHoldActive);
  const partnerConfirmed = closing.matter.partnerMandates.some(
    (mandate) =>
      mandate.partner.status === "ACTIVE" &&
      (!mandate.partner.agreementExpiresAt || mandate.partner.agreementExpiresAt > new Date()),
  );
  const conditionsPrecedentComplete =
    closing.matter.closingConditions.length > 0 &&
    closing.matter.closingConditions.every((condition) =>
      ["COMPLETE", "VERIFIED", "WAIVED_BY_COUNSEL"].includes(condition.status),
    );

  const gates = evaluateCapitalClosingGates({
    finalKybRefresh,
    finalSanctionsRefresh,
    ownershipConfirmed,
    documentsApproved,
    partnerConfirmed,
    counselConfirmed: Boolean(input.data.counselConfirmationRef),
    finalFeeApproved: Boolean(input.data.feeApprovalRef),
    conditionsPrecedentComplete,
    signatoriesConfirmed: Boolean(input.data.signatoryEvidenceRef),
    fundsFlowVerifiedExternally: Boolean(input.data.fundsFlowVerificationRef),
    noGemCustodyConfirmed: input.data.noGemCustodyConfirmed,
    postCloseOwnersAssigned: input.data.postCloseOwnerRefs.length > 0,
  });
  if (!gates.readyToClose) {
    throw new CapitalClosingError(409, "CLOSING_GATES_INCOMPLETE", gates.blockers.join(" "));
  }

  const approvalObject = {
    closingId: closing.id,
    matterId: closing.matterId,
    finalKybRefreshAt: input.data.finalKybRefreshAt,
    finalSanctionsRefreshAt: input.data.finalSanctionsRefreshAt,
    partnerConfirmationRef: input.data.partnerConfirmationRef,
    counselConfirmationRef: input.data.counselConfirmationRef,
    feeApprovalRef: input.data.feeApprovalRef,
    signatoryEvidenceRef: input.data.signatoryEvidenceRef,
    fundsFlowVerificationRef: input.data.fundsFlowVerificationRef,
    postCloseOwnerRefs: input.data.postCloseOwnerRefs,
    noGemCustodyConfirmed: input.data.noGemCustodyConfirmed,
  };
  const approval = await verifyCapitalApproval({
    workspaceId: input.data.workspaceId,
    approvalRequestId: input.data.approvalRequestId,
    action: "CLOSING_AUTHORIZATION",
    entityType: "CapitalClosing",
    entityId: closing.id,
    object: approvalObject,
  });
  if (!approval.valid) {
    throw new CapitalClosingError(409, approval.code, approval.reason);
  }

  const updated = await db.$transaction(async (transaction) => {
    const closingRecord = await transaction.capitalClosing.update({
      where: { id: closing.id },
      data: {
        status: "READY_TO_CLOSE",
        finalKybRefreshAt: input.data.finalKybRefreshAt,
        finalSanctionsRefreshAt: input.data.finalSanctionsRefreshAt,
        partnerConfirmationRef: input.data.partnerConfirmationRef,
        counselConfirmationRef: input.data.counselConfirmationRef,
        feeApprovalRef: input.data.feeApprovalRef,
        fundsFlowVerifiedExternally: true,
        noGemCustodyConfirmed: true,
        authorizedSignatoriesConfirmed: true,
      },
    });
    await transaction.auditEvent.create({
      data: {
        workspaceId: input.data.workspaceId,
        actorId: input.actorId,
        action: "CAPITAL_CLOSING_AUTHORIZED",
        entityType: "CapitalClosing",
        entityId: closing.id,
        correlationId: randomUUID(),
        outcome: "READY_TO_CLOSE",
        sourceChannel: "CAPITAL_CLOSING_API",
        safeMetadata: jsonValue({
          approvalRequestId: input.data.approvalRequestId,
          approvedById: approval.approvedById,
          signatoryEvidenceRef: input.data.signatoryEvidenceRef,
          fundsFlowVerificationRef: input.data.fundsFlowVerificationRef,
          postCloseOwnerRefs: input.data.postCloseOwnerRefs,
          rationale: input.data.rationale,
          gates,
        }),
      },
    });
    return closingRecord;
  });

  return { closing: updated, gates, approval };
}
