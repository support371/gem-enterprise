import { createHash } from "node:crypto";
import { Prisma, type EntityType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  assertNoExistingDecision,
  assertTransition,
  canPerformReviewAction,
  canWorkOnAssignedCase,
  isAdminReviewRole,
  reviewActionRequiresNotes,
  targetStateForReviewAction,
  toDatabaseKycStatus,
  toVerificationState,
  VerificationWorkflowError,
  type VerificationReviewAction,
  type VerificationState,
} from "@/lib/kyc/workflow";
import {
  VERIFY_CONSENT_TEXT,
  VERIFY_POLICY_VERSION,
} from "@/lib/kyc/policy";

export interface VerificationDraftInput {
  entityType: EntityType;
  legalName: string;
  country: string;
  phone?: string;
  organizationName?: string;
  serviceInterest: string;
}

export class VerificationServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "VerificationServiceError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function workflowError(error: unknown): never {
  if (error instanceof VerificationWorkflowError) {
    throw new VerificationServiceError(
      error.code,
      error.message,
      error.statusCode,
    );
  }
  throw error;
}

function consentFromFormData(formData: unknown) {
  const consent = asRecord(asRecord(formData)._verificationConsent);
  const policyVersion = asOptionalString(consent.policyVersion);
  const acceptedAt = asOptionalString(consent.acceptedAt);
  const disclosureHash = asOptionalString(consent.disclosureHash);

  if (!policyVersion || !acceptedAt || !disclosureHash) return null;
  return { policyVersion, acceptedAt, disclosureHash };
}

function safeApplicantData(formData: unknown) {
  const data = asRecord(formData);
  return {
    legalName: asOptionalString(data.legalName) ?? "",
    country: asOptionalString(data.country) ?? "",
    phone: asOptionalString(data.phone) ?? null,
    organizationName: asOptionalString(data.organizationName) ?? null,
    serviceInterest: asOptionalString(data.serviceInterest) ?? "",
  };
}

type ViewableApplication = {
  id: string;
  userId: string;
  status: string;
  entityType: string;
  formData: unknown;
  submittedAt: Date | string | null;
  completedAt: Date | string | null;
  reviewedAt: Date | string | null;
  reviewerId: string | null;
  rejectionReason: string | null;
  reviewNotes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  decision?: {
    decision: string;
    decisionBy: string;
    decisionAt: Date | string;
    reason: string | null;
  } | null;
  reviews?: Array<{
    id: string;
    reviewerId: string;
    action: string;
    notes: string | null;
    createdAt: Date | string;
  }>;
  user?: {
    id: string;
    email: string;
    profile: {
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      country: string | null;
      phone: string | null;
      entityType: string | null;
    } | null;
  };
};

export function toVerificationApplicationView(
  application: ViewableApplication,
  options: { includeInternal?: boolean } = {},
) {
  const includeInternal = options.includeInternal === true;
  const reviews = application.reviews ?? [];

  return {
    id: application.id,
    reference: application.id.slice(0, 12).toUpperCase(),
    userId: application.userId,
    databaseStatus: application.status,
    workflowState: toVerificationState(application.status),
    entityType: application.entityType,
    applicantData: safeApplicantData(application.formData),
    consent: consentFromFormData(application.formData),
    submittedAt: iso(application.submittedAt),
    completedAt: iso(application.completedAt),
    reviewedAt: iso(application.reviewedAt),
    reviewerId: includeInternal ? application.reviewerId : undefined,
    rejectionReason: application.rejectionReason,
    reviewNotes: application.reviewNotes,
    createdAt: iso(application.createdAt),
    updatedAt: iso(application.updatedAt),
    decision: application.decision
      ? {
          outcome: application.decision.decision,
          decidedAt: iso(application.decision.decisionAt),
          reason: application.decision.reason,
          ...(includeInternal
            ? { decidedBy: application.decision.decisionBy }
            : {}),
        }
      : null,
    history: reviews.map((review) => ({
      id: review.id,
      action: review.action,
      createdAt: iso(review.createdAt),
      ...(includeInternal
        ? { reviewerId: review.reviewerId, notes: review.notes }
        : {}),
    })),
    user: application.user
      ? {
          id: application.user.id,
          email: application.user.email,
          profile: application.user.profile,
        }
      : undefined,
    documentUploadEnabled: false,
  };
}

const applicantInclude = {
  decision: true,
  reviews: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.KYCApplicationInclude;

const reviewInclude = {
  user: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          displayName: true,
          firstName: true,
          lastName: true,
          country: true,
          phone: true,
          entityType: true,
        },
      },
    },
  },
  decision: true,
  reviews: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.KYCApplicationInclude;

export async function getLatestVerificationApplication(userId: string) {
  return db.kYCApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: applicantInclude,
  });
}

function normalizedApplicantData(input: VerificationDraftInput) {
  return {
    legalName: input.legalName.trim(),
    country: input.country.trim(),
    phone: input.phone?.trim() || undefined,
    organizationName: input.organizationName?.trim() || undefined,
    serviceInterest: input.serviceInterest.trim(),
  };
}

