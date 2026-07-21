import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { capitalObjectHash, verifyCapitalApproval, type CapitalApprovalAction } from "@/lib/capital-readiness/approvals";
import type { CapitalCommandInput } from "@/lib/capital-readiness/command-schemas";
import { evaluateTransactionAction } from "@/lib/capital-readiness/policy";
import {
  calculateCapitalReadiness,
  evaluateCapitalClosingGates,
  evaluateCapitalPartnerEligibility,
} from "@/lib/capital-readiness/workflow";

export class CapitalCommandError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CapitalCommandError";
  }
}

function inputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function publicId(prefix: string) {
  return `${prefix}-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

async function requireApproval(input: {
  workspaceId: string;
  approvalRequestId?: string;
  action: CapitalApprovalAction;
  entityType: string;
  entityId: string;
  object: unknown;
}) {
  if (!input.approvalRequestId) {
    throw new CapitalCommandError(409, "APPROVAL_REQUIRED", `${input.action} requires an approved request.`);
  }
  const verification = await verifyCapitalApproval({
    workspaceId: input.workspaceId,
    approvalRequestId: input.approvalRequestId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    object: input.object,
  });
  if (!verification.valid) {
    throw new CapitalCommandError(409, verification.code, verification.reason);
  }
  return verification;
}

async function audit(input: {
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  correlationId: string;
  outcome?: string;
  metadata?: unknown;
}) {
  await db.auditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      correlationId: input.correlationId,
      outcome: input.outcome ?? "SUCCESS",
      sourceChannel: "CAPITAL_COMMAND_API",
      safeMetadata: inputJson(input.metadata ?? {}),
    },
  });
}

async function requireOpportunity(workspaceId: string, opportunityId: string) {
  const record = await db.capitalOpportunity.findFirst({ where: { id: opportunityId, workspaceId } });
  if (!record) throw new CapitalCommandError(404, "OPPORTUNITY_NOT_FOUND", "Opportunity was not found in the authorized workspace.");
  return record;
}

async function requireMatter(workspaceId: string, matterId: string) {
  const record = await db.capitalMatter.findFirst({ where: { id: matterId, workspaceId } });
  if (!record) throw new CapitalCommandError(404, "MATTER_NOT_FOUND", "Matter was not found in the authorized workspace.");
  return record;
}

async function executeUncached(command: CapitalCommandInput, actorId: string, correlationId: string): Promise<unknown> {
  const { workspaceId, payload } = command;

  switch (command.command) {
    case "CREATE_KYB_CASE": {
      await requireOpportunity(workspaceId, payload.opportunityId);
      const existing = await db.capitalKybCase.findUnique({ where: { opportunityId: payload.opportunityId } });
      if (existing) return { kybCase: existing, reused: true };
      const kybCase = await db.capitalKybCase.create({
        data: { workspaceId, opportunityId: payload.opportunityId, riskLevel: payload.riskLevel, assignedToId: actorId, status: "IN_PROGRESS" },
      });
      await db.capitalOpportunity.update({ where: { id: payload.opportunityId }, data: { status: "QUALIFICATION" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_KYB_CASE_CREATED", entityType: "CapitalKybCase", entityId: kybCase.id, correlationId });
      return { kybCase, reused: false };
    }

    case "ADD_BENEFICIAL_OWNER": {
      const kybCase = await db.capitalKybCase.findFirst({ where: { id: payload.kybCaseId, workspaceId } });
      if (!kybCase) throw new CapitalCommandError(404, "KYB_CASE_NOT_FOUND", "KYB case was not found.");
      const owner = await db.capitalBeneficialOwner.create({ data: { ...payload } });
      await audit({ workspaceId, actorId, action: "CAPITAL_BENEFICIAL_OWNER_ADDED", entityType: "CapitalBeneficialOwner", entityId: owner.id, correlationId, metadata: { kybCaseId: kybCase.id } });
      return { owner };
    }

    case "RECORD_SCREENING_RESULT": {
      const kybCase = await db.capitalKybCase.findFirst({ where: { id: payload.kybCaseId, workspaceId } });
      if (!kybCase) throw new CapitalCommandError(404, "KYB_CASE_NOT_FOUND", "KYB case was not found.");
      const screening = await db.capitalScreeningResultRecord.create({
        data: { ...payload, reviewedById: actorId, reviewedAt: new Date() },
      });
      if (["POSSIBLE_MATCH", "REVIEW_REQUIRED"].includes(payload.result)) {
        await db.capitalKybCase.update({ where: { id: kybCase.id }, data: { status: "ENHANCED_DUE_DILIGENCE" } });
      }
      if (payload.result === "CONFIRMED_MATCH") {
        await db.$transaction([
          db.capitalKybCase.update({ where: { id: kybCase.id }, data: { status: "COMPLIANCE_HOLD", riskLevel: "CRITICAL" } }),
          db.capitalHold.create({ data: { kybCaseId: kybCase.id, holdType: "COMPLIANCE", reason: `Confirmed ${payload.screeningType} screening match.`, imposedById: actorId } }),
        ]);
      }
      await audit({ workspaceId, actorId, action: "CAPITAL_SCREENING_RECORDED", entityType: "CapitalScreeningResultRecord", entityId: screening.id, correlationId, outcome: payload.result, metadata: { screeningType: payload.screeningType, result: payload.result } });
      return { screening };
    }

    case "IMPOSE_HOLD": {
      if (payload.kybCaseId) {
        const kybCase = await db.capitalKybCase.findFirst({ where: { id: payload.kybCaseId, workspaceId } });
        if (!kybCase) throw new CapitalCommandError(404, "KYB_CASE_NOT_FOUND", "KYB case was not found.");
      }
      if (payload.matterId) await requireMatter(workspaceId, payload.matterId);
      const hold = await db.capitalHold.create({ data: { ...payload, imposedById: actorId } });
      if (payload.kybCaseId && payload.holdType === "COMPLIANCE") {
        await db.capitalKybCase.update({ where: { id: payload.kybCaseId }, data: { status: "COMPLIANCE_HOLD" } });
      }
      await audit({ workspaceId, actorId, action: "CAPITAL_HOLD_IMPOSED", entityType: "CapitalHold", entityId: hold.id, correlationId, metadata: { holdType: hold.holdType, reason: hold.reason } });
      return { hold };
    }

    case "RELEASE_HOLD": {
      const hold = await db.capitalHold.findFirst({
        where: { id: payload.holdId, status: "ACTIVE", OR: [{ kybCase: { workspaceId } }, { matter: { workspaceId } }] },
      });
      if (!hold) throw new CapitalCommandError(404, "ACTIVE_HOLD_NOT_FOUND", "Active hold was not found.");
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "CRITICAL_RISK_ACCEPTANCE", entityType: "CapitalHold", entityId: hold.id, object: payload });
      const released = await db.capitalHold.update({ where: { id: hold.id }, data: { status: "RELEASED", releasedById: actorId, releasedAt: new Date(), releaseReason: payload.releaseReason } });
      await audit({ workspaceId, actorId, action: "CAPITAL_HOLD_RELEASED", entityType: "CapitalHold", entityId: hold.id, correlationId, metadata: { releaseReason: payload.releaseReason, approvalRequestId: command.approvalRequestId } });
      return { hold: released };
    }

    case "CREATE_ENGAGEMENT": {
      await requireOpportunity(workspaceId, payload.opportunityId);
      const engagement = await db.capitalEngagement.create({
        data: {
          workspaceId,
          opportunityId: payload.opportunityId,
          title: payload.title,
          scope: inputJson(payload.scope),
          excludedActivities: payload.excludedActivities,
          jurisdictions: payload.jurisdictions,
          noCustodyAccepted: payload.noCustodyAccepted,
          noGuaranteeAccepted: payload.noGuaranteeAccepted,
          licensedPartnerRequired: payload.licensedPartnerRequired,
          status: "DRAFT",
        },
      });
      await audit({ workspaceId, actorId, action: "CAPITAL_ENGAGEMENT_CREATED", entityType: "CapitalEngagement", entityId: engagement.id, correlationId });
      return { engagement };
    }

    case "ADD_ENGAGEMENT_FEE": {
      const engagement = await db.capitalEngagement.findFirst({ where: { id: payload.engagementId, workspaceId } });
      if (!engagement) throw new CapitalCommandError(404, "ENGAGEMENT_NOT_FOUND", "Engagement was not found.");
      let approvalRefs: Record<string, string | undefined> = {};
      if (payload.feeType === "TRANSACTION_BASED_FEE") {
        const policy = evaluateTransactionAction({
          action: "CREATE_TRANSACTION_BASED_FEE",
          classification: "AMBER_REVIEW_REQUIRED",
          actorRole: "GEM_COMPLIANCE_OFFICER",
          transactionBasedFeesEnabled: true,
          counselApproved: true,
          licensedPartnerApproved: true,
          complianceApproved: true,
          humanApproved: true,
        });
        if (!policy.allowed) throw new CapitalCommandError(409, policy.blockCode ?? "FEE_BLOCKED", policy.reason);
        const approval = await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "TRANSACTION_BASED_FEE", entityType: "CapitalEngagement", entityId: engagement.id, object: payload });
        approvalRefs = { complianceApprovalRef: approval.approvalRequestId, counselApprovalRef: approval.approvalRequestId, licensedPartnerApprovalRef: approval.approvalRequestId };
      }
      const fee = await db.capitalEngagementFee.create({
        data: { ...payload, transactionBasedEnabled: payload.feeType === "TRANSACTION_BASED_FEE", approvedById: actorId, approvedAt: new Date(), ...approvalRefs },
      });
      await audit({ workspaceId, actorId, action: "CAPITAL_ENGAGEMENT_FEE_ADDED", entityType: "CapitalEngagementFee", entityId: fee.id, correlationId, metadata: { feeType: fee.feeType, amount: fee.amount?.toString() ?? null } });
      return { fee };
    }

    case "ACTIVATE_ENGAGEMENT": {
      const engagement = await db.capitalEngagement.findFirst({ where: { id: payload.engagementId, workspaceId } });
      if (!engagement) throw new CapitalCommandError(404, "ENGAGEMENT_NOT_FOUND", "Engagement was not found.");
      if (!engagement.noCustodyAccepted || !engagement.noGuaranteeAccepted) throw new CapitalCommandError(409, "MANDATORY_TERMS_MISSING", "No-custody and no-guarantee provisions must be accepted.");
      const updated = await db.capitalEngagement.update({ where: { id: engagement.id }, data: { status: "ACTIVE", approvedById: actorId, approvedAt: new Date(), signedAt: payload.signedAt, effectiveAt: payload.effectiveAt, expiresAt: payload.expiresAt } });
      await audit({ workspaceId, actorId, action: "CAPITAL_ENGAGEMENT_ACTIVATED", entityType: "CapitalEngagement", entityId: updated.id, correlationId });
      return { engagement: updated };
    }

    case "CREATE_MATTER": {
      const opportunity = await requireOpportunity(workspaceId, payload.opportunityId);
      const engagement = await db.capitalEngagement.findFirst({ where: { id: payload.engagementId, workspaceId, opportunityId: opportunity.id, status: "ACTIVE" } });
      if (!engagement) throw new CapitalCommandError(409, "ACTIVE_ENGAGEMENT_REQUIRED", "An active engagement linked to the opportunity is required.");
      const matter = await db.capitalMatter.create({ data: { workspaceId, opportunityId: opportunity.id, engagementId: engagement.id, publicId: publicId("GEM-MAT"), title: payload.title, transactionType: payload.transactionType, targetAmount: payload.targetAmount, currency: payload.currency, useOfProceeds: payload.useOfProceeds, status: "KYB_AND_CONFLICT_REVIEW" } });
      await db.capitalOpportunity.update({ where: { id: opportunity.id }, data: { status: "CONVERTED" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_MATTER_CREATED", entityType: "CapitalMatter", entityId: matter.id, correlationId, metadata: { publicId: matter.publicId } });
      return { matter };
    }

    case "SAVE_READINESS_ASSESSMENT": {
      await requireMatter(workspaceId, payload.matterId);
      const decision = calculateCapitalReadiness(payload.workstreams);
      const assessment = await db.capitalReadinessAssessment.create({
        data: {
          matterId: payload.matterId,
          status: decision.status,
          overallScore: decision.overallScore,
          criticalBlocks: decision.criticalBlocks,
          calculatedAt: new Date(),
          calculatedById: actorId,
          methodologyVersion: payload.methodologyVersion,
          workstreams: {
            create: payload.workstreams.map((item) => ({
              type: item.type,
              score: item.score,
              weight: ({ CORPORATE: 15, FINANCIAL: 20, COMMERCIAL: 10, MANAGEMENT: 10, CYBERSECURITY: 15, COMPLIANCE: 15, TRANSACTION: 10, DATA_ROOM: 5 } as const)[item.type],
              status: item.criticalFindings > 0 ? "BLOCKED" : item.score >= 80 ? "READY" : item.score >= 65 ? "CONDITIONALLY_READY" : "REMEDIATION_REQUIRED",
              evidenceQuality: item.evidenceQuality,
              reviewerConfidence: item.reviewerConfidence,
              criticalFindings: item.criticalFindings,
              openActions: item.openActions,
              reviewedById: actorId,
              reviewedAt: new Date(),
            })),
          },
        },
        include: { workstreams: true },
      });
      await db.capitalMatter.update({ where: { id: payload.matterId }, data: { status: decision.status === "REMEDIATION_REQUIRED" || decision.status === "BLOCKED" ? "REMEDIATION" : "READINESS_ASSESSMENT" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_READINESS_ASSESSMENT_SAVED", entityType: "CapitalReadinessAssessment", entityId: assessment.id, correlationId, outcome: decision.status, metadata: decision });
      return { assessment, decision };
    }

    case "CREATE_FINDING": {
      await requireMatter(workspaceId, payload.matterId);
      const finding = await db.capitalFinding.create({ data: { ...payload } });
      if (payload.severity === "CRITICAL") await db.capitalMatter.update({ where: { id: payload.matterId }, data: { status: "REMEDIATION", globalHold: true } });
      await audit({ workspaceId, actorId, action: "CAPITAL_FINDING_CREATED", entityType: "CapitalFinding", entityId: finding.id, correlationId, outcome: payload.severity });
      return { finding };
    }

    case "RESOLVE_FINDING": {
      const finding = await db.capitalFinding.findFirst({ where: { id: payload.findingId, matter: { workspaceId } } });
      if (!finding) throw new CapitalCommandError(404, "FINDING_NOT_FOUND", "Finding was not found.");
      if (finding.severity === "CRITICAL" && payload.resolution === "RISK_ACCEPTED") {
        await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "CRITICAL_RISK_ACCEPTANCE", entityType: "CapitalFinding", entityId: finding.id, object: payload });
      }
      if (payload.resolution === "VERIFIED" && payload.evidenceRefs.length === 0) throw new CapitalCommandError(409, "VERIFICATION_EVIDENCE_REQUIRED", "Verified findings require evidence references.");
      const updated = await db.capitalFinding.update({ where: { id: finding.id }, data: { status: payload.resolution, residualRisk: payload.residualRisk, evidenceRefs: [...new Set([...finding.evidenceRefs, ...payload.evidenceRefs])], verifiedById: actorId, verifiedAt: new Date(), clientAcceptedAt: payload.resolution === "RISK_ACCEPTED" ? new Date() : undefined } });
      const remainingCritical = await db.capitalFinding.count({ where: { matterId: finding.matterId, severity: "CRITICAL", status: { notIn: ["VERIFIED", "RISK_ACCEPTED", "REJECTED"] } } });
      if (remainingCritical === 0) await db.capitalMatter.update({ where: { id: finding.matterId }, data: { globalHold: false } });
      await audit({ workspaceId, actorId, action: "CAPITAL_FINDING_RESOLVED", entityType: "CapitalFinding", entityId: finding.id, correlationId, outcome: payload.resolution });
      return { finding: updated, remainingCritical };
    }

    case "SUBMIT_COMMITTEE_REVIEW": {
      const matter = await requireMatter(workspaceId, payload.matterId);
      const assessment = await db.capitalReadinessAssessment.findFirst({ where: { matterId: matter.id }, orderBy: { createdAt: "desc" } });
      if (!assessment || !["READY", "CONDITIONALLY_READY"].includes(assessment.status)) throw new CapitalCommandError(409, "READINESS_REQUIRED", "A ready or conditionally ready assessment is required.");
      const latest = await db.capitalCommitteeReview.aggregate({ where: { matterId: matter.id }, _max: { packageVersion: true } });
      const packageVersion = (latest._max.packageVersion ?? 0) + 1;
      const packageObject = { matterId: matter.id, assessmentId: assessment.id, assessmentScore: assessment.overallScore?.toString() ?? null, conditions: payload.conditions, packageVersion };
      const review = await db.capitalCommitteeReview.create({ data: { matterId: matter.id, packageVersion, packageHash: capitalObjectHash(packageObject), conditions: inputJson(payload.conditions), submittedById: actorId } });
      await db.capitalMatter.update({ where: { id: matter.id }, data: { status: "INTERNAL_COMMITTEE" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_COMMITTEE_REVIEW_SUBMITTED", entityType: "CapitalCommitteeReview", entityId: review.id, correlationId, metadata: { packageVersion, packageHash: review.packageHash } });
      return { review };
    }

    case "CAST_COMMITTEE_VOTE": {
      const review = await db.capitalCommitteeReview.findFirst({ where: { id: payload.reviewId, matter: { workspaceId } }, include: { votes: true } });
      if (!review) throw new CapitalCommandError(404, "COMMITTEE_REVIEW_NOT_FOUND", "Committee review was not found.");
      if (review.submittedById === actorId) throw new CapitalCommandError(409, "SEPARATION_OF_DUTIES_REQUIRED", "The committee package submitter cannot vote on the same package.");
      const vote = await db.capitalCommitteeVote.create({ data: { reviewId: review.id, voterId: actorId, decision: payload.decision, rationale: payload.rationale } });
      const votes = [...review.votes, vote];
      const matching = votes.filter((item) => item.decision === payload.decision).length;
      const approvalDecision = ["APPROVED_FOR_PARTNER_REVIEW", "APPROVED_WITH_CONDITIONS"].includes(payload.decision);
      if (!approvalDecision || matching >= 2) {
        await db.capitalCommitteeReview.update({ where: { id: review.id }, data: { decision: payload.decision, decidedAt: new Date() } });
      }
      await audit({ workspaceId, actorId, action: "CAPITAL_COMMITTEE_VOTE_CAST", entityType: "CapitalCommitteeReview", entityId: review.id, correlationId, outcome: payload.decision, metadata: { matchingVotes: matching, requiredVotes: approvalDecision ? 2 : 1 } });
      return { vote, decisionFinalized: !approvalDecision || matching >= 2, matchingVotes: matching };
    }

    case "REGISTER_LICENSED_PARTNER": {
      const partner = await db.capitalLicensedPartner.create({ data: { workspaceId, ...payload, status: "PENDING_VERIFICATION", verifiedAt: new Date() } });
      await audit({ workspaceId, actorId, action: "CAPITAL_LICENSED_PARTNER_REGISTERED", entityType: "CapitalLicensedPartner", entityId: partner.id, correlationId, metadata: { regulatoryReference: partner.regulatoryReference } });
      return { partner };
    }

    case "ADD_PARTNER_LICENSE": {
      const partner = await db.capitalLicensedPartner.findFirst({ where: { id: payload.partnerId, workspaceId } });
      if (!partner) throw new CapitalCommandError(404, "PARTNER_NOT_FOUND", "Licensed partner was not found.");
      const license = await db.capitalPartnerLicense.create({ data: { ...payload } });
      const now = new Date();
      const active = Boolean(partner.verificationEvidenceRef && (!partner.agreementExpiresAt || partner.agreementExpiresAt > now) && (!payload.expiresAt || payload.expiresAt > now));
      if (active) await db.capitalLicensedPartner.update({ where: { id: partner.id }, data: { status: "ACTIVE", verifiedAt: payload.verifiedAt } });
      await audit({ workspaceId, actorId, action: "CAPITAL_PARTNER_LICENSE_ADDED", entityType: "CapitalPartnerLicense", entityId: license.id, correlationId, outcome: active ? "PARTNER_ACTIVE" : "PENDING_VERIFICATION" });
      return { license, partnerActivated: active };
    }

    case "ROUTE_TO_PARTNER": {
      const matter = await requireMatter(workspaceId, payload.matterId);
      const partner = await db.capitalLicensedPartner.findFirst({ where: { id: payload.partnerId, workspaceId }, include: { licenses: true } });
      if (!partner) throw new CapitalCommandError(404, "PARTNER_NOT_FOUND", "Licensed partner was not found.");
      const license = partner.licenses.find((item) => item.jurisdiction === payload.jurisdiction && item.authorizedActivities.includes(payload.instrument));
      const eligibility = evaluateCapitalPartnerEligibility({ status: partner.status, jurisdiction: payload.jurisdiction, approvedJurisdictions: partner.jurisdictions, instrument: payload.instrument, authorizedInstruments: partner.authorizedInstruments, transactionAmount: matter.targetAmount ? Number(matter.targetAmount) : null, minimumTransaction: partner.minimumTransaction ? Number(partner.minimumTransaction) : null, maximumTransaction: partner.maximumTransaction ? Number(partner.maximumTransaction) : null, agreementExpiresAt: partner.agreementExpiresAt, licenseExpiresAt: license?.expiresAt, conflictCleared: payload.conflictCleared, verificationEvidenceRef: partner.verificationEvidenceRef });
      if (!eligibility.eligible) throw new CapitalCommandError(409, "PARTNER_NOT_ELIGIBLE", eligibility.blockers.join(" "));
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "PARTNER_ROUTING", entityType: "CapitalMatter", entityId: matter.id, object: payload });
      const mandate = await db.capitalPartnerMandate.create({ data: { matterId: matter.id, partnerId: partner.id, jurisdiction: payload.jurisdiction, instrument: payload.instrument, routedById: actorId, approvalRef: command.approvalRequestId } });
      await db.capitalMatter.update({ where: { id: matter.id }, data: { status: "LICENSED_PARTNER_REVIEW" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_MATTER_ROUTED_TO_PARTNER", entityType: "CapitalPartnerMandate", entityId: mandate.id, correlationId, metadata: { partnerId: partner.id, approvalRequestId: command.approvalRequestId } });
      return { mandate, eligibility };
    }

    case "CREATE_TARGET_UNIVERSE": {
      await requireMatter(workspaceId, payload.matterId);
      const universe = await db.capitalTargetUniverse.create({ data: { workspaceId, matterId: payload.matterId, name: payload.name, objective: payload.objective, confidentialityPosture: payload.confidentialityPosture, approvedByClientAt: payload.clientApproved ? new Date() : undefined, createdById: actorId } });
      await audit({ workspaceId, actorId, action: "CAPITAL_TARGET_UNIVERSE_CREATED", entityType: "CapitalTargetUniverse", entityId: universe.id, correlationId });
      return { universe };
    }

    case "ADD_TARGET_ENTRY": {
      const universe = await db.capitalTargetUniverse.findFirst({ where: { id: payload.universeId, workspaceId } });
      if (!universe) throw new CapitalCommandError(404, "TARGET_UNIVERSE_NOT_FOUND", "Target universe was not found.");
      const entry = await db.capitalTargetEntry.create({ data: { ...payload, status: "RESEARCH_ONLY" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_TARGET_ENTRY_ADDED", entityType: "CapitalTargetEntry", entityId: entry.id, correlationId, metadata: { universeId: universe.id, status: entry.status } });
      return { entry };
    }

    case "APPROVE_CONTROLLED_OUTREACH": {
      const entry = await db.capitalTargetEntry.findFirst({ where: { id: payload.targetEntryId, universe: { workspaceId } } });
      if (!entry) throw new CapitalCommandError(404, "TARGET_ENTRY_NOT_FOUND", "Target entry was not found.");
      const partner = await db.capitalLicensedPartner.findFirst({ where: { id: payload.licensedPartnerId, workspaceId, status: "ACTIVE" } });
      if (!partner) throw new CapitalCommandError(409, "ACTIVE_PARTNER_REQUIRED", "An active licensed partner is required for controlled outreach.");
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "CONTROLLED_OUTREACH", entityType: "CapitalTargetEntry", entityId: entry.id, object: payload });
      const outreach = await db.$transaction(async (transaction) => {
        await transaction.capitalTargetEntry.update({ where: { id: entry.id }, data: { status: "APPROVED_FOR_LICENSED_OUTREACH" } });
        return transaction.capitalOutreachEvent.create({ data: { targetEntryId: entry.id, status: "APPROVED", licensedPartnerId: partner.id, approvedMessageHash: payload.approvedMessageHash, approvedSender: payload.approvedSender, approvedRecipient: payload.approvedRecipient, jurisdictionCheckRef: payload.jurisdictionCheckRef, eligibilityCheckRef: payload.eligibilityCheckRef, materialVersionRef: payload.materialVersionRef, complianceApprovalRef: command.approvalRequestId, partnerApprovalRef: command.approvalRequestId } });
      });
      await audit({ workspaceId, actorId, action: "CAPITAL_CONTROLLED_OUTREACH_APPROVED", entityType: "CapitalOutreachEvent", entityId: outreach.id, correlationId, metadata: { targetEntryId: entry.id, partnerId: partner.id } });
      return { outreach };
    }

    case "CREATE_DATA_ROOM": {
      await requireMatter(workspaceId, payload.matterId);
      const dataRoom = await db.capitalDataRoom.create({ data: { workspaceId, matterId: payload.matterId, name: payload.name, watermarkRequired: payload.watermarkRequired, downloadDisabledByDefault: payload.downloadDisabledByDefault, createdById: actorId } });
      await audit({ workspaceId, actorId, action: "CAPITAL_DATA_ROOM_CREATED", entityType: "CapitalDataRoom", entityId: dataRoom.id, correlationId });
      return { dataRoom };
    }

    case "REGISTER_DOCUMENT_VERSION": {
      const dataRoom = await db.capitalDataRoom.findFirst({ where: { id: payload.dataRoomId, workspaceId } });
      if (!dataRoom) throw new CapitalCommandError(404, "DATA_ROOM_NOT_FOUND", "Data room was not found.");
      let document = payload.documentId ? await db.capitalDocument.findFirst({ where: { id: payload.documentId, dataRoomId: dataRoom.id } }) : null;
      if (!document) {
        document = await db.capitalDocument.create({ data: { dataRoomId: dataRoom.id, category: payload.category, title: payload.title, confidentialityLevel: payload.confidentialityLevel, ownerId: actorId, watermarkRequired: dataRoom.watermarkRequired } });
      }
      const latest = await db.capitalDocumentVersion.aggregate({ where: { documentId: document.id }, _max: { version: true } });
      const versionNumber = (latest._max.version ?? 0) + 1;
      const version = await db.capitalDocumentVersion.create({ data: { documentId: document.id, version: versionNumber, storageRef: payload.storageRef, fileName: payload.fileName, mimeType: payload.mimeType, fileSize: payload.fileSize, checksum: payload.checksum.toLowerCase(), sourceRef: payload.sourceRef, redactionStatus: payload.redactionStatus, supersedesVersion: latest._max.version, createdById: actorId } });
      await db.capitalDocument.update({ where: { id: document.id }, data: { currentVersion: versionNumber, status: "REVIEW_REQUIRED" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_DOCUMENT_VERSION_REGISTERED", entityType: "CapitalDocumentVersion", entityId: version.id, correlationId, metadata: { documentId: document.id, version: versionNumber, checksum: version.checksum } });
      return { document, version };
    }

    case "RELEASE_DOCUMENT": {
      const document = await db.capitalDocument.findFirst({ where: { id: payload.documentId, dataRoom: { workspaceId } }, include: { versions: { where: { version: payload.version }, take: 1 } } });
      if (!document || document.versions.length === 0) throw new CapitalCommandError(404, "DOCUMENT_VERSION_NOT_FOUND", "Document version was not found.");
      if (document.legalHoldActive) throw new CapitalCommandError(423, "DOCUMENT_LEGAL_HOLD", "A document under legal hold cannot be released.");
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "DOCUMENT_RELEASE", entityType: "CapitalDocument", entityId: document.id, object: payload });
      const updated = await db.$transaction(async (transaction) => {
        await transaction.capitalDocumentVersion.update({ where: { id: document.versions[0].id }, data: { approvedById: actorId, approvedAt: new Date() } });
        return transaction.capitalDocument.update({ where: { id: document.id }, data: { status: "RELEASED", currentVersion: payload.version, downloadAllowed: payload.downloadAllowed } });
      });
      await audit({ workspaceId, actorId, action: "CAPITAL_DOCUMENT_RELEASED", entityType: "CapitalDocument", entityId: document.id, correlationId, metadata: { version: payload.version, downloadAllowed: payload.downloadAllowed } });
      return { document: updated };
    }

    case "GRANT_DATA_ROOM_ACCESS": {
      const dataRoom = await db.capitalDataRoom.findFirst({ where: { id: payload.dataRoomId, workspaceId } });
      if (!dataRoom) throw new CapitalCommandError(404, "DATA_ROOM_NOT_FOUND", "Data room was not found.");
      if (payload.expiresAt <= new Date()) throw new CapitalCommandError(400, "ACCESS_EXPIRY_REQUIRED", "Access expiry must be in the future.");
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "DATA_ROOM_ACCESS", entityType: "CapitalDataRoom", entityId: dataRoom.id, object: payload });
      const grant = await db.capitalDataRoomAccess.create({ data: { dataRoomId: dataRoom.id, granteeType: payload.granteeType, granteeRef: payload.granteeRef, confidentialityLevel: payload.confidentialityLevel, canDownload: payload.canDownload, grantedById: actorId, approvedByPartnerRef: command.approvalRequestId, expiresAt: payload.expiresAt } });
      await audit({ workspaceId, actorId, action: "CAPITAL_DATA_ROOM_ACCESS_GRANTED", entityType: "CapitalDataRoomAccess", entityId: grant.id, correlationId, metadata: { granteeType: grant.granteeType, expiresAt: grant.expiresAt } });
      return { grant };
    }

    case "CREATE_DILIGENCE_QUESTION": {
      await requireMatter(workspaceId, payload.matterId);
      const question = await db.capitalDiligenceQuestion.create({ data: { ...payload, status: "SENT_TO_CLIENT" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_DILIGENCE_QUESTION_CREATED", entityType: "CapitalDiligenceQuestion", entityId: question.id, correlationId });
      return { question };
    }

    case "ADD_DILIGENCE_RESPONSE": {
      const question = await db.capitalDiligenceQuestion.findFirst({ where: { id: payload.questionId, matter: { workspaceId } } });
      if (!question) throw new CapitalCommandError(404, "DILIGENCE_QUESTION_NOT_FOUND", "Diligence question was not found.");
      const latest = await db.capitalDiligenceResponse.aggregate({ where: { questionId: question.id }, _max: { version: true } });
      const response = await db.capitalDiligenceResponse.create({ data: { questionId: question.id, response: payload.response, evidenceRefs: payload.evidenceRefs, respondentId: actorId, version: (latest._max.version ?? 0) + 1 } });
      await db.capitalDiligenceQuestion.update({ where: { id: question.id }, data: { status: "ANALYST_REVIEW" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_DILIGENCE_RESPONSE_ADDED", entityType: "CapitalDiligenceResponse", entityId: response.id, correlationId, metadata: { questionId: question.id, version: response.version } });
      return { response };
    }

    case "RECORD_PROPOSAL": {
      await requireMatter(workspaceId, payload.matterId);
      if (payload.targetEntryId) {
        const target = await db.capitalTargetEntry.findFirst({ where: { id: payload.targetEntryId, universe: { workspaceId } } });
        if (!target) throw new CapitalCommandError(404, "TARGET_ENTRY_NOT_FOUND", "Target entry was not found.");
      }
      const proposal = await db.capitalProposal.create({ data: { ...payload, covenants: inputJson(payload.covenants), conditions: inputJson(payload.conditions), fees: inputJson(payload.fees) } });
      await audit({ workspaceId, actorId, action: "CAPITAL_PROPOSAL_RECORDED", entityType: "CapitalProposal", entityId: proposal.id, correlationId, outcome: proposal.status, metadata: { sourceLabel: proposal.sourceLabel } });
      return { proposal };
    }

    case "ADD_CLOSING_CONDITION": {
      await requireMatter(workspaceId, payload.matterId);
      const condition = await db.capitalClosingCondition.create({ data: { ...payload } });
      await audit({ workspaceId, actorId, action: "CAPITAL_CLOSING_CONDITION_ADDED", entityType: "CapitalClosingCondition", entityId: condition.id, correlationId });
      return { condition };
    }

    case "CREATE_CLOSING": {
      const matter = await requireMatter(workspaceId, payload.matterId);
      const approvedProposal = await db.capitalProposal.findFirst({ where: { matterId: matter.id, status: { in: ["TERM_SHEET", "APPROVED"] } } });
      if (!approvedProposal) throw new CapitalCommandError(409, "APPROVED_PROPOSAL_REQUIRED", "An approved proposal or term sheet is required.");
      const existing = await db.capitalClosing.findFirst({ where: { matterId: matter.id, status: { notIn: ["FAILED_TO_CLOSE", "TERMINATED"] } } });
      if (existing) return { closing: existing, reused: true };
      const closing = await db.capitalClosing.create({ data: { matterId: matter.id, scheduledAt: payload.scheduledAt, status: "CONDITIONS_OUTSTANDING" } });
      await db.capitalMatter.update({ where: { id: matter.id }, data: { status: "PRE_CLOSING" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_CLOSING_CREATED", entityType: "CapitalClosing", entityId: closing.id, correlationId });
      return { closing, reused: false };
    }

    case "AUTHORIZE_CLOSING": {
      const closing = await db.capitalClosing.findFirst({ where: { id: payload.closingId, matter: { workspaceId } }, include: { matter: { include: { closingConditions: true } } } });
      if (!closing) throw new CapitalCommandError(404, "CLOSING_NOT_FOUND", "Closing was not found.");
      const conditionsComplete = closing.matter.closingConditions.length > 0 && closing.matter.closingConditions.every((item) => ["COMPLETE", "VERIFIED", "WAIVED_BY_COUNSEL"].includes(item.status));
      const gates = evaluateCapitalClosingGates({ finalKybRefresh: true, finalSanctionsRefresh: true, ownershipConfirmed: true, documentsApproved: true, partnerConfirmed: Boolean(payload.partnerConfirmationRef), counselConfirmed: Boolean(payload.counselConfirmationRef), finalFeeApproved: Boolean(payload.feeApprovalRef), conditionsPrecedentComplete: conditionsComplete, signatoriesConfirmed: payload.authorizedSignatoriesConfirmed, fundsFlowVerifiedExternally: payload.fundsFlowVerifiedExternally, noGemCustodyConfirmed: payload.noGemCustodyConfirmed, postCloseOwnersAssigned: true });
      if (!gates.readyToClose) throw new CapitalCommandError(409, "CLOSING_GATES_INCOMPLETE", gates.blockers.join(" "));
      await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "CLOSING_AUTHORIZATION", entityType: "CapitalClosing", entityId: closing.id, object: payload });
      const updated = await db.capitalClosing.update({ where: { id: closing.id }, data: { status: "READY_TO_CLOSE", ...payload } });
      await audit({ workspaceId, actorId, action: "CAPITAL_CLOSING_AUTHORIZED", entityType: "CapitalClosing", entityId: closing.id, correlationId, metadata: { approvalRequestId: command.approvalRequestId } });
      return { closing: updated, gates };
    }

    case "CREATE_SERVICE_CONTRACT": {
      if (payload.matterId) await requireMatter(workspaceId, payload.matterId);
      const contract = await db.capitalServiceContract.create({ data: { workspaceId, matterId: payload.matterId, title: payload.title, serviceTypes: payload.serviceTypes, monthlyAmount: payload.monthlyAmount, annualAmount: payload.annualAmount, currency: payload.currency, startAt: payload.startAt, endAt: payload.endAt, approvedById: actorId, status: payload.startAt && payload.startAt <= new Date() ? "ACTIVE" : "APPROVED" } });
      await audit({ workspaceId, actorId, action: "CAPITAL_SERVICE_CONTRACT_CREATED", entityType: "CapitalServiceContract", entityId: contract.id, correlationId, outcome: contract.status });
      return { contract };
    }

    case "RECORD_REVENUE_EVENT": {
      if (payload.contractId) {
        const contract = await db.capitalServiceContract.findFirst({ where: { id: payload.contractId, workspaceId } });
        if (!contract) throw new CapitalCommandError(404, "SERVICE_CONTRACT_NOT_FOUND", "Service contract was not found.");
      }
      const event = await db.capitalRevenueEvent.create({ data: { workspaceId, ...payload } });
      await audit({ workspaceId, actorId, action: "CAPITAL_REVENUE_EVENT_RECORDED", entityType: "CapitalRevenueEvent", entityId: event.id, correlationId, outcome: event.status, metadata: { revenueType: event.revenueType, amount: event.amount.toString(), currency: event.currency } });
      return { revenueEvent: event };
    }

    case "REGISTER_GOVERNED_AGENT": {
      const agent = await db.capitalGovernedAgent.create({ data: { workspaceId, name: payload.name, purpose: payload.purpose, status: "ACTIVE", configuration: inputJson(payload.configuration) } });
      await audit({ workspaceId, actorId, action: "CAPITAL_GOVERNED_AGENT_REGISTERED", entityType: "CapitalGovernedAgent", entityId: agent.id, correlationId });
      return { agent };
    }

    case "RECORD_GOVERNED_AGENT_RUN": {
      const agent = await db.capitalGovernedAgent.findFirst({ where: { id: payload.agentId, workspaceId, status: "ACTIVE" } });
      if (!agent) throw new CapitalCommandError(404, "ACTIVE_AGENT_NOT_FOUND", "Active governed agent was not found.");
      if (payload.matterId) await requireMatter(workspaceId, payload.matterId);
      let approvalRef: string | undefined;
      if (["AMBER_REVIEW_REQUIRED", "RED_LICENSED_PARTNER_ONLY"].includes(payload.activityClassification) && payload.status === "COMPLETED") {
        const approval = await requireApproval({ workspaceId, approvalRequestId: command.approvalRequestId, action: "HIGH_IMPACT_AI_ACTION", entityType: "CapitalGovernedAgent", entityId: agent.id, object: payload });
        approvalRef = approval.approvalRequestId;
      }
      if (payload.activityClassification === "PROHIBITED" && payload.status !== "BLOCKED") throw new CapitalCommandError(409, "PROHIBITED_AGENT_ACTION", "Prohibited agent actions must be recorded as BLOCKED.");
      const run = await db.capitalGovernedAgentRun.create({ data: { agentId: agent.id, matterId: payload.matterId, requestedById: actorId, activityClassification: payload.activityClassification, inputHash: payload.inputHash, outputHash: payload.outputHash, evidenceRefs: payload.evidenceRefs, confidence: payload.confidence, status: payload.status, humanApprovalRef: approvalRef, partnerApprovalRef: payload.activityClassification === "RED_LICENSED_PARTNER_ONLY" ? approvalRef : undefined, complianceApprovalRef: approvalRef, errorCode: payload.errorCode, safeErrorMessage: payload.safeErrorMessage, startedAt: payload.status === "QUEUED" ? undefined : new Date(), completedAt: ["COMPLETED", "FAILED", "CANCELLED", "BLOCKED"].includes(payload.status) ? new Date() : undefined } });
      await audit({ workspaceId, actorId, action: "CAPITAL_GOVERNED_AGENT_RUN_RECORDED", entityType: "CapitalGovernedAgentRun", entityId: run.id, correlationId, outcome: run.status, metadata: { activityClassification: run.activityClassification, approvalRef } });
      return { run };
    }
  }
}

export async function executeCapitalCommand(command: CapitalCommandInput, actorId: string) {
  const requestHash = capitalObjectHash({ command: command.command, payload: command.payload, approvalRequestId: command.approvalRequestId ?? null });
  const existing = await db.idempotencyRecord.findUnique({ where: { workspaceId_key: { workspaceId: command.workspaceId, key: command.idempotencyKey } } });
  if (existing) {
    if (existing.requestHash !== requestHash) throw new CapitalCommandError(409, "IDEMPOTENCY_KEY_REUSED", "The idempotency key was previously used with a different command payload.");
    return { replayed: true, correlationId: null, result: existing.response };
  }

  const correlationId = randomUUID();
  const result = await executeUncached(command, actorId, correlationId);
  const response = inputJson(result);
  try {
    await db.idempotencyRecord.create({ data: { workspaceId: command.workspaceId, key: command.idempotencyKey, requestHash, response, statusCode: 200, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
  }
  return { replayed: false, correlationId, result };
}
