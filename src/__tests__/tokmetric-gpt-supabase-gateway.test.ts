import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync("src/app/functions/[action]/route.ts", "utf8");
const gatewayClientSource = readFileSync(
  "src/lib/tokmetric/gptGateway.ts",
  "utf8",
);
const migrationSource = readFileSync(
  "supabase/migrations/20260716140000_create_tokmetric_gpt_credentials.sql",
  "utf8",
);
const smokeSource = readFileSync(
  "scripts/tokmetric-gpt-readonly-smoke.mjs",
  "utf8",
);

describe("TokMetric Custom GPT Supabase gateway", () => {
  it("routes canonical gateway deployments before the direct Prisma path", () => {
    expect(routeSource).toContain("shouldUseTokMetricGptGateway()");
    expect(routeSource).toContain("invokeTokMetricGptGateway({");
    expect(routeSource.indexOf("shouldUseTokMetricGptGateway()"))
      .toBeLessThan(routeSource.indexOf("requireTokMetricGptAuth(request)"));
  });

  it("forwards the caller bearer token without embedding a GPT secret", () => {
    expect(gatewayClientSource).toContain("Authorization: input.authorization");
    expect(gatewayClientSource).not.toContain("gem_tokmetric_");
    expect(gatewayClientSource).not.toContain("GPT_AUTH_TOKEN =");
  });

  it("fails safely when the gateway cannot be reached", () => {
    expect(gatewayClientSource).toContain("TOKMETRIC_GATEWAY_TIMEOUT");
    expect(gatewayClientSource).toContain("TOKMETRIC_GATEWAY_UNAVAILABLE");
    expect(routeSource).toContain("{ status: 503 }");
  });

  it("stores only bearer hashes with workspace and actor binding", () => {
    expect(migrationSource).toContain("token_hash text not null unique");
    expect(migrationSource).toContain("actor_user_id text not null");
    expect(migrationSource).toContain("workspace_id text not null");
    expect(migrationSource).toContain("enable row level security");
    expect(migrationSource).toContain("no plaintext bearer tokens");
  });

  it("keeps Custom GPT operations read-only during the controlled launch", () => {
    expect(smokeSource).toContain('controlled_write_mode === "COMMAND_CENTER_ONLY"');
    expect(smokeSource).toContain("CONTROLLED_WRITE_DISABLED");
    expect(smokeSource).toContain('live_publishing_expected: "BLOCKED"');
  });
});