export async function saveVerificationApplication(
  userId: string,
  input: VerificationDraftInput,
) {
  const existing = await db.kYCApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: applicantInclude,
  });
  const applicantData = normalizedApplicantData(input);

  if (existing) {
    const state = toVerificationState(existing.status);
    if (["draft", "consented", "needs_information"].includes(state)) {
      const existingFormData = asRecord(existing.formData);
      const merged = {
        ...existingFormData,
        ...applicantData,
      } as Prisma.InputJsonValue;

      const updated = await db.$transaction(async (tx) => {
        const application = await tx.kYCApplication.update({
          where: { id: existing.id },
          data: {
            entityType: input.entityType,
            data: merged,
            formData: merged,
          },
          include: applicantInclude,
        });

        await tx.kYCReview.create({
          data: {
            applicationId: existing.id,
            reviewerId: userId,
            action: "applicant_information_updated",
          },
        });

        await tx.profile.upsert({
          where: { userId },
          update: {
            displayName: applicantData.legalName,
            country: applicantData.country,
            phone: applicantData.phone,
            entityType: input.entityType,
          },
          create: {
            userId,
            displayName: applicantData.legalName,
            country: applicantData.country,
            phone: applicantData.phone,
            entityType: input.entityType,
          },
        });

        return application;
      });

      return { application: updated, created: false };
    }

    if (state !== "closed") {
      throw new VerificationServiceError(
        "ACTIVE_VERIFICATION_APPLICATION_EXISTS",
        "An active verification application already exists.",
        409,
        { applicationId: existing.id, workflowState: state },
      );
    }
  }

  const payload = applicantData as Prisma.InputJsonValue;
  const application = await db.$transaction(async (tx) => {
    const created = await tx.kYCApplication.create({
      data: {
        userId,
        status: "not_started",
        entityType: input.entityType,
        data: payload,
        formData: payload,
      },
      include: applicantInclude,
    });

    await tx.kYCReview.create({
      data: {
        applicationId: created.id,
        reviewerId: userId,
        action: "application_created",
      },
    });

    await tx.profile.upsert({
      where: { userId },
      update: {
        displayName: applicantData.legalName,
        country: applicantData.country,
        phone: applicantData.phone,
        entityType: input.entityType,
      },
      create: {
        userId,
        displayName: applicantData.legalName,
        country: applicantData.country,
        phone: applicantData.phone,
        entityType: input.entityType,
      },
    });

    return created;
  });

  return { application, created: true };
}

export async function recordVerificationConsent(
  userId: string,
  applicationId: string,
) {
  const application = await db.kYCApplication.findFirst({
    where: { id: applicationId, userId },
    include: applicantInclude,
  });
  if (!application) {
    throw new VerificationServiceError(
      "VERIFICATION_APPLICATION_NOT_FOUND",
      "Verification application not found.",
      404,
    );
  }

  const existingConsent = consentFromFormData(application.formData);
  if (existingConsent) {
    return { application, alreadyRecorded: true };
  }

  const currentState = toVerificationState(application.status);
  try {
    assertTransition(currentState, "consented");
  } catch (error) {
    workflowError(error);
  }

  const acceptedAt = new Date().toISOString();
  const disclosureHash = createHash("sha256")
    .update(VERIFY_CONSENT_TEXT)
    .digest("hex");
  const formData = {
    ...asRecord(application.formData),
    _verificationConsent: {
      policyVersion: VERIFY_POLICY_VERSION,
      acceptedAt,
      disclosureHash,
    },
  } as Prisma.InputJsonValue;

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.kYCApplication.update({
      where: { id: application.id },
      data: {
        status: "started",
        data: formData,
        formData,
      },
      include: applicantInclude,
    });

    await tx.kYCReview.create({
      data: {
        applicationId: application.id,
        reviewerId: userId,
        action: "consent_recorded",
        notes: JSON.stringify({ policyVersion: VERIFY_POLICY_VERSION, disclosureHash }),
      },
    });

    return result;
  });

  return { application: updated, alreadyRecorded: false };
}

export async function submitVerificationApplication(
  userId: string,
  applicationId?: string,
) {
  const application = applicationId
    ? await db.kYCApplication.findFirst({
        where: { id: applicationId, userId },
        include: applicantInclude,
      })
    : await getLatestVerificationApplication(userId);

  if (!application) {
    throw new VerificationServiceError(
      "VERIFICATION_APPLICATION_NOT_FOUND",
      "Start a verification application before submitting.",
      404,
    );
  }

  const currentState = toVerificationState(application.status);
  if (["submitted", "under_review"].includes(currentState)) {
    return { application, alreadySubmitted: true };
  }

  if (!consentFromFormData(application.formData)) {
    throw new VerificationServiceError(
      "VERIFICATION_CONSENT_REQUIRED",
      "Consent must be recorded before submission.",
      409,
    );
  }

  try {
    assertTransition(currentState, "submitted");
  } catch (error) {
    workflowError(error);
  }

  const action =
    currentState === "needs_information"
      ? "information_resubmitted"
      : "application_submitted";

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.kYCApplication.update({
      where: { id: application.id },
      data: {
        status: "in_progress",
        submittedAt: new Date(),
        reviewNotes: null,
      },
      include: applicantInclude,
    });

    await tx.kYCReview.create({
      data: {
        applicationId: application.id,
        reviewerId: userId,
        action,
      },
    });

    return result;
  });

  return { application: updated, alreadySubmitted: false };
}

