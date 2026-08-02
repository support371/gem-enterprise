export const ACTIVITY_CLASSIFICATIONS = [
  "GREEN_NON_REGULATED",
  "AMBER_REVIEW_REQUIRED",
  "RED_LICENSED_PARTNER_ONLY",
  "PROHIBITED",
] as const;

export type ActivityClassification = (typeof ACTIVITY_CLASSIFICATIONS)[number];

export const TRANSACTION_ACTOR_ROLES = [
  "CLIENT",
  "GEM_ANALYST",
  "GEM_TRANSACTION_DIRECTOR",
  "GEM_COMPLIANCE_OFFICER",
  "GEM_SUPER_ADMIN",
  "LICENSED_PARTNER",
  "EXTERNAL_COUNSEL",
  "AI_AGENT",
] as const;

export type TransactionActorRole = (typeof TRANSACTION_ACTOR_ROLES)[number];

export const TRANSACTION_ACTIONS = [
  "PREPARE_READINESS_ASSESSMENT",
  "PREPARE_FINANCIAL_MODEL",
  "PREPARE_DATA_ROOM",
  "RESEARCH_COUNTERPARTY",
  "APPROVE_MARKETING_MATERIAL",
  "APPROVE_EXTERNAL_COMMUNICATION",
  "SEND_INVESTOR_OUTREACH",
  "RECOMMEND_SECURITY_TO_INVESTOR",
  "NEGOTIATE_SECURITIES_TERMS",
  "RECEIVE_OR_TRANSMIT_SECURITIES_ORDER",
  "HANDLE_CLIENT_OR_INVESTOR_FUNDS",
  "CREATE_STANDARD_SERVICE_FEE",
  "CREATE_TRANSACTION_BASED_FEE",
  "PUBLISH_GUARANTEED_RETURN_CLAIM",
  "AI_SEND_EXTERNAL_COMMUNICATION",
] as const;

export type TransactionAction = (typeof TRANSACTION_ACTIONS)[number];

export type PolicyBlockCode =
  | "COMPLIANCE_HOLD_ACTIVE"
  | "LEGAL_HOLD_ACTIVE"
  | "PROHIBITED_ACTIVITY"
  | "LICENSED_PARTNER_REQUIRED"
  | "COMPLIANCE_APPROVAL_REQUIRED"
  | "HUMAN_APPROVAL_REQUIRED"
  | "COUNSEL_APPROVAL_REQUIRED"
  | "PARTNER_APPROVAL_REQUIRED"
  | "TRANSACTION_FEE_DISABLED"
  | "ROLE_NOT_AUTHORIZED";

export interface TransactionPolicyInput {
  action: TransactionAction;
  classification: ActivityClassification;
  actorRole: TransactionActorRole;
  complianceHold?: boolean;
  legalHold?: boolean;
  complianceApproved?: boolean;
  humanApproved?: boolean;
  counselApproved?: boolean;
  licensedPartnerApproved?: boolean;
  transactionBasedFeesEnabled?: boolean;
}

export interface TransactionPolicyDecision {
  allowed: boolean;
  classification: ActivityClassification;
  blockCode: PolicyBlockCode | null;
  reason: string;
  requiredApprovals: Array<"COMPLIANCE" | "HUMAN" | "COUNSEL" | "LICENSED_PARTNER">;
}

const GEM_INTERNAL_ROLES = new Set<TransactionActorRole>([
  "GEM_ANALYST",
  "GEM_TRANSACTION_DIRECTOR",
  "GEM_COMPLIANCE_OFFICER",
  "GEM_SUPER_ADMIN",
]);

const PROHIBITED_ACTIONS = new Set<TransactionAction>([
  "HANDLE_CLIENT_OR_INVESTOR_FUNDS",
  "PUBLISH_GUARANTEED_RETURN_CLAIM",
]);

const LICENSED_PARTNER_ACTIONS = new Set<TransactionAction>([
  "SEND_INVESTOR_OUTREACH",
  "RECOMMEND_SECURITY_TO_INVESTOR",
  "NEGOTIATE_SECURITIES_TERMS",
  "RECEIVE_OR_TRANSMIT_SECURITIES_ORDER",
]);

function blocked(
  input: TransactionPolicyInput,
  blockCode: PolicyBlockCode,
  reason: string,
  requiredApprovals: TransactionPolicyDecision["requiredApprovals"] = [],
): TransactionPolicyDecision {
  return {
    allowed: false,
    classification: input.classification,
    blockCode,
    reason,
    requiredApprovals,
  };
}

