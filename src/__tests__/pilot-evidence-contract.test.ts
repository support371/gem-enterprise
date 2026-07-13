import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("GEM Verify pilot evidence contract", () => {
  it("keeps the evidence endpoint admin-only and read-only", () => {
    const route = source("src/app/api/verify/pilot-evidence/route.ts");

    expect(route).toContain("requireAdmin()");
    expect(route).toContain("export async function GET");
    expect(route).not.toContain("export async function POST");
    expect(route).not.toMatch(/db\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)\(/);
    expect(route).toContain('mutatesProductionData: false');
  });

  it("uses the token-free, timeout-protected gateway v4", () => {
    const route = source("src/app/api/verify/pilot-evidence/route.ts");
    const gateway = source("src/lib/kyc/pilot-evidence-gateway.ts");

    expect(route).toContain("readPilotEvidenceGateway");
    expect(route).toContain("getGatewaySessionToken");
    expect(gateway).toContain("gem-pilot-evidence-read-v4");
    expect(gateway).toContain("AbortController");
    expect(gateway).toContain('method: "POST"');
    expect(gateway).not.toContain("apikey");
    expect(gateway).not.toContain("Bearer");
    expect(gateway).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    expect(gateway).not.toMatch(/\.(create|update|delete|upsert)\(/);
  });

  it("requires the complete controlled audit chain", () => {
    const evaluator = source("src/lib/kyc/pilot-evidence.ts");

    expect(evaluator).toContain('id: "authenticated-sessions"');
    expect(evaluator).toContain('id: "review-audit-chain"');
    expect(evaluator).toContain("submissionAudits.length >= 2");
    expect(evaluator).toContain("startReviewAudits.length >= 2");
    expect(evaluator).toContain(
      'decisionReviewAction = outcome === "approved" ? "approve" : "reject"',
    );
  });

  it("requires an explicit synthetic marker and guarded naming convention", () => {
    const route = source("src/app/api/verify/applications/route.ts");

    expect(route).toContain("syntheticPilot: z.literal(true).optional()");
    expect(route).toContain('startsWith("gem verify synthetic")');
    expect(route).toContain('scenario: "gem-verify-phase-1b"');
    expect(route).toContain("synthetic: true");
  });

  it("does not expose applicant fields, notes, documents, or credentials in the report", () => {
    const route = source("src/app/api/verify/pilot-evidence/route.ts");

    expect(route).not.toContain("passwordHash");
    expect(route).not.toContain("storagePath");
    expect(route).not.toContain("fileName");
    expect(route).not.toContain("reviewNotes");
    expect(route).not.toContain("rejectionReason");
    expect(route).not.toContain("email: true");
    expect(route).toContain("documents: { select: { id: true } }");
  });

  it("provides a dedicated read-only evidence screen", () => {
    const page = source(
      "src/app/app/admin/verification-pilot/evidence/page.tsx",
    );

    expect(page).toContain("GEM Verify pilot evidence report");
    expect(page).toContain("/api/verify/pilot-evidence");
    expect(page).toContain("Read-only");
    expect(page).toContain("No document contents returned");
  });
});
