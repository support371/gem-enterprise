import { getEvidenceVaultRuntimeReadiness } from "@/lib/kyc/evidence-vault";

export const EVIDENCE_VAULT_FOUNDATION_ACTIVE = true;
export const SECURE_DOCUMENT_UPLOAD_ACTIVE =
  getEvidenceVaultRuntimeReadiness().uploadRuntimeReady;

export const GEM_VERIFY_CAPABILITIES = {
  manualApplication: true,
  consentReceipt: true,
  reviewerAssignment: true,
  manualDecision: true,
  evidenceVaultFoundation: EVIDENCE_VAULT_FOUNDATION_ACTIVE,
  documentUpload: SECURE_DOCUMENT_UPLOAD_ACTIVE,
  biometricVerification: false,
  automaticApproval: false,
} as const;
