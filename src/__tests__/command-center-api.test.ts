import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync("src/app/api/command-center/snapshot/route.ts", "utf8");
const snapshotSource = readFileSync("src/lib/commandCenterSnapshot.ts", "utf8");

describe("command-center live snapshot API", () => {
  it("requires an active staff session before querying cross-organization aggregates", () => {
    expect(routeSource).toContain("requireStaff()");
    expect(routeSource).toContain("if (!gate.ok) return gate.response");
  });

  it("prevents authenticated aggregate responses from being cached", () => {
    expect(routeSource).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(routeSource).toContain('export const dynamic = "force-dynamic"');
  });

  it("returns counts only for the approved existing operating records", () => {
    expect(routeSource).toContain("db.user.count");
    expect(routeSource).toContain("db.product.count");
    expect(routeSource).toContain("db.entitlement.count");
    expect(routeSource).toContain("db.supportTicket.count");
    expect(routeSource).toContain("db.serviceRequest.count");
    expect(routeSource).toContain("db.auditLog.count");

    expect(snapshotSource).not.toContain("email");
    expect(snapshotSource).not.toContain("phone");
    expect(snapshotSource).not.toContain("document");
    expect(snapshotSource).not.toContain("password");
  });

  it("fails closed to a disclosed unavailable state when Prisma queries fail", () => {
    expect(routeSource).toContain('source: "unavailable"');
    expect(routeSource).toContain("metrics: null");
    expect(routeSource).toContain("interface remains in disclosed demo mode");
  });
});
