export const foundingMarketTarget = {
  campaignCode: "founding-first-20",
  batchSize: 20,
  objective:
    "Validate the founding GEM Business Security & Operations Review with a small set of real businesses before scaling acquisition.",
  preferredSegments: [
    "Professional-services firms",
    "Real-estate and property businesses",
    "Logistics and field-service operators",
    "E-commerce and online-service businesses",
    "Growing technology-enabled small businesses",
  ],
  fitSignals: [
    "Uses business email, cloud accounts, or shared online systems",
    "Has staff, contractors, or multiple people who need controlled access",
    "Handles customer, operational, financial, or commercially sensitive information",
    "Has a public website, cloud application, payment flow, or other internet-facing dependency",
    "Has a recognizable security, access, compliance, resilience, or automation concern",
    "A decision-maker can participate in the review and authorize the bounded scope",
  ],
  deferSignals: [
    "Requests unauthorized access, destructive testing, credential handling, or activity outside written scope",
    "Requires regulated or licensed delivery GEM has not confirmed for the jurisdiction",
    "Needs emergency incident response that cannot fit the founding-review scope",
    "Cannot identify an authorized business decision-maker or system owner",
    "Expects unlimited remediation, certification, legal advice, or guaranteed outcomes inside the $199 review",
  ],
  outreachPrinciples: [
    "Contact deliberately selected businesses rather than sending an uncontrolled blast.",
    "Lead with the business problem and the bounded review outcome, not a long catalogue of GEM capabilities.",
    "Use the tracked campaign link so responders enter the governed intake with source attribution.",
    "Do not create intake records on behalf of prospects who have not submitted or consented.",
    "Review response quality after the first batch before increasing volume.",
  ],
} as const;
