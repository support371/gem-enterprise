export const AUDIT_ACTIONS = [
  "login",
  "logout",
  "failed_login",
  "password_change",
  "role_change",
  "kyc_submit",
  "kyc_approve",
  "kyc_reject",
  "kyc_flag",
  "document_upload",
  "ai_session_opened",
  "ai_message_sent",
  "restricted_class_detected",
  "evidence_created",
  "case_created",
  "case_closed",
  "data_export",
  "admin_action",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === "string" && AUDIT_ACTIONS.includes(value as AuditAction);
}

export function formatAuditAction(value: unknown) {
  if (!isAuditAction(value)) return "Unknown Action";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function auditSeverity(action: unknown) {
  if (!isAuditAction(action)) return "neutral";

  if (
    action === "failed_login" ||
    action === "kyc_reject" ||
    action === "kyc_flag" ||
    action === "restricted_class_detected"
  ) {
    return "high";
  }

  if (
    action === "role_change" ||
    action === "password_change" ||
    action === "data_export" ||
    action === "admin_action"
  ) {
    return "medium";
  }

  return "low";
}
