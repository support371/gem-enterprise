import { GEM_VERIFY_CAPABILITIES } from "@/lib/kyc/capabilities";
import { VERIFY_POLICY_VERSION } from "@/lib/kyc/policy";

export type GemVerifyControlStatus =
  | "operational"
  | "controlled_pilot"
  | "blocked"
  | "planned";

export interface GemVerifyAssuranceLevel {
  id: "GEM-A1" | "GEM-A2" | "GEM-A3" | "GEM-A4";
  name: string;
  purpose: string;
  status: GemVerifyControlStatus;
  requiredEvidence: readonly string[];
  requiredControls: readonly string[];
  limitations: readonly string[];
}

export const GEM_VERIFY_SYSTEM = {
  name: "GEM Verify",
  owner: "GEM Cybersecurity & Monitoring Assist",
  model: "first_party_manual_assurance",
  policyVersion: VERIFY_POLICY_VERSION,
  externalIdentityProviderRequired: false,
  automaticApprovalAllowed: false,
  biometricDecisioningAllowed: false,
  capabilities: GEM_VERIFY_CAPABILITIES,
  principles: [
    "Collect the minimum information needed for the stated verification purpose.",
    "Keep identity proofing, eligibility review, and service activation as separate decisions.",
    "Require an authenticated human reviewer for every substantive assessment.",
    "Require a different authorized decision maker for final approval or rejection.",
    "Record append-only evidence of assignments, reviews, information requests, and decisions.",
    "Fail closed when secure storage, reviewer coverage, consent, or required evidence is unavailable.",
    "Never store passwords, security codes, raw access tokens, or banking credentials as verification evidence.",
  ] as const,
} as const;

export const GEM_VERIFY_ASSURANCE_LEVELS: readonly GemVerifyAssuranceLevel[] = [
  {
    id: "GEM-A1",
    name: "Account and consent assurance",
    purpose:
      "Confirm an active account, verified email, declared identity details, service purpose, and recorded consent.",
    status: "operational",
    requiredEvidence: [
      "Active GEM account",
      "Verified email address",
      "Applicant declaration",
      "Recorded consent receipt",
      "Country and entity type",
    ],
    requiredControls: [
      "Authenticated submission",
      "Rate limiting",
      "Audit event",
      "Minimum-data policy",
    ],
    limitations: [
      "Does not prove possession of a government-issued identity document.",
      "Does not authorize regulated or high-risk services by itself.",
    ],
  },
  {
    id: "GEM-A2",
    name: "Controlled manual identity review",
    purpose:
      "Assess identity evidence through GEM-owned intake, assignment, human review, information requests, and a separate final decision.",
    status: GEM_VERIFY_CAPABILITIES.documentUpload
      ? "controlled_pilot"
      : "blocked",
    requiredEvidence: [
      "GEM-A1 evidence",
      "Approved identity-document type",
      "Document metadata and integrity checksum",
      "Reviewer findings",
      "Final decision record",
    ],
    requiredControls: [
      "Private encrypted object storage",
      "Malware scanning",
      "File-type and size validation",
      "Reviewer assignment",
      "Separation of review and decision roles",
      "Retention and deletion schedule",
    ],
    limitations: [
      "Document intake remains disabled until secure storage and scanning are verified.",
      "No automated document-authenticity or biometric claim is made.",
    ],
  },
  {
    id: "GEM-A3",
    name: "Enhanced two-person assurance",
    purpose:
      "Apply additional evidence and independent review for higher-risk customers, organizations, or services.",
    status: "planned",
    requiredEvidence: [
      "GEM-A2 evidence",
      "Address or organization evidence",
      "Source and purpose explanation",
      "Independent second-person review",
      "Documented risk indicators",
    ],
    requiredControls: [
      "Two-person approval",
      "Conflict-of-interest declaration",
      "Enhanced audit record",
      "Time-bounded revalidation",
      "Escalation path",
    ],
    limitations: [
      "Must not be represented as external certification.",
      "Sanctions, registry, or document-database checks require separately approved data sources when introduced.",
    ],
  },
  {
    id: "GEM-A4",
    name: "High-assurance operator verification",
    purpose:
      "Use a scheduled live operator session, strong account security, and independent approval for the highest-risk internal workflows.",
    status: "planned",
    requiredEvidence: [
      "GEM-A3 evidence",
      "Scheduled live operator session",
      "Session attendance evidence",
      "Step-up authentication",
      "Independent final authorization",
    ],
    requiredControls: [
      "No automated biometric decision",
      "Session privacy notice",
      "Restricted recording policy",
      "Dual control",
      "Periodic re-verification",
    ],
    limitations: [
      "Not a biometric liveness service.",
      "Not equivalent to a certified external identity-proofing provider without independent testing and assurance review.",
    ],
  },
] as const;

export const GEM_VERIFY_MODULES = [
  {
    id: "application",
    name: "Applicant intake and consent",
    status: "operational" as const,
    route: "/app/kyc/start",
    description: "Minimum-data application, declared purpose, and consent receipt.",
  },
  {
    id: "status",
    name: "Applicant status and information requests",
    status: "operational" as const,
    route: "/app/kyc/status",
    description: "Applicant-facing workflow status and controlled follow-up.",
  },
  {
    id: "review",
    name: "Manual review queue",
    status: "operational" as const,
    route: "/review/verification",
    description: "Assignment, review notes, information requests, and role-limited actions.",
  },
  {
    id: "governance",
    name: "Reviewer designation and readiness",
    status: "operational" as const,
    route: "/app/admin/verification-pilot",
    description: "Reviewer coverage, role governance, workflow checks, and pilot readiness.",
  },
  {
    id: "documents",
    name: "Secure evidence vault",
    status: GEM_VERIFY_CAPABILITIES.documentUpload
      ? ("controlled_pilot" as const)
      : ("blocked" as const),
    route: "/app/admin/gem-verify/evidence",
    description:
      "Private evidence metadata, quarantine readiness, access logging, validation records, retention controls, and upload safeguards.",
  },
  {
    id: "biometrics",
    name: "Biometric and automated decisioning",
    status: "blocked" as const,
    route: null,
    description:
      "Intentionally disabled. GEM Verify does not claim biometric liveness or automatic identity approval.",
  },
] as const;
