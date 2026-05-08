export const KYC_STATUSES = [
  "not_started",
  "started",
  "in_progress",
  "documents_uploaded",
  "under_review",
  "manual_review",
  "approved",
  "rejected",
  "expired",
] as const;

export type KycStatus = (typeof KYC_STATUSES)[number];

export function isKycStatus(value: unknown): value is KycStatus {
  return typeof value === "string" && KYC_STATUSES.includes(value as KycStatus);
}

export function normalizeKycStatus(value: unknown): KycStatus {
  return isKycStatus(value) ? value : "not_started";
}

export function isActionableKycStatus(status: KycStatus) {
  return (
    status === "in_progress" ||
    status === "documents_uploaded" ||
    status === "under_review" ||
    status === "manual_review"
  );
}

export function isCompletedKycStatus(status: KycStatus) {
  return status === "approved" || status === "rejected" || status === "expired";
}
