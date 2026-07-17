import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const proposalPath = path.resolve(process.cwd(), "prisma/proposals/CAPITAL_READINESS_MODELS.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Capital Readiness & Transaction Command Center Models ────────────────";

const workspaceRelationLines = [
  "  capitalOpportunities    CapitalOpportunity[]",
  "  capitalKybCases         CapitalKybCase[]",
  "  capitalEngagements      CapitalEngagement[]",
  "  capitalMatters          CapitalMatter[]",
  "  capitalLicensedPartners CapitalLicensedPartner[]",
  "  capitalTargetUniverses  CapitalTargetUniverse[]",
  "  capitalDataRooms        CapitalDataRoom[]",
  "  capitalServiceContracts CapitalServiceContract[]",
  "  capitalRevenueEvents    CapitalRevenueEvent[]",
  "  capitalGovernedAgents   CapitalGovernedAgent[]",
];

function extractModel(source, modelName) {
  const startToken = `model ${modelName} {`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`${modelName} model was not found.`);
  const end = source.indexOf("\n}\n", start);
  if (end < 0) throw new Error(`${modelName} model closing boundary was not found.`);
  return { start, end: end + 2, block: source.slice(start, end + 2) };
}

function promoteWorkspaceRelations(source) {
  const workspace = extractModel(source, "Workspace");
  const uniqueAnchor = "  @@unique([organizationId, slug])";
  if (!workspace.block.includes(uniqueAnchor)) {
    throw new Error("Workspace unique anchor was not found inside the Workspace model.");
  }

  const missing = workspaceRelationLines.filter((line) => !workspace.block.includes(line));
  if (missing.length === 0) return source;

  const updatedBlock = workspace.block.replace(uniqueAnchor, `${missing.join("\n")}\n\n${uniqueAnchor}`);
  return `${source.slice(0, workspace.start)}${updatedBlock}${source.slice(workspace.end)}`;
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
    ...workspaceRelationLines.map((line) => line.trim()),
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
    const withRelations = promoteWorkspaceRelations(source);
    validatePromotedSchema(withRelations);
    return { schema: withRelations, changed: withRelations !== source };
  }

  const proposal = (await readFile(proposalPath, "utf8")).trim();
  if (!proposal.startsWith("// GEM Enterprise Capital Readiness")) {
    throw new Error("Capital-readiness Prisma proposal header is missing.");
  }

  let schema = promoteWorkspaceRelations(source);
  schema = `${schema.trimEnd()}\n\n${marker}\n\n${proposal}\n`;
  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = await promoteSchema(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Capital-readiness Prisma promotion is composable and ready."
      : "Capital-readiness Prisma models are present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted capital-readiness models into prisma/schema.prisma.");
} else {
  console.log("Capital-readiness Prisma models already present.");
}
