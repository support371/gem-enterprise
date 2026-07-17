import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("TokMetric activation approval safety", () => {
  const gateway = source(
    "supabase/functions/gem-tokmetric-command-gateway/index.ts",
  );

  it("requires an explicit operation at both application and gateway layers", () => {
    const route = source("src/app/api/tokmetric/command/route.ts");
    expect(route).toContain("TokMetric command operation is required.");
    expect(gateway).toContain("TokMetric command operation is required");
    expect(gateway).not.toContain(
      'typeof body.operation === "string" ? body.operation : "snapshot"',
    );
  });

  it("requires compliance evidence before approval", () => {
    expect(gateway).toContain('"COMPLIANCE_REVIEW_REQUIRED"');
    expect(gateway).toContain('["PASS", "HUMAN_REVIEW_REQUIRED"]');
    expect(gateway).toContain('"COMPLIANCE_BLOCKED"');
  });

  it("prevents self-approval and enforces the requested role", () => {
    expect(gateway).toContain("approval.requestedById === actor.id");
    expect(gateway).toContain('"APPROVAL_SEPARATION_REQUIRED"');
    expect(gateway).toContain("roleCanDecide(actor.role, approval.requiredRole)");
    expect(gateway).toContain('"APPROVER_ROLE_REQUIRED"');
  });

  it("binds approval to the current exact version and object hash", () => {
    expect(gateway).toContain(
      "content.currentVersionId !== approval.contentVersionId",
    );
    expect(gateway).toContain("version.objectHash !== approval.objectHash");
    expect(gateway).toContain('"APPROVAL_VERSION_MISMATCH"');
    expect(gateway).toContain('"APPROVAL_HASH_MISMATCH"');
  });

  it("requires a connected posting connector and authorized publishing scope", () => {
    expect(gateway).toContain('connector.provider === "TIKTOK_CONTENT_POSTING_API"');
    expect(gateway).toContain('scopes.has("video.publish")');
    expect(gateway).toContain('scopes.has("video.upload")');
    expect(gateway).toContain('"CONTENT_POSTING_SCOPE_NOT_AUTHORIZED"');
    expect(gateway).toContain('"LIVE_PUBLISHING_GATE_DISABLED"');
  });

  it("never performs an external TikTok write", () => {
    expect(gateway).toContain("externalActionTaken: false");
    expect(gateway).toContain("externalWritesAvailable: false");
    expect(gateway).not.toContain("open.tiktokapis.com");
  });
});
