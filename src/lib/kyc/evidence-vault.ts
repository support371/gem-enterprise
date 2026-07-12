export const GEM_VERIFY_EVIDENCE_BUCKET = "gem-verify-evidence";
export const GEM_VERIFY_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const GEM_VERIFY_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type GemVerifyAllowedMimeType =
  (typeof GEM_VERIFY_ALLOWED_MIME_TYPES)[number];

export function getEvidenceVaultRuntimeReadiness() {
  const supabaseUrlConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  );
  const serviceRoleConfigured = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
  const scannerMode =
    process.env.GEM_VERIFY_SCANNER_MODE?.trim().toLowerCase() === "external"
      ? "external"
      : "first_party";
  const scannerUrl = process.env.GEM_VERIFY_SCANNER_URL?.trim() ?? "";
  const scannerToken = process.env.GEM_VERIFY_SCANNER_TOKEN?.trim() ?? "";
  const scannerEndpointConfigured = Boolean(
    scannerUrl && scannerToken.length >= 32,
  );
  const scannerCallbackConfigured = Boolean(
    process.env.GEM_VERIFY_SCANNER_CALLBACK_SECRET?.trim(),
  );
  const publicBaseUrlConfigured = Boolean(
    process.env.GEM_VERIFY_PUBLIC_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim(),
  );
  const firstPartyScannerSelected = scannerMode === "first_party";
  const firstPartyScannerUrlExpected =
    "/api/verify/evidence/internal-scanner";
  const firstPartyScannerUrlConfigured =
    firstPartyScannerSelected &&
    scannerEndpointConfigured &&
    (() => {
      try {
        return new URL(scannerUrl).pathname === firstPartyScannerUrlExpected;
      } catch {
        return false;
      }
    })();
  const scannerConfigured =
    scannerEndpointConfigured &&
    scannerCallbackConfigured &&
    publicBaseUrlConfigured &&
    (!firstPartyScannerSelected || firstPartyScannerUrlConfigured);
  const retentionApproved =
    process.env.GEM_VERIFY_RETENTION_APPROVED === "true";
  const operationallyApproved =
    process.env.GEM_VERIFY_EVIDENCE_APPROVED === "true";
  const uploadActivationRequested =
    process.env.GEM_VERIFY_DOCUMENT_UPLOAD_ACTIVE === "true";

  return {
    supabaseUrlConfigured,
    serviceRoleConfigured,
    scannerMode,
    firstPartyScannerSelected,
    firstPartyScannerUrlExpected,
    firstPartyScannerUrlConfigured,
    scannerEndpointConfigured,
    scannerCallbackConfigured,
    publicBaseUrlConfigured,
    scannerConfigured,
    scannerAssurance: "structural_file_safety_only" as const,
    antivirusEquivalent: false as const,
    retentionApproved,
    operationallyApproved,
    uploadActivationRequested,
    uploadRuntimeReady:
      supabaseUrlConfigured &&
      serviceRoleConfigured &&
      scannerConfigured &&
      retentionApproved &&
      operationallyApproved &&
      uploadActivationRequested,
  } as const;
}

export function isAllowedEvidenceMimeType(
  value: string,
): value is GemVerifyAllowedMimeType {
  return GEM_VERIFY_ALLOWED_MIME_TYPES.includes(
    value as GemVerifyAllowedMimeType,
  );
}

export function validateEvidenceUploadMetadata(input: {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}) {
  const errors: string[] = [];
  const fileName = input.fileName.trim();

  if (!fileName || fileName.length > 180) {
    errors.push("Filename must be between 1 and 180 characters.");
  }

  if (!isAllowedEvidenceMimeType(input.mimeType)) {
    errors.push("Unsupported evidence file type.");
  }

  if (
    !Number.isInteger(input.fileSizeBytes) ||
    input.fileSizeBytes <= 0 ||
    input.fileSizeBytes > GEM_VERIFY_MAX_FILE_BYTES
  ) {
    errors.push("Evidence file size must be between 1 byte and 10 MB.");
  }

  return {
    valid: errors.length === 0,
    errors,
  } as const;
}
