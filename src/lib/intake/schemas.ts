import { z } from "zod";

const sensitiveTerms = [
  /\bsocial security\b/i,
  /\bssn\b/i,
  /\bpassport(?: number)?\b/i,
  /\bdriver'?s? licen[cs]e(?: number)?\b/i,
  /\bbank account\b/i,
  /\bcredit card\b/i,
  /\bdebit card\b/i,
  /\bprivate key\b/i,
  /\bseed phrase\b/i,
  /\bpassword\b/i,
  /\brecovery code\b/i,
];

export function containsRestrictedIntakeContent(value: string): boolean {
  return sensitiveTerms.some((pattern) => pattern.test(value));
}

const commonFields = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(64).optional(),
  organization: z.string().trim().max(160).optional(),
  title: z.string().trim().max(120).optional(),
  jurisdiction: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(40).max(5_000),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Privacy acceptance is required" }),
  }),
  honeypot: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
};

function rejectSensitiveContent<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((value, context) => {
    const text = [value.subject, value.message]
      .filter((item): item is string => typeof item === "string")
      .join("\n");

    if (containsRestrictedIntakeContent(text)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message:
          "Do not submit passwords, identity-document numbers, financial-account details, private keys, or recovery codes through this form.",
      });
    }
  });
}

export const enterpriseApplicationSchema = rejectSensitiveContent(
  z.object({
    ...commonFields,
    organization: z.string().trim().min(2).max(160),
    title: z.string().trim().min(2).max(120),
    organizationType: z.enum([
      "company",
      "nonprofit",
      "government",
      "family_office",
      "professional_services",
      "other",
    ]),
    employeeRange: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
    serviceAreas: z
      .array(z.enum(["cybersecurity", "compliance", "financial_risk", "real_estate", "advisory"]))
      .min(1)
      .max(5),
  }),
);

export const communityApplicationSchema = rejectSensitiveContent(
  z.object({
    ...commonFields,
    title: z.string().trim().min(2).max(120),
    entityType: z.enum([
      "operator",
      "investor",
      "advisor",
      "family_office",
      "institution",
      "other",
    ]),
    interests: z
      .array(
        z.enum([
          "capital_deployment",
          "operator_introductions",
          "real_estate",
          "security_compliance",
          "legal_regulatory",
          "family_office_coordination",
          "deal_flow",
        ]),
      )
      .min(1)
      .max(7),
    referral: z.string().trim().max(200).optional(),
  }),
);

export const productRequestSchema = rejectSensitiveContent(
  z.object({
    ...commonFields,
    productSlug: z.string().trim().min(1).max(160),
    productName: z.string().trim().min(1).max(200),
    productSku: z.string().trim().max(80).optional(),
    productCategory: z.string().trim().max(100).optional(),
    quantity: z.number().int().min(1).max(100).default(1),
    intendedUse: z.string().trim().min(20).max(2_000),
    budgetRange: z
      .enum(["under_1000", "1000_5000", "5000_25000", "25000_plus", "not_sure"])
      .optional(),
  }),
);

export type EnterpriseApplicationInput = z.infer<typeof enterpriseApplicationSchema>;
export type CommunityApplicationInput = z.infer<typeof communityApplicationSchema>;
export type ProductRequestInput = z.infer<typeof productRequestSchema>;
