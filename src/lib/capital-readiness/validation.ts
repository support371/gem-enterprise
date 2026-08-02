import { z } from "zod";
import { ACTIVITY_CLASSIFICATIONS, TRANSACTION_ACTIONS, TRANSACTION_ACTOR_ROLES } from "@/lib/capital-readiness/policy";
import { CAPITAL_MATTER_STATUSES } from "@/lib/capital-readiness/workflow";

const trimmedText = (min: number, max: number) => z.string().trim().min(min).max(max);

export const createCapitalOpportunitySchema = z.object({
  workspaceId: trimmedText(1, 128),
  legalEntityName: trimmedText(2, 240),
  jurisdiction: trimmedText(2, 120),
  registrationNumber: trimmedText(1, 120).optional(),
  projectType: trimmedText(2, 120),
  targetAmount: z.number().finite().positive().max(1_000_000_000_000).optional(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
  useOfProceeds: trimmedText(10, 5000),
  timingConstraint: trimmedText(1, 500).optional(),
  existingDebt: z.number().finite().min(0).max(1_000_000_000_000).optional(),
  referralSource: trimmedText(1, 240).optional(),
  activityClassification: z.enum(ACTIVITY_CLASSIFICATIONS).default("GREEN_NON_REGULATED"),
  consentVersion: trimmedText(1, 64),
  consentGivenAt: z.coerce.date(),
  privacyVersion: trimmedText(1, 64),
  privacyAcceptedAt: z.coerce.date(),
  primaryContact: z.object({
    name: trimmedText(2, 160),
    email: z.string().trim().email().max(254),
    phone: trimmedText(3, 50).optional(),
    title: trimmedText(1, 160).optional(),
  }),
});

export const capitalPolicyRequestSchema = z.object({
  action: z.enum(TRANSACTION_ACTIONS),
  classification: z.enum(ACTIVITY_CLASSIFICATIONS),
  actorRole: z.enum(TRANSACTION_ACTOR_ROLES),
  complianceHold: z.boolean().optional(),
  legalHold: z.boolean().optional(),
  complianceApproved: z.boolean().optional(),
  humanApproved: z.boolean().optional(),
  counselApproved: z.boolean().optional(),
  licensedPartnerApproved: z.boolean().optional(),
  transactionBasedFeesEnabled: z.boolean().optional(),
});

export const capitalMatterTransitionSchema = z.object({
  workspaceId: trimmedText(1, 128),
  nextStatus: z.enum(CAPITAL_MATTER_STATUSES),
  context: z.object({
    activeComplianceHold: z.boolean().optional(),
    activeLegalHold: z.boolean().optional(),
    engagementSigned: z.boolean().optional(),
    kybApproved: z.boolean().optional(),
    readinessStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "READY", "CONDITIONALLY_READY", "REMEDIATION_REQUIRED", "BLOCKED"]).optional(),
    committeeApproved: z.boolean().optional(),
    licensedPartnerAccepted: z.boolean().optional(),
    partnerAndComplianceApprovedOutreach: z.boolean().optional(),
    approvedProposalOrTermSheet: z.boolean().optional(),
    closingGatesSatisfied: z.boolean().optional(),
  }).default({}),
  reason: trimmedText(5, 2000),
});

export const capitalReadinessCalculationSchema = z.object({
  workstreams: z.array(z.object({
    type: z.enum(["CORPORATE", "FINANCIAL", "COMMERCIAL", "MANAGEMENT", "CYBERSECURITY", "COMPLIANCE", "TRANSACTION", "DATA_ROOM"]),
    score: z.number().finite().min(0).max(100),
    criticalFindings: z.number().int().min(0).max(10000),
    openActions: z.number().int().min(0).max(10000),
  })).max(8),
});
