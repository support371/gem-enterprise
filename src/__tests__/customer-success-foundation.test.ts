import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("customer success foundation", () => {
  it("ships additive workspace-scoped customer-success storage", () => {
    const migration = source("prisma/migrations/20260913163000_customer_success_foundation/migration.sql");

    expect(migration).toContain('CREATE TABLE "customer_success_profiles"');
    expect(migration).toContain('CREATE TABLE "customer_success_actions"');
    expect(migration).toContain('REFERENCES "tokmetric_workspaces"');
    expect(migration).toContain('REFERENCES "organization_projects"');
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN|TYPE)/i);
  });

  it("promotes customer-success models through the established Prisma build path", () => {
    const promotion = source("scripts/apply-customer-success-prisma.mjs");
    const pkg = source("package.json");
    const vercelBuild = source("scripts/vercel-build.mjs");

    expect(promotion).toContain("Customer Success Foundation");
    expect(promotion).toContain("CustomerSuccessProfile");
    expect(promotion).toContain("CustomerSuccessAction");
    expect(pkg).toContain("db:schema:promote:customer-success");
    expect(pkg).toContain("db:schema:check:customer-success");
    expect(vercelBuild).toContain("apply-customer-success-prisma.mjs");
  });

  it("keeps lifecycle writes behind admin authority and explicit actions", () => {
    const route = source("src/app/api/admin/customer-success/route.ts");

    expect(route).toContain("requireAdmin");
    expect(route).toContain("upsertCustomerSuccessProfile");
    expect(route).toContain("createCustomerSuccessAction");
    expect(route).toContain("updateCustomerSuccessActionStatus");
    expect(route).not.toContain("stripe");
    expect(route).not.toContain("/send");
    expect(route).not.toContain("publish");
  });

  it("makes expansion, renewal, referral, and win-back planning explicit without auto-activation", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const page = source("src/app/app/admin/customer-success/page.tsx");

    for (const action of ["EXPANSION", "RENEWAL", "REFERRAL", "WIN_BACK"]) {
      expect(repository).toContain(`\"${action}\"`);
    }
    expect(page).toContain("Creating an action never activates a service");
    expect(page).toContain("do not authorize a new scope");
    expect(page).toContain("normal GEM qualification, proposal, approval, payment, and entitlement gates");
  });
});
