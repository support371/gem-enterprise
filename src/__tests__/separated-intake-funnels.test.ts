import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  communityApplicationSchema,
  containsRestrictedIntakeContent,
  enterpriseApplicationSchema,
  productRequestSchema,
} from "@/lib/intake/schemas";
import { canTransitionIntake, nextIntakeStatuses } from "@/lib/intake/workflow";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const common = {
  name: "Morgan Avery",
  email: "morgan@example.com",
  phone: "+1 555 0100",
  organization: "Example Holdings",
  title: "Operations Director",
  jurisdiction: "United States, New York",
  subject: "Security and compliance qualification request",
  message:
    "We are seeking a documented review of our operating requirements, current controls, and a suitable next-step engagement scope.",
  consentGiven: true as const,
  privacyAccepted: true as const,
  honeypot: "",
  startedAt: Date.now() - 5_000,
};

describe("separated intake funnels", () => {
  it("validates the enterprise application independently", () => {
    const result = enterpriseApplicationSchema.safeParse({
      ...common,
      organizationType: "company",
      employeeRange: "11-50",
      serviceAreas: ["cybersecurity", "compliance"],
    });
    expect(result.success).toBe(true);
  });

  it("validates the Community application independently", () => {
    const result = communityApplicationSchema.safeParse({
      ...common,
      entityType: "operator",
      interests: ["operator_introductions", "security_compliance"],
      referral: "Professional introduction",
    });
    expect(result.success).toBe(true);
  });

  it("validates a product request with preserved product context", () => {
    const result = productRequestSchema.safeParse({
      ...common,
      productSlug: "enterprise-security-assessment",
      productName: "Enterprise Security Assessment",
      productCategory: "Assessments",
      quantity: 1,
      intendedUse:
        "The assessment would support an internal security-baseline and remediation-planning exercise.",
      budgetRange: "5000_25000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.productSlug).toBe("enterprise-security-assessment");
    }
  });

  it("rejects sensitive information in public intake text", () => {
    expect(containsRestrictedIntakeContent("My password is secret123")).toBe(true);
    const result = enterpriseApplicationSchema.safeParse({
      ...common,
      message: "Please use my bank account and password to complete this request immediately.",
      organizationType: "company",
      serviceAreas: ["cybersecurity"],
    });
    expect(result.success).toBe(false);
  });

  it("enforces human-review status transitions", () => {
    expect(canTransitionIntake("RECEIVED", "TRIAGE")).toBe(true);
    expect(canTransitionIntake("RECEIVED", "APPROVED")).toBe(false);
    expect(canTransitionIntake("QUALIFIED", "APPROVED")).toBe(true);
    expect(nextIntakeStatuses("CLOSED")).toEqual([]);
  });

  it("defines additive durable tables, fail-closed RLS, and immutable event history", () => {
    const migration = source(
      "prisma/migrations/20260713174500_separated_intake_funnels/migration.sql",
    );
    expect(migration).toContain('CREATE TABLE "intake_submissions"');
    expect(migration).toContain('CREATE TABLE "intake_status_events"');
    expect(migration).toContain('ALTER TABLE "intake_submissions" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE "intake_status_events" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain("intake_submissions_queue_status_created_at_idx");
    expect(migration).toContain("ON DELETE CASCADE");
    expect(migration).not.toMatch(/\bDROP\s+(?:TABLE|TYPE|COLUMN)\b/i);
  });

  it("keeps public confirmations free of fixed response promises", () => {
    const files = [
      "src/components/intake/PublicIntakeForm.tsx",
      "src/lib/intake/submit.ts",
      "src/app/enterprise/apply/page.tsx",
      "src/app/community/apply/page.tsx",
      "src/app/store/products/[slug]/request/page.tsx",
    ].map(source);
    const combined = files.join("\n");
    expect(combined).not.toMatch(/within\s+\d+\s+(?:minutes?|hours?|business days?)/i);
    expect(combined).toContain("human review");
  });

  it("protects the administrator queue with the canonical admin gate", () => {
    const listRoute = source("src/app/api/admin/intake/route.ts");
    const detailRoute = source("src/app/api/admin/intake/[id]/route.ts");
    expect(listRoute).toContain("requireAdmin");
    expect(detailRoute).toContain("requireAdmin");
    expect(detailRoute).toContain("canTransitionIntake");
    expect(detailRoute).toContain("emitAuditLog");
  });

  it("retires the mixed endpoint for the three separated workflows", () => {
    const legacyRoute = source("src/app/api/intake/submit/route.ts");
    expect(legacyRoute).toContain("SEPARATED_INTAKE_REQUIRED");
    expect(legacyRoute).toContain("hub_access_request");
    expect(legacyRoute).toContain('enterprise: "/enterprise/apply"');
    expect(legacyRoute).toContain('community: "/community/apply"');
    expect(legacyRoute).not.toMatch(/within\s+(?:1|24)\s+hours?/i);
  });

  it("uses canonical product data, durable post-commit handling, and concurrency guards", () => {
    const submitSource = source("src/lib/intake/submit.ts");
    const repositorySource = source("src/lib/intake/repository.ts");
    const detailRoute = source("src/app/api/admin/intake/[id]/route.ts");

    expect(submitSource).toContain("getStoreProduct");
    expect(submitSource).toContain("INVALID_PRODUCT_REFERENCE");
    expect(submitSource).toContain("Promise.allSettled");
    expect(repositorySource).toContain("expectedStatus");
    expect(repositorySource).toContain("IntakeStatusConflictError");
    expect(repositorySource).toContain("input.assignedToId === undefined");
    expect(detailRoute).toContain("STALE_INTAKE_STATUS");
  });
});