function allowed(input: TransactionPolicyInput): TransactionPolicyDecision {
  return {
    allowed: true,
    classification: input.classification,
    blockCode: null,
    reason: "Action satisfies the current transaction policy controls.",
    requiredApprovals: [],
  };
}

export function evaluateTransactionAction(input: TransactionPolicyInput): TransactionPolicyDecision {
  if (input.legalHold) {
    return blocked(input, "LEGAL_HOLD_ACTIVE", "The matter is subject to an active legal hold.");
  }

  if (input.complianceHold) {
    return blocked(input, "COMPLIANCE_HOLD_ACTIVE", "The matter is subject to an active compliance hold.");
  }

  if (input.classification === "PROHIBITED" || PROHIBITED_ACTIONS.has(input.action)) {
    return blocked(input, "PROHIBITED_ACTIVITY", "This activity is prohibited in the GEM operating model.");
  }

  if (input.action === "CREATE_TRANSACTION_BASED_FEE") {
    if (!input.transactionBasedFeesEnabled) {
      return blocked(
        input,
        "TRANSACTION_FEE_DISABLED",
        "Transaction-based fees are disabled by default.",
        ["COUNSEL", "LICENSED_PARTNER", "COMPLIANCE"],
      );
    }

    if (!input.counselApproved) {
      return blocked(input, "COUNSEL_APPROVAL_REQUIRED", "Counsel approval is required for this fee structure.", [
        "COUNSEL",
      ]);
    }

    if (!input.licensedPartnerApproved) {
      return blocked(
        input,
        "PARTNER_APPROVAL_REQUIRED",
        "Licensed-partner approval is required for this fee structure.",
        ["LICENSED_PARTNER"],
      );
    }

    if (!input.complianceApproved) {
      return blocked(
        input,
        "COMPLIANCE_APPROVAL_REQUIRED",
        "Compliance approval is required for this fee structure.",
        ["COMPLIANCE"],
      );
    }
  }

  if (input.classification === "RED_LICENSED_PARTNER_ONLY" || LICENSED_PARTNER_ACTIONS.has(input.action)) {
    if (input.actorRole !== "LICENSED_PARTNER") {
      return blocked(
        input,
        "LICENSED_PARTNER_REQUIRED",
        "This action may only be performed by an approved licensed partner.",
        ["LICENSED_PARTNER", "COMPLIANCE"],
      );
    }

    if (!input.licensedPartnerApproved) {
      return blocked(
        input,
        "PARTNER_APPROVAL_REQUIRED",
        "The licensed partner must be approved for this matter and jurisdiction.",
        ["LICENSED_PARTNER"],
      );
    }

    if (!input.complianceApproved) {
      return blocked(
        input,
        "COMPLIANCE_APPROVAL_REQUIRED",
        "Compliance approval is required before regulated execution.",
        ["COMPLIANCE"],
      );
    }

    if (!input.humanApproved) {
      return blocked(input, "HUMAN_APPROVAL_REQUIRED", "A recorded human approval is required.", ["HUMAN"]);
    }
  }

  if (input.classification === "AMBER_REVIEW_REQUIRED") {
    if (!input.complianceApproved) {
      return blocked(
        input,
        "COMPLIANCE_APPROVAL_REQUIRED",
        "Compliance review is required for this activity.",
        ["COMPLIANCE"],
      );
    }

    if (!input.humanApproved) {
      return blocked(input, "HUMAN_APPROVAL_REQUIRED", "A recorded human approval is required.", ["HUMAN"]);
    }
  }

  if (input.action === "AI_SEND_EXTERNAL_COMMUNICATION") {
    if (input.actorRole !== "AI_AGENT") {
      return blocked(input, "ROLE_NOT_AUTHORIZED", "This action is reserved for governed agent runs.");
    }

    if (!input.humanApproved) {
      return blocked(
        input,
        "HUMAN_APPROVAL_REQUIRED",
        "AI-generated external communication requires human approval.",
        ["HUMAN"],
      );
    }

    return allowed(input);
  }

  if (input.classification === "GREEN_NON_REGULATED") {
    const roleAllowed =
      GEM_INTERNAL_ROLES.has(input.actorRole) ||
      input.actorRole === "CLIENT" ||
      input.actorRole === "EXTERNAL_COUNSEL" ||
      input.actorRole === "LICENSED_PARTNER";

    if (!roleAllowed) {
      return blocked(input, "ROLE_NOT_AUTHORIZED", "The actor role is not authorized for this action.");
    }
  }

  return allowed(input);
}
