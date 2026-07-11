export const SECURE_DOCUMENT_UPLOAD_ACTIVE = false;

export const GEM_VERIFY_CAPABILITIES = {
  manualApplication: true,
  consentReceipt: true,
  reviewerAssignment: true,
  manualDecision: true,
  documentUpload: SECURE_DOCUMENT_UPLOAD_ACTIVE,
  biometricVerification: false,
  automaticApproval: false,
} as const;