const queueStatuses = [
  "in_progress",
  "under_review",
  "manual_review",
  "approved",
  "rejected",
  "expired",
] as const;

export async function listVerificationReviewQueue(
  actorId: string,
  role: string,
) {
  const where: Prisma.KYCApplicationWhereInput = {
    status: { in: [...queueStatuses] },
  };

  if (!isAdminReviewRole(role)) {
    where.OR = [{ reviewerId: null }, { reviewerId: actorId }];
  }

  return db.kYCApplication.findMany({
    where,
    include: reviewInclude,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

const reviewEventName: Record<VerificationReviewAction, string> = {
  assign: "reviewer_assigned",
  start_review: "review_started",
  request_information: "information_requested",
  approve: "application_approved",
  reject: "application_rejected",
  close: "application_closed",
};

export async function performVerificationReviewAction(input: {
  actorId: string;
  role: string;
  applicationId: string;
  action: VerificationReviewAction;
  notes?: string;
}) {
  if (!canPerformReviewAction(input.role, input.action)) {
    throw new VerificationServiceError(
      "VERIFICATION_REVIEW_FORBIDDEN",
      "Your role is not authorized to perform this review action.",
      403,
    );
  }

  const notes = input.notes?.trim() || undefined;
  if (reviewActionRequiresNotes(input.action) && !notes) {
    throw new VerificationServiceError(
      "VERIFICATION_REVIEW_NOTES_REQUIRED",
      "Review notes are required for this action.",
      400,
    );
  }

  const application = await db.kYCApplication.findUnique({
    where: { id: input.applicationId },
    include: reviewInclude,
  });
  if (!application) {
    throw new VerificationServiceError(
      "VERIFICATION_APPLICATION_NOT_FOUND",
      "Verification application not found.",
      404,
    );
  }

  const currentState = toVerificationState(application.status);
  if (
    !canWorkOnAssignedCase(
      input.role,
      input.actorId,
      application.reviewerId,
    )
  ) {
    throw new VerificationServiceError(
      "VERIFICATION_ASSIGNED_TO_ANOTHER_REVIEWER",
      "This application is assigned to another reviewer.",
      403,
    );
  }

  if (input.action === "assign") {
    if (!["submitted", "under_review"].includes(currentState)) {
      throw new VerificationServiceError(
        "VERIFICATION_NOT_ASSIGNABLE",
        "Only submitted or active-review applications can be assigned.",
        409,
      );
    }

    await db.$transaction(async (tx) => {
      await tx.kYCApplication.update({
        where: { id: application.id },
        data: { reviewerId: input.actorId },
      });
      await tx.kYCReview.create({
        data: {
          applicationId: application.id,
          reviewerId: input.actorId,
          action: reviewEventName.assign,
        },
      });
    });

    return db.kYCApplication.findUniqueOrThrow({
      where: { id: application.id },
      include: reviewInclude,
    });
  }

  const targetState = targetStateForReviewAction(input.action);
  try {
    assertTransition(currentState, targetState);
    if (["approve", "reject"].includes(input.action)) {
      assertNoExistingDecision(Boolean(application.decision));
    }
  } catch (error) {
    workflowError(error);
  }

  const now = new Date();
  const updateData: Prisma.KYCApplicationUncheckedUpdateInput = {
    status: toDatabaseKycStatus(targetState),
    reviewerId: input.actorId,
    reviewedAt: now,
  };

  if (input.action === "start_review") {
    updateData.reviewNotes = null;
  }
  if (input.action === "request_information") {
    updateData.reviewNotes = notes;
    updateData.completedAt = null;
  }
  if (input.action === "approve") {
    updateData.reviewNotes = null;
    updateData.rejectionReason = null;
    updateData.completedAt = now;
  }
  if (input.action === "reject") {
    updateData.reviewNotes = notes;
    updateData.rejectionReason = notes;
    updateData.completedAt = now;
  }
  if (input.action === "close") {
    updateData.reviewNotes = notes;
    updateData.completedAt = now;
  }

  try {
    await db.$transaction(async (tx) => {
      if (input.action === "approve" || input.action === "reject") {
        await tx.decision.create({
          data: {
            applicationId: application.id,
            decision: targetState,
            decisionBy: input.actorId,
            reason: notes ?? null,
          },
        });
      }

      await tx.kYCApplication.update({
        where: { id: application.id },
        data: updateData,
      });

      await tx.kYCReview.create({
        data: {
          applicationId: application.id,
          reviewerId: input.actorId,
          action: reviewEventName[input.action],
          notes: notes ?? null,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new VerificationServiceError(
        "DUPLICATE_VERIFICATION_DECISION",
        "A final decision has already been recorded for this application.",
        409,
      );
    }
    throw error;
  }

  return db.kYCApplication.findUniqueOrThrow({
    where: { id: application.id },
    include: reviewInclude,
  });
}
