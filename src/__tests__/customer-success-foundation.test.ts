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

  it("maps missing customer-success storage to the explicit unavailable boundary before action lookup", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const createAction = repository.slice(
      repository.indexOf("export async function createCustomerSuccessAction"),
      repository.indexOf("export async function updateCustomerSuccessActionStatus"),
    );

    expect(createAction.indexOf("try {")).toBeGreaterThanOrEqual(0);
    expect(createAction.indexOf("try {")).toBeLessThan(createAction.indexOf('FROM "customer_success_profiles"'));
    expect(createAction).toContain("if (isStorageMissing(error)) throw new CustomerSuccessStoreUnavailableError()");
  });

  it("sets completedAt consistently when an action is created already completed", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const createAction = repository.slice(
      repository.indexOf("export async function createCustomerSuccessAction"),
      repository.indexOf("export async function updateCustomerSuccessActionStatus"),
    );

    expect(createAction).toContain('const status = input.status ?? "PLANNED"');
    expect(createAction).toContain('const completedAt = status === "COMPLETED" ? new Date() : null');
    expect(createAction).toContain('"dueAt", "completedAt", "evidence", "updatedAt"');
    expect(createAction).toContain('${input.dueAt ?? null}, ${completedAt}');
  });

  it("preserves the original completion timestamp on idempotent COMPLETED retries", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const updateAction = repository.slice(repository.indexOf("export async function updateCustomerSuccessActionStatus"));

    expect(updateAction).toContain("WHEN ${input.status} = 'COMPLETED' AND \"status\" = 'COMPLETED' THEN \"completedAt\"");
    expect(updateAction).toContain("WHEN ${input.status} = 'COMPLETED' THEN CURRENT_TIMESTAMP");
    expect(updateAction).toContain("ELSE NULL");
  });

  it("hydrates an existing workspace profile before the admin can save over stored values", () => {
    const page = source("src/app/app/admin/customer-success/page.tsx");

    expect(page).toContain("hydratedWorkspaceId");
    expect(page).toContain("profiles.find((profile) => profile.workspaceId === workspaceId)");
    expect(page).toContain("setLifecycleState(existing.lifecycleState)");
    expect(page).toContain("setHealthStatus(existing.healthStatus)");
    expect(page).toContain("setOutcomeStatus(existing.outcomeStatus)");
    expect(page).toContain("setSatisfactionScore(existing.satisfactionScore == null ? \"\" : String(existing.satisfactionScore))");
    expect(page).toContain("setOutcomeSummary(existing.outcomeSummary ?? \"\")");
    expect(page).toContain("hydratedWorkspaceId !== workspaceId");
  });

  it("preserves historical review and owner fields when the admin form omits them", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const route = source("src/app/api/admin/customer-success/route.ts");

    expect(repository).toContain("const preserveOwnerUserId = input.ownerUserId === undefined");
    expect(repository).toContain("const preserveLastReviewAt = input.lastReviewAt === undefined");
    expect(repository).toContain('"ownerUserId" = CASE');
    expect(repository).toContain('"lastReviewAt" = CASE');
    expect(repository).toContain('THEN "customer_success_profiles"."lastReviewAt"');
    expect(route).toContain("if (value === undefined) return undefined");
  });

  it("discards stale action-list responses when profile selection changes", () => {
    const page = source("src/app/app/admin/customer-success/page.tsx");

    expect(page).toContain("const actionsRequestRef = useRef(0)");
    expect(page).toContain("const selectedProfileIdRef = useRef<string | null>(null)");
    expect(page).toContain("const requestId = ++actionsRequestRef.current");
    expect(page).toContain("requestId !== actionsRequestRef.current");
    expect(page).toContain("selectedProfileIdRef.current !== profileId");
    expect(page).toContain("actionsRequestRef.current += 1");
  });

  it("persists every lifecycle mutation and its mandatory audit row in one transaction", () => {
    const repository = source("src/lib/customer-success/repository.ts");
    const route = source("src/app/api/admin/customer-success/route.ts");

    expect(repository.match(/db\.\$transaction\(async \(tx\) =>/g)?.length).toBeGreaterThanOrEqual(3);
    expect(repository.match(/tx\.auditLog\.create/g)?.length).toBeGreaterThanOrEqual(3);
    expect(repository).toContain("AuditAction.admin_action");
    expect(route).not.toContain("emitAuditLog");
    expect(route).toContain("audit: {");
    expect(route).toContain("userId: gate.session.userId");
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
