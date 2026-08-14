import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { z } from "zod";
import type { createCapitalOpportunitySchema } from "@/lib/capital-readiness/validation";
import {
  validateCapitalMatterTransition,
  type CapitalMatterStatus,
  type CapitalTransitionContext,
} from "@/lib/capital-readiness/workflow";

export type CreateCapitalOpportunityInput = z.infer<typeof createCapitalOpportunitySchema>;

function publicId(prefix: string): string {
  return `${prefix}-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

export async function createCapitalOpportunity(
  input: CreateCapitalOpportunityInput,
  actorId: string,
) {
  const correlationId = randomUUID();

  return db.$transaction(async (transaction) => {
    const opportunity = await transaction.capitalOpportunity.create({
      data: {
        workspaceId: input.workspaceId,
        publicId: publicId("GEM-CAP"),
        legalEntityName: input.legalEntityName,
        jurisdiction: input.jurisdiction,
        registrationNumber: input.registrationNumber,
        projectType: input.projectType,
        targetAmount: input.targetAmount,
        currency: input.currency,
        useOfProceeds: input.useOfProceeds,
        timingConstraint: input.timingConstraint,
        existingDebt: input.existingDebt,
        referralSource: input.referralSource,
        activityClassification: input.activityClassification,
        consentVersion: input.consentVersion,
        consentGivenAt: input.consentGivenAt,
        privacyVersion: input.privacyVersion,
        privacyAcceptedAt: input.privacyAcceptedAt,
        assignedToId: actorId,
        contacts: {
          create: {
            name: input.primaryContact.name,
            email: input.primaryContact.email.toLowerCase(),
            phone: input.primaryContact.phone,
            title: input.primaryContact.title,
            isPrimary: true,
          },
        },
      },
      include: {
        contacts: true,
      },
    });

    await transaction.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId,
        action: "CAPITAL_OPPORTUNITY_CREATED",
        entityType: "CapitalOpportunity",
        entityId: opportunity.id,
        correlationId,
        outcome: "SUCCESS",
        sourceChannel: "COMMAND_CENTER_API",
        safeMetadata: {
          publicId: opportunity.publicId,
          status: opportunity.status,
          jurisdiction: opportunity.jurisdiction,
          activityClassification: opportunity.activityClassification,
        },
      },
    });

    return { opportunity, correlationId };
  });
}

export async function listCapitalOpportunities(workspaceId: string, limit = 50) {
  return db.capitalOpportunity.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(100, limit)),
    include: {
      contacts: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: {
          kybCases: true,
          engagements: true,
          matters: true,
        },
      },
    },
  });
}

export interface CapitalCommandCenterSnapshot {
  availability: "ready" | "configuration_required";
  workspaceId: string;
  generatedAt: string;
  metrics: {
    opportunities: number;
    qualifiedOpportunities: number;
    activeMatters: number;
    activeHolds: number;
    criticalOpenFindings: number;
    activeLicensedPartners: number;
    controlledOutreachEntries: number;
    activeDataRooms: number;
    activePostCloseContracts: number;
    recordedRevenue: string;
  };
  stages: Array<{ status: string; count: number }>;
  blockers: string[];
}

export async function buildCapitalCommandCenterSnapshot(
  workspaceId: string,
): Promise<CapitalCommandCenterSnapshot> {
  try {
    const [
      opportunities,
      qualifiedOpportunities,
      activeMatters,
      activeHolds,
      criticalOpenFindings,
      activeLicensedPartners,
      controlledOutreachEntries,
      activeDataRooms,
      activePostCloseContracts,
      revenue,
      stages,
    ] = await Promise.all([
      db.capitalOpportunity.count({ where: { workspaceId } }),
      db.capitalOpportunity.count({ where: { workspaceId, status: "QUALIFIED" } }),
      db.capitalMatter.count({
        where: {
          workspaceId,
          status: { notIn: ["CLOSED", "FAILED_TO_CLOSE", "TERMINATED"] },
        },
      }),
      db.capitalHold.count({
        where: {
          status: "ACTIVE",
          OR: [{ kybCase: { workspaceId } }, { matter: { workspaceId } }],
        },
      }),
      db.capitalFinding.count({
        where: {
          matter: { workspaceId },
          severity: "CRITICAL",
          status: { notIn: ["VERIFIED", "RISK_ACCEPTED", "REJECTED"] },
        },
      }),
      db.capitalLicensedPartner.count({ where: { workspaceId, status: "ACTIVE" } }),
      db.capitalTargetEntry.count({
        where: {
          universe: { workspaceId },
          status: "APPROVED_FOR_LICENSED_OUTREACH",
        },
      }),
      db.capitalDataRoom.count({ where: { workspaceId, status: { not: "ARCHIVED" } } }),
      db.capitalServiceContract.count({ where: { workspaceId, status: "ACTIVE" } }),
      db.capitalRevenueEvent.aggregate({
        where: { workspaceId, status: { in: ["INVOICED", "COLLECTED", "RECOGNIZED"] } },
        _sum: { amount: true },
      }),
      db.capitalMatter.groupBy({
        by: ["status"],
        where: { workspaceId },
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
    ]);

    const blockers: string[] = [];
    if (activeHolds > 0) blockers.push(`${activeHolds} active compliance, legal, security, or payment hold(s).`);
    if (criticalOpenFindings > 0) blockers.push(`${criticalOpenFindings} unresolved critical finding(s).`);
    if (activeLicensedPartners === 0) blockers.push("No verified active licensed partner is available for regulated execution.");

    return {
      availability: "ready",
      workspaceId,
      generatedAt: new Date().toISOString(),
      metrics: {
        opportunities,
        qualifiedOpportunities,
        activeMatters,
        activeHolds,
        criticalOpenFindings,
        activeLicensedPartners,
        controlledOutreachEntries,
        activeDataRooms,
        activePostCloseContracts,
        recordedRevenue: revenue._sum.amount?.toString() ?? "0",
      },
      stages: stages.map((stage) => ({ status: stage.status, count: stage._count._all })),
      blockers,
    };
  } catch (error) {
    console.error("[capital-readiness] snapshot unavailable", error);
    return {
      availability: "configuration_required",
      workspaceId,
      generatedAt: new Date().toISOString(),
      metrics: {
        opportunities: 0,
        qualifiedOpportunities: 0,
        activeMatters: 0,
        activeHolds: 0,
        criticalOpenFindings: 0,
        activeLicensedPartners: 0,
        controlledOutreachEntries: 0,
        activeDataRooms: 0,
        activePostCloseContracts: 0,
        recordedRevenue: "0",
      },
      stages: [],
      blockers: ["Capital-readiness database models are not yet available in the selected environment."],
    };
  }
}

async function deriveTransitionContext(matterId: string, workspaceId: string) {
  const matter = await db.capitalMatter.findFirst({
    where: { id: matterId, workspaceId },
    include: {
      holds: { where: { status: "ACTIVE" }, select: { holdType: true } },
      engagement: { select: { signedAt: true, status: true } },
      opportunity: {
        select: {
          kybCases: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true },
          },
        },
      },
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
      committeeReviews: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { decision: true },
      },
      partnerMandates: {
        where: { status: { in: ["ACCEPTED", "ACTIVE"] } },
        take: 1,
        select: { id: true },
      },
      targetUniverses: {
        select: {
          entries: {
            select: {
              outreachEvents: {
                where: {
                  status: {
                    in: [
                      "APPROVED",
                      "CONTACTED_BY_PARTNER",
                      "RESPONSE_RECEIVED",
                      "NDA_PENDING",
                      "NDA_SIGNED",
                      "MATERIALS_GRANTED",
                      "DILIGENCE_ACTIVE",
                      "INDICATION_RECEIVED",
                    ],
                  },
                },
                take: 1,
                select: { id: true },
              },
            },
          },
        },
      },
      proposals: {
        where: { status: { in: ["TERM_SHEET", "APPROVED"] } },
        take: 1,
        select: { id: true },
      },
      closingConditions: {
        select: { status: true },
      },
    },
  });

  if (!matter) return null;

  const outreachApproved = matter.targetUniverses.some((universe) =>
    universe.entries.some((entry) => entry.outreachEvents.length > 0),
  );
  const closingGatesSatisfied =
    matter.closingConditions.length > 0 &&
    matter.closingConditions.every((condition) => ["COMPLETE", "VERIFIED", "WAIVED_BY_COUNSEL"].includes(condition.status));

  const context: CapitalTransitionContext = {
    activeComplianceHold: matter.holds.some((hold) => hold.holdType === "COMPLIANCE"),
    activeLegalHold: matter.holds.some((hold) => hold.holdType === "LEGAL"),
    engagementSigned: Boolean(matter.engagement.signedAt) && ["SIGNED", "ACTIVE", "COMPLETED"].includes(matter.engagement.status),
    kybApproved: matter.opportunity.kybCases[0]?.status === "APPROVED",
    readinessStatus: matter.assessments[0]?.status,
    committeeApproved: ["APPROVED_FOR_PARTNER_REVIEW", "APPROVED_WITH_CONDITIONS"].includes(
      matter.committeeReviews[0]?.decision ?? "",
    ),
    licensedPartnerAccepted: matter.partnerMandates.length > 0,
    partnerAndComplianceApprovedOutreach: outreachApproved,
    approvedProposalOrTermSheet: matter.proposals.length > 0,
    closingGatesSatisfied,
  };

  return { matter, context };
}

export async function transitionCapitalMatter(input: {
  matterId: string;
  workspaceId: string;
  nextStatus: CapitalMatterStatus;
  actorId: string;
  reason: string;
  supplementalContext?: CapitalTransitionContext;
}) {
  const derived = await deriveTransitionContext(input.matterId, input.workspaceId);
  if (!derived) return { kind: "not_found" as const };

  const context = { ...input.supplementalContext, ...derived.context };
  const decision = validateCapitalMatterTransition(
    derived.matter.status as CapitalMatterStatus,
    input.nextStatus,
    context,
  );

  if (!decision.allowed) return { kind: "blocked" as const, decision, context };

  const correlationId = randomUUID();
  const updated = await db.$transaction(async (transaction) => {
    const matter = await transaction.capitalMatter.update({
      where: { id: input.matterId },
      data: {
        status: input.nextStatus,
        closedAt: input.nextStatus === "CLOSED" ? new Date() : undefined,
      },
    });

    await transaction.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: "CAPITAL_MATTER_TRANSITIONED",
        entityType: "CapitalMatter",
        entityId: matter.id,
        correlationId,
        outcome: "SUCCESS",
        sourceChannel: "COMMAND_CENTER_API",
        safeMetadata: {
          fromStatus: derived.matter.status,
          toStatus: input.nextStatus,
          reason: input.reason,
        },
      },
    });

    return matter;
  });

  return { kind: "updated" as const, matter: updated, decision, correlationId };
}
