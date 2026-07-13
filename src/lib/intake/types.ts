export const intakeKinds = ["ENTERPRISE", "COMMUNITY", "PRODUCT_REQUEST"] as const;
export type IntakeKind = (typeof intakeKinds)[number];

export const intakeStatuses = [
  "RECEIVED",
  "TRIAGE",
  "NEEDS_INFORMATION",
  "QUALIFIED",
  "APPROVED",
  "DECLINED",
  "CONVERTED",
  "CLOSED",
] as const;
export type IntakeStatus = (typeof intakeStatuses)[number];

export type IntakeQueue = "intake:enterprise" | "intake:community" | "intake:product";

export interface IntakeProductContext {
  slug: string;
  name: string;
  sku?: string;
  category?: string;
}

export interface CreateIntakeSubmissionInput {
  kind: IntakeKind;
  queue: IntakeQueue;
  userId?: string | null;
  product?: IntakeProductContext | null;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  title?: string | null;
  jurisdiction?: string | null;
  subject: string;
  message: string;
  payload: Record<string, unknown>;
  consentVersion: string;
  privacyVersion: string;
  source: "web";
  ipHash?: string | null;
  userAgentHash?: string | null;
}

export interface IntakeSubmissionRecord {
  id: string;
  publicId: string;
  kind: IntakeKind;
  status: IntakeStatus;
  queue: string;
  userId: string | null;
  assignedToId: string | null;
  productSlug: string | null;
  productName: string | null;
  productSku: string | null;
  productCategory: string | null;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  title: string | null;
  jurisdiction: string | null;
  subject: string;
  message: string;
  payload: Record<string, unknown>;
  consentVersion: string;
  consentGivenAt: Date;
  privacyVersion: string;
  privacyAcceptedAt: Date;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntakeStatusEventRecord {
  id: string;
  submissionId: string;
  fromStatus: IntakeStatus | null;
  toStatus: IntakeStatus;
  actorId: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export function queueForKind(kind: IntakeKind): IntakeQueue {
  if (kind === "ENTERPRISE") return "intake:enterprise";
  if (kind === "COMMUNITY") return "intake:community";
  return "intake:product";
}
