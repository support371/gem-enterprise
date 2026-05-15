export type IntakeNotificationInput = {
  caseId: string;
  requestId: string;
  name: string;
  email: string;
  phone?: string;
  domain: string;
  serviceType?: string;
  subject: string;
  message: string;
  urgency?: string;
  jurisdiction?: string;
  riskLevel: string;
  assignedQueue: string;
  requiresEscalation: boolean;
};

export function getOwnerEmails() {
  return [process.env.GEM_OWNER_EMAIL, process.env.ADMIN_EMAIL, process.env.INTAKE_ALERT_EMAIL]
    .flatMap((value) => (value ?? "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://gemcybersecurityassist.com";
}

export function formatIntakeOwnerText(input: IntakeNotificationInput) {
  return [
    `New GEM Enterprise access request`,
    `Case: ${input.caseId}`,
    `Request: ${input.requestId}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : `Phone: not provided`,
    `Domain: ${input.domain}`,
    `Service: ${input.serviceType ?? "general"}`,
    `Urgency: ${input.urgency ?? "normal"}`,
    `Risk: ${input.riskLevel}`,
    `Queue: ${input.assignedQueue}`,
    `Jurisdiction: ${input.jurisdiction ?? "unspecified"}`,
    "",
    input.message,
    "",
    `Admin Center: ${getAppUrl()}/app/admin`,
  ].join("\n");
}

export function formatIntakeApplicantText(input: IntakeNotificationInput) {
  return [
    `GEM Enterprise access request received`,
    `Reference: ${input.caseId}`,
    "",
    `Thank you, ${input.name}. Your access request has entered review.",
    "",
    "Next step: GEM reviews your applicant track, jurisdiction, service lane, and qualification context.",
    `Eligibility Status: ${getAppUrl()}/eligibility/status`,
  ].join("\n");
}
