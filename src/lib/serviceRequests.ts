import { db } from "@/lib/db";
import { listAccessibleWorkspaces } from "@/lib/workspaceAccess";

export const serviceRequestTypeCatalog = [
  {
    id: "portfolio_review",
    label: "Portfolio Review",
    description: "Request a review of reporting, allocations, exposure, or protected assets.",
  },
  {
    id: "compliance_review",
    label: "Compliance Review",
    description: "Request clarification about compliance status, disclosures, or next steps without submitting identity-document details.",
  },
  {
    id: "cyber_briefing",
    label: "Cyber Briefing",
    description: "Request a security briefing or an operational review without including passwords, tokens, recovery codes, or private keys.",
  },
  {
    id: "real_estate_trust",
    label: "ATR Property Trust",
    description: "Request property-trust readiness review or advisor consultation.",
  },
  {
    id: "document_request",
    label: "Document Request",
    description: "Request the availability of statements, agreements, or compliance records without entering document numbers or uploading files.",
  },
  {
    id: "support",
    label: "Support",
    description: "Request general client service or operational support. This form is not an emergency channel.",
  },
] as const;

export const serviceRequestTypeIds = serviceRequestTypeCatalog.map((item) => item.id) as [
  (typeof serviceRequestTypeCatalog)[number]["id"],
  ...(typeof serviceRequestTypeCatalog)[number]["id"][],
];

export const serviceRequestPriorityIds = ["low", "medium", "high"] as const;

export type ServiceRequestTypeId = (typeof serviceRequestTypeCatalog)[number]["id"];
export type ServiceRequestPriorityId = (typeof serviceRequestPriorityIds)[number];

export type SensitiveContentCategory =
  | "credential"
  | "private_key"
  | "recovery_material"
  | "payment_card"
  | "banking_identifier"
  | "identity_identifier";

export interface SensitiveContentInspection {
  safe: boolean;
  categories: SensitiveContentCategory[];
}

export class ServiceRequestDomainError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ServiceRequestDomainError";
  }
}

function uniqueCategories(categories: SensitiveContentCategory[]) {
  return [...new Set(categories)];
}

function hasLuhnValidNumber(value: string): boolean {
  const candidates = value.match(/(?:\d[ -]?){13,19}/g) ?? [];
  return candidates.some((candidate) => {
    const digits = candidate.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    let doubleDigit = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  });
}

export function inspectServiceRequestContent(value: string): SensitiveContentInspection {
  const source = value.normalize("NFKC");
  const categories: SensitiveContentCategory[] = [];

  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(source)) {
    categories.push("private_key");
  }

  if (
    /\b(?:password|passcode|pin|otp|one[- ]time password|api key|access token|refresh token|client secret|secret key)\s*(?:is|:|=)\s*\S{4,}/i.test(
      source,
    )
  ) {
    categories.push("credential");
  }

  if (
    /\b(?:seed phrase|mnemonic|recovery phrase|recovery code|backup code|private key)\s*(?:is|:|=)\s*(?:\S+\s+){3,}\S+/i.test(
      source,
    )
  ) {
    categories.push("recovery_material");
  }

  if (hasLuhnValidNumber(source)) {
    categories.push("payment_card");
  }

  if (
    /\b(?:bank account|account number|routing number|sort code|iban|swift|bvn)\s*(?:is|:|=)\s*[A-Z0-9 -]{4,}/i.test(
      source,
    )
  ) {
    categories.push("banking_identifier");
  }

  if (
    /\b(?:ssn|social security number|passport number|driver'?s licen[cs]e number|national id|national identification number|nin)\s*(?:is|:|=)\s*[A-Z0-9 -]{4,}/i.test(
      source,
    )
  ) {
    categories.push("identity_identifier");
  }

  const unique = uniqueCategories(categories);
  return { safe: unique.length === 0, categories: unique };
}

function assertControlledRequestType(value: string): asserts value is ServiceRequestTypeId {
  if (!serviceRequestTypeIds.includes(value as ServiceRequestTypeId)) {
    throw new ServiceRequestDomainError(
      "The selected request type is not available.",
      400,
      "REQUEST_TYPE_NOT_ALLOWED",
    );
  }
}

