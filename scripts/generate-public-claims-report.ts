import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publicClaims } from "../src/lib/publicClaims";

const outputPath = join(process.cwd(), "docs/PUBLIC_CLAIMS_REVIEW.md");

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function countBy(field: "risk" | "evidenceStatus" | "publicationAction") {
  return publicClaims.reduce<Record<string, number>>((counts, claim) => {
    const value = claim[field];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function renderSummary(title: string, counts: Record<string, number>): string[] {
  return [
    `### ${title}`,
    "",
    "| Value | Count |",
    "|---|---:|",
    ...Object.entries(counts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, count]) => `| ${value} | ${count} |`),
    "",
  ];
}

function renderReport(): string {
  const lines = [
    "# Public Claims Review",
    "",
    "This report is generated from `src/lib/publicClaims.ts`. It contains governance metadata and approved public wording only. Confidential evidence must remain in an access-controlled evidence vault and must not be committed to this repository.",
    "",
    `Total registered claims: **${publicClaims.length}**`,
    "",
    "## Status summary",
    "",
    ...renderSummary("Risk", countBy("risk")),
    ...renderSummary("Evidence status", countBy("evidenceStatus")),
    ...renderSummary("Publication action", countBy("publicationAction")),
    "## Registered claims",
    "",
    "| Claim ID | Route | Risk | Evidence status | Action | Owner | Review by | Approved wording |",
    "|---|---|---|---|---|---|---|---|",
    ...publicClaims.map(
      (claim) =>
        `| ${claim.id} | ${claim.route} | ${claim.risk} | ${claim.evidenceStatus} | ${claim.publicationAction} | ${escapeCell(claim.owner)} | ${claim.reviewBy} | ${escapeCell(claim.approvedWording)} |`,
    ),
    "",
    "## Operating rules",
    "",
    "1. `blocked`, `unverified`, `expired`, or `rejected` claims may not be published as active facts.",
    "2. `conditional` claims must display their approved conditions and must not imply universal availability.",
    "3. `verified` means the registered wording and its repository or private evidence were reviewed; it does not create a permanent certification or guarantee.",
    "4. Confidential evidence, identity records, contracts, credentials, client data, and provider secrets remain outside the public repository.",
    "5. Removing a controlled rewrite requires evidence review, updated registry entries, passing tests, a green preview, and human approval.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

const report = renderReport();
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const existing = readFileSync(outputPath, "utf8");
  if (existing !== report) {
    console.error("PUBLIC_CLAIMS_REVIEW.md is out of date. Run pnpm claims:report.");
    process.exit(1);
  }
  console.log("Public claims report is current.");
} else {
  writeFileSync(outputPath, report, "utf8");
  console.log(`Wrote ${outputPath}`);
}
