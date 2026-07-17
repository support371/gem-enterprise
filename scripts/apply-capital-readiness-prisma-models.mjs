import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const proposalPath = path.resolve(process.cwd(), "prisma/proposals/CAPITAL_READINESS_MODELS.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Capital Readiness & Transaction Command Center Models ────────────────";

function occurrences(source, search) {
  return source.split(search).length - 1;
}

function requireSingleAnchor(source, search, label) {
  const count = occurrences(source, search);
  if (count !== 1) {
    throw new Error(`Expected exactly one ${label} anchor, found ${count}.`);
  }
}

function validatePromotedSchema(source) {
  const required = [
    marker,
    "enum CapitalActivityClassification {",
    "enum CapitalOpportunityStatus {",
    "model CapitalOpportunity {",
    "model CapitalKybCase {",
    "model CapitalEngagement {",
    "model CapitalMatter {",
    "model CapitalReadinessAssessment {",
    "model CapitalLicensedPartner {",
    "model CapitalTargetUniverse {",
    "model CapitalDataRoom {",
    "model CapitalDiligenceQuestion {",
    "model CapitalProposal {",
    "model CapitalClosing {",
    "model CapitalServiceContract {",
    "model CapitalGovernedAgent {",
    "capitalOpportunities CapitalOpportunity[]",
    "capitalGovernedAgents CapitalGovernedAgent[]",
    '@@map("capital_opportunities")',
    '@@map("capital_matters")',
    '@@map("capital_governed_agent_runs")',
  ];

  for (const value of required) {
    if (!source.includes(value)) {
      throw new Error(`Promoted capital-readiness schema is missing: ${value}`);
    }
  }
}

async function promoteSchema(source) {
  if (source.includes(marker)) {
    validatePromotedSchema(source);
    return { schema: source, changed: false };
  }

  const workspaceAnchor = `  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]

  @@unique([organizationId, slug])`;
  requireSingleAnchor(source, workspaceAnchor, "Workspace relation");

  const workspaceRelations = `  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]
  capitalOpportunities    CapitalOpportunity[]
  capitalKybCases         CapitalKybCase[]
  capitalEngagements      CapitalEngagement[]
  capitalMatters          CapitalMatter[]
  capitalLicensedPartners CapitalLicensedPartner[]
  capitalTargetUniverses  CapitalTargetUniverse[]
  capitalDataRooms        CapitalDataRoom[]
  capitalServiceContracts CapitalServiceContract[]
  capitalRevenueEvents    CapitalRevenueEvent[]
  capitalGovernedAgents   CapitalGovernedAgent[]

  @@unique([organizationId, slug])`;

  const proposal = (await readFile(proposalPath, "utf8")).trim();
  if (!proposal.startsWith("// GEM Enterprise Capital Readiness")) {
    throw new Error("Capital-readiness Prisma proposal header is missing.");
  }

  let schema = source.replace(workspaceAnchor, workspaceRelations);
  schema = `${schema.trimEnd()}\n\n${marker}\n\n${proposal}\n`;
  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = await promoteSchema(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Capital-readiness Prisma promotion anchors are valid and ready."
      : "Capital-readiness Prisma models are present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted capital-readiness models into prisma/schema.prisma.");
} else {
  console.log("Capital-readiness Prisma models already present.");
}