function assertControlledPriority(value: string): asserts value is ServiceRequestPriorityId {
  if (!serviceRequestPriorityIds.includes(value as ServiceRequestPriorityId)) {
    throw new ServiceRequestDomainError(
      "The selected priority is not available.",
      400,
      "REQUEST_PRIORITY_NOT_ALLOWED",
    );
  }
}

function assertContentSafe(subject: string, description: string) {
  const inspection = inspectServiceRequestContent(`${subject}\n${description}`);
  if (!inspection.safe) {
    throw new ServiceRequestDomainError(
      "Remove passwords, tokens, recovery material, private keys, payment-card numbers, banking identifiers, or identity-document numbers before submitting.",
      400,
      "SENSITIVE_CONTENT_REJECTED",
    );
  }
}

export async function getServiceRequestCenter(userId: string, requestedWorkspaceId?: string | null) {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new ServiceRequestDomainError("Authentication is required.", 401, "AUTH_REQUIRED");
  }

  const accessibleWorkspaces = await listAccessibleWorkspaces(normalizedUserId);
  const normalizedWorkspaceId = requestedWorkspaceId?.trim() || null;
  const selectedWorkspace = normalizedWorkspaceId
    ? accessibleWorkspaces.find((workspace) => workspace.id === normalizedWorkspaceId) ?? null
    : null;

  if (normalizedWorkspaceId && !selectedWorkspace) {
    throw new ServiceRequestDomainError(
      "The selected workspace is not assigned to this account.",
      403,
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  const requests = await db.serviceRequest.findMany({
    where: {
      userId: normalizedUserId,
      workspaceId: selectedWorkspace?.id ?? null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      workspaceId: true,
      type: true,
      subject: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  return {
    scope: selectedWorkspace
      ? {
          kind: "workspace" as const,
          workspaceId: selectedWorkspace.id,
          workspaceName: selectedWorkspace.name,
          organizationName: selectedWorkspace.organization.name,
        }
      : { kind: "personal" as const, workspaceId: null },
    workspaces: accessibleWorkspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      organization: workspace.organization,
      role: workspace.role,
    })),
    requests: requests.map((request) => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    })),
  };
}

export async function createServiceRequest(
  input: {
    userId: string;
    workspaceId?: string | null;
    type: string;
    subject: string;
    description: string;
    priority: string;
    ipAddress: string;
    userAgent: string;
  },
) {
  const userId = input.userId.trim();
  const workspaceId = input.workspaceId?.trim() || null;
  const type = input.type.trim();
  const subject = input.subject.trim();
  const description = input.description.trim();
  const priority = input.priority.trim();

  assertControlledRequestType(type);
  assertControlledPriority(priority);
  assertContentSafe(subject, description);

  let selectedWorkspace:
    | Awaited<ReturnType<typeof listAccessibleWorkspaces>>[number]
    | null = null;

  if (workspaceId) {
    const accessibleWorkspaces = await listAccessibleWorkspaces(userId);
    selectedWorkspace =
      accessibleWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    if (!selectedWorkspace) {
      throw new ServiceRequestDomainError(
        "The selected workspace is not assigned to this account.",
        403,
        "WORKSPACE_ACCESS_DENIED",
      );
    }
  }

  const request = await db.$transaction(async (tx) => {
    const created = await tx.serviceRequest.create({
      data: {
        userId,
        workspaceId: selectedWorkspace?.id ?? null,
        type,
        subject,
        description,
        priority,
        status: "open",
      },
      select: {
        id: true,
        userId: true,
        workspaceId: true,
        type: true,
        subject: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "case_created",
        resource: "service_request",
        resourceId: created.id,
        metadata: {
          type,
          subject,
          priority,
          scope: selectedWorkspace ? "workspace" : "personal",
          workspaceId: selectedWorkspace?.id ?? null,
          workspaceName: selectedWorkspace?.name ?? null,
          organizationId: selectedWorkspace?.organization.id ?? null,
          organizationName: selectedWorkspace?.organization.name ?? null,
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    return created;
  });

  return {
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}
