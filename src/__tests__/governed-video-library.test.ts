import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("src/app/api/video/library/route.ts", "utf8");
const panel = readFileSync("src/components/social-media/GovernedVideoPreviewPanel.tsx", "utf8");

describe("governed video library", () => {
  it("requires an active session and authorized workspace", () => {
    expect(route).toContain("requireActiveTokMetricSession");
    expect(route).toContain("requireWorkspaceAccess(workspaceId, session)");
    expect(route).toContain("limit: z.coerce.number().int().min(1).max(100)");
  });

  it("returns only current-version video assets with no-store semantics", () => {
    expect(route).toContain("currentVersionId: { not: null }");
    expect(route).toContain('"video/mp4"');
    expect(route).toContain('"video/webm"');
    expect(route).toContain('"video/quicktime"');
    expect(route).toContain('"Cache-Control": "private, no-store, max-age=0"');
  });

  it("preserves exact-version governance and does not publish", () => {
    expect(route).toContain("candidateApproval?.objectHash === version.objectHash");
    expect(route).toContain("externalActionTaken: false");
    expect(route).toContain("externalPublicationTaken: false");
    expect(route).not.toContain("db.publishJob.create");
  });

  it("lets operators browse workspace videos without losing exact-ID lookup", () => {
    expect(panel).toContain("/api/video/library?workspaceId=");
    expect(panel).toContain("Load video library");
    expect(panel).toContain("Exact content-ID lookup");
    expect(panel).toContain("No publication action was taken");
  });

  it("bounds database and response work for an operator request", () => {
    expect(route).toContain("Math.min(limit * 4, 400)");
    expect(route).toContain(".slice(0, limit)");
  });
});
