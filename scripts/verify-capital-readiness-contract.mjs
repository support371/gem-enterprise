import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.resolve(root, file), "utf8");

const [proposal, schemas, commands, lifecycle, closing, commandRoute, promotion] = await Promise.all([
  read("prisma/proposals/CAPITAL_READINESS_MODELS.prisma"),
  read("src/lib/capital-readiness/command-schemas.ts"),
  read("src/lib/capital-readiness/commands.ts"),
  read("src/lib/capital-readiness/lifecycle.ts"),
  read("src/lib/capital-readiness/closing.ts"),
  read("src/app/api/capital-readiness/commands/route.ts"),
  read("scripts/apply-capital-readiness-prisma-models.mjs"),
]);

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredModels = [
  "CapitalOpportunity",
  "CapitalOpportunityContact",
  "CapitalQualificationReview",
  "CapitalKybCase",
  "CapitalBeneficialOwner",
  "CapitalScreeningResultRecord",
  "CapitalConflictCheck",
  "CapitalHold",
  "CapitalEngagement",
  "CapitalEngagementFee",
  "CapitalEngagementMilestone",
  "CapitalMatter",
  "CapitalReadinessAssessment",
  "CapitalReadinessWorkstream",
  "CapitalFinding",
  "CapitalRemediationAction",
  "CapitalCommitteeReview",
  "CapitalCommitteeVote",
  "CapitalLicensedPartner",
  "CapitalPartnerLicense",
  "CapitalPartnerMandate",
  "CapitalTargetUniverse",
  "CapitalTargetEntry",
  "CapitalOutreachEvent",
  "CapitalDataRoom",
  "CapitalDocument",
  "CapitalDocumentVersion",
  "CapitalDataRoomAccess",
  "CapitalDiligenceQuestion",
  "CapitalDiligenceResponse",
  "CapitalProposal",
  "CapitalClosingCondition",
  "CapitalClosing",
  "CapitalServiceContract",
  "CapitalRevenueEvent",
  "CapitalGovernedAgent",
  "CapitalGovernedAgentRun",
];

for (const model of requiredModels) {
  assert(proposal.includes(`model ${model} {`), `Missing Prisma model: ${model}`);
}

const requiredEnums = [
  "CapitalActivityClassification",
  "CapitalOpportunityStatus",
  "CapitalKybStatus",
  "CapitalHoldStatus",
  "CapitalFeeType",
  "CapitalMatterStatus",
  "CapitalAssessmentStatus",
  "CapitalPartnerStatus",
  "CapitalOutreachStatus",
  "CapitalClosingStatus",
  "CapitalAgentRunStatus",
];
for (const value of requiredEnums) {
  assert(proposal.includes(`enum ${value} {`), `Missing Prisma enum: ${value}`);
}

const forbiddenSchemaTerms = [
  "plaintextPassword",
  "passwordHash",
  "accessToken",
  "refreshToken",
  "apiSecret",
  "privateKey",
  "bankPassword",
  "cardNumber",
  "cvv",
  "rawIdentityDocument",
];
for (const term of forbiddenSchemaTerms) {
  assert(!proposal.includes(term), `Forbidden sensitive field found in capital schema: ${term}`);
}

assert(proposal.includes("TRANSACTION_BASED_FEE"), "Restricted fee enum is missing.");
assert(proposal.includes("noGemCustodyConfirmed"), "Closing no-custody evidence field is missing.");
assert(proposal.includes("moneyMovementEnabled       Boolean            @default(false)"), "Governed-agent money movement must default false.");
assert(proposal.includes("custodyEnabled             Boolean            @default(false)"), "Governed-agent custody must default false.");
assert(proposal.includes("criticalComplianceHumanOnly Boolean           @default(true)"), "Critical compliance must default to human-only.");

const commandBlock = schemas.match(/export const CAPITAL_COMMANDS = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
const registeredCommands = [...commandBlock.matchAll(/"([A-Z0-9_]+)"/g)].map((match) => match[1]);
assert(registeredCommands.length >= 34, `Expected at least 34 registered commands, found ${registeredCommands.length}.`);
for (const command of registeredCommands) {
  assert(schemas.includes(`z.literal("${command}")`), `Missing validation schema for command: ${command}`);
  assert(
    commands.includes(`case "${command}"`) || commandRoute.includes(`parsed.data.command === "${command}"`),
    `Missing execution or explicit route guard for command: ${command}`,
  );
}

const lifecycleActions = [
  "QUALIFY_OPPORTUNITY",
  "VERIFY_BENEFICIAL_OWNER",
  "DECIDE_KYB_CASE",
  "DECIDE_PARTNER_MANDATE",
  "UPDATE_OUTREACH_STATUS",
  "UPDATE_DILIGENCE_STATUS",
  "UPDATE_CLOSING_CONDITION",
  "UPDATE_SERVICE_CONTRACT",
  "UPDATE_GOVERNED_AGENT",
  "COMPLETE_CLOSING",
];
for (const action of lifecycleActions) {
  assert(lifecycle.includes(`z.literal("${action}")`), `Missing lifecycle validator: ${action}`);
  assert(lifecycle.includes(`case "${action}"`), `Missing lifecycle handler: ${action}`);
}

assert(
  commandRoute.includes("TRANSACTION_BASED_FEES_NOT_ACTIVATED"),
  "Transaction-based fee command must remain externally activation-gated.",
);
assert(
  commandRoute.includes("DEDICATED_CLOSING_AUTHORIZATION_REQUIRED"),
  "Generic closing authorization must redirect to the dedicated evidence-derived endpoint.",
);
assert(
  !closing.includes('data: { status: "READY_TO_CLOSE", ...'),
  "Dedicated closing authorization must not spread request payloads into Prisma updates.",
);
assert(closing.includes("evaluateCapitalClosingGates"), "Dedicated closing authorization must evaluate server-derived gates.");
assert(closing.includes("verifyCapitalApproval"), "Dedicated closing authorization must verify an immutable approval.");
assert(lifecycle.includes("SEPARATION_OF_DUTIES_REQUIRED"), "Lifecycle must enforce separation of duties.");
assert(lifecycle.includes("CLEAR_SCREENING_REQUIRED"), "KYB approval must require current clear screenings.");
assert(lifecycle.includes("LICENSED_PARTNER_ROLE_REQUIRED"), "Partner lifecycle must enforce partner role boundaries.");

assert(promotion.includes("extractModel(source, \"Workspace\")"), "Schema promotion must locate Workspace structurally.");
assert(!promotion.includes("Expected exactly one Workspace relation anchor"), "Brittle Workspace relation anchor remains in promotion script.");

if (failures.length > 0) {
  console.error("Capital Readiness contract verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Capital Readiness contract verification passed: ${requiredModels.length} models, ${registeredCommands.length} commands, ${lifecycleActions.length} lifecycle actions.`,
);
