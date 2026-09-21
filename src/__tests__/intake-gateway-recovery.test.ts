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
    expect(repository).toContain("listIntakeSubmissionsViaGateway(filters)");
    expect(repository).toContain("getIntakeSubmissionViaGateway(id)");
    expect(repository).toContain("updateIntakeSubmissionViaGateway(input)");
  });

  it("keeps anonymous access create-only and capability-gates privileged actions", () => {
    const edge = source("supabase/functions/gem-intake-gateway/index.ts");
    const capability = source("src/lib/intake/gateway-capability.ts");
    const verifier = source("src/app/api/internal/intake-gateway/verify/route.ts");

    expect(edge).toContain('body.action === "create"');
    expect(edge).toContain("VALIDATION_FAILED");
    expect(edge).toContain("gem_create_public_intake");
    expect(edge).toContain('authorize("list"');
    expect(edge).toContain('authorize("get"');
    expect(edge).toContain('authorize("update"');
    expect(edge).toContain('authorize("convert"');
    expect(edge).toContain("CAPABILITY_REQUIRED");
    expect(capability).toContain("GEM_AGENT_API_KEY");
    expect(capability).toContain("gem-intake-gateway-capability-v1");
    expect(capability).toContain("setExpirationTime");
    expect(verifier).toContain("verifyIntakeGatewayCapability");
    expect(verifier).toContain("claims.action !== parsed.data.action");
    expect(verifier).toContain("claims.intakeId !== requestedIntakeId");
  });

  it("commits submission and every privileged transition atomically behind service-role execution", () => {
    const createMigration = source(
      "prisma/migrations/20260920190000_intake_gateway_recovery/migration.sql",
    );
    const transitionMigration = source(
      "prisma/migrations/20260921004500_intake_gateway_privileged_transitions/migration.sql",
    );

    expect(createMigration).toContain("INSERT INTO public.intake_submissions");
    expect(createMigration).toContain("INSERT INTO public.intake_status_events");
    expect(createMigration).toContain("SECURITY DEFINER");
    expect(createMigration).toContain("REVOKE ALL");
    expect(createMigration).toContain("TO service_role");

    expect(transitionMigration).toContain("gem_transition_intake");
    expect(transitionMigration).toContain("FOR UPDATE");
    expect(transitionMigration).toContain("UPDATE public.intake_submissions");
    expect(transitionMigration).toContain("INSERT INTO public.intake_status_events");
    expect(transitionMigration).toContain("invalid_transition");
    expect(transitionMigration).toContain("REVOKE ALL");
    expect(transitionMigration).toContain("TO service_role");
  });

  it("routes verified Stripe conversion through the recovery gateway when Prisma is unavailable", () => {
    const conversion = source("src/lib/market/paymentConversion.ts");
    const gateway = source("src/lib/intake/gateway.ts");
    const edge = source("supabase/functions/gem-intake-gateway/index.ts");

    expect(conversion).toContain("shouldUseIntakeGateway()");
    expect(conversion).toContain("convertIntakeAfterPaymentViaGateway");
    expect(gateway).toContain('action: "convert"');
    expect(edge).toContain("Verified GEM Stripe payment completed");
    expect(edge).toContain('p_expected_status: "APPROVED"');
    expect(edge).toContain('p_next_status: "CONVERTED"');
  });
});
