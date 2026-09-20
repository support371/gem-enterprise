import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("intake gateway recovery", () => {
  it("uses the isolated gateway only when direct Prisma storage is unavailable", () => {
    const gateway = source("src/lib/intake/gateway.ts");
    const repository = source("src/lib/intake/repository.ts");

    expect(gateway).toContain("GEM_INTAKE_GATEWAY_ENABLED");
    expect(gateway).toContain("!hasDirectDatabaseConfiguration()");
    expect(gateway).toContain("gem-intake-gateway");
    expect(repository).toContain("shouldUseIntakeGateway()");
    expect(repository).toContain("createIntakeSubmissionViaGateway(input)");
  });

  it("keeps public gateway access create-only and validates the request again", () => {
    const edge = source("supabase/functions/gem-intake-gateway/index.ts");

    expect(edge).toContain('body.action !== "create"');
    expect(edge).toContain("VALIDATION_FAILED");
    expect(edge).toContain("gem_create_public_intake");
    expect(edge).not.toMatch(/action\s*===?\s*["'](?:list|get|update|delete)["']/);
  });

  it("commits submission and initial event atomically behind service-role execution", () => {
    const migration = source(
      "prisma/migrations/20260920190000_intake_gateway_recovery/migration.sql",
    );

    expect(migration).toContain("INSERT INTO public.intake_submissions");
    expect(migration).toContain("INSERT INTO public.intake_status_events");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("REVOKE ALL");
    expect(migration).toContain("GRANT EXECUTE");
    expect(migration).toContain("TO service_role");
  });
});
