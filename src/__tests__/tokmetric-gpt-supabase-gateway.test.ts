import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync("src/app/functions/[action]/route.ts", "utf8");
const agentRouteSource = readFileSync(
  "src/app/functions/tokmetric/agent-plan/route.ts",
  "utf8",
);
const gatewayClientSource = readFileSync(
  "src/lib/tokmetric/gptGateway.ts",
  "utf8",
);
const agentGatewayClientSource = readFileSync(
  "src/lib/tokmetric/agentGateway.ts",
  "utf8",
);
const edgeGatewaySource = readFileSync(
  "supabase/functions/gem-tokmetric-gpt-gateway/index.ts",
  "utf8",
);
const agentEdgeSource = readFileSync(
  "supabase/functions/gem-tokmetric-agent-gateway/index.ts",
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
    expect(agentRouteSource).toContain("shouldUseTokMetricAgentGateway()");
    expect(agentRouteSource).toContain("invokeTokMetricAgentGateway({");
  });

  it("forwards caller bearer tokens without embedding a GPT secret", () => {
    expect(gatewayClientSource).toContain("Authorization: input.authorization");
    expect(agentGatewayClientSource).toContain(
      "Authorization: input.authorization",
    );
    for (const source of [
      gatewayClientSource,
      agentGatewayClientSource,
      edgeGatewaySource,
      agentEdgeSource,
    ]) {
      expect(source).not.toContain("gem_tokmetric_");
      expect(source).not.toContain("GPT_AUTH_TOKEN =");
    }
    expect(edgeGatewaySource).toContain('crypto.subtle.digest(\n    "SHA-256"');
    expect(agentEdgeSource).toContain('crypto.subtle.digest(\n    "SHA-256"');
  });

  it("fails safely when either gateway cannot be reached", () => {
    expect(gatewayClientSource).toContain("TOKMETRIC_GATEWAY_TIMEOUT");
    expect(gatewayClientSource).toContain("TOKMETRIC_GATEWAY_UNAVAILABLE");
    expect(agentGatewayClientSource).toContain(
      "TOKMETRIC_AGENT_GATEWAY_TIMEOUT",
    );
    expect(agentGatewayClientSource).toContain(
      "TOKMETRIC_AGENT_GATEWAY_UNAVAILABLE",
    );
    expect(routeSource).toContain("{ status: 503 }");
    expect(agentRouteSource).toContain("{ status: 503 }");
  });

  it("stores only bearer hashes with workspace and actor binding", () => {
    expect(migrationSource).toContain("token_hash text not null unique");
    expect(migrationSource).toContain("actor_user_id text not null");
    expect(migrationSource).toContain("workspace_id text not null");
    expect(migrationSource).toContain("enable row level security");
    expect(migrationSource).toContain("no plaintext bearer tokens");
    expect(edgeGatewaySource).toContain('from("tokmetric_gpt_credentials")');
    expect(agentEdgeSource).toContain('from("tokmetric_gpt_credentials")');
    expect(edgeGatewaySource).toContain("WORKSPACE_FORBIDDEN");
    expect(agentEdgeSource).toContain("WORKSPACE_FORBIDDEN");
  });

  it("keeps Custom GPT writes blocked and audited during controlled launch", () => {
    expect(edgeGatewaySource).toContain("CONTROLLED_WRITE_DISABLED");
    expect(edgeGatewaySource).toContain('sourceChannel: "custom_gpt"');
    expect(edgeGatewaySource).toContain('production_activation: "BLOCKED"');
    expect(edgeGatewaySource).toContain(
      'controlled_write_mode: "COMMAND_CENTER_ONLY"',
    );
    expect(smokeSource).toContain(
      'controlled_write_mode === "COMMAND_CENTER_ONLY"',
    );
    expect(smokeSource).toContain("CONTROLLED_WRITE_DISABLED");
    expect(smokeSource).toContain('live_publishing_expected: "BLOCKED"');
  });

  it("keeps specialized agents deterministic and unable to act externally", () => {
    expect(agentEdgeSource).toContain('provider: "gem-controlled-planner"');
    expect(agentEdgeSource).toContain('modelVersion: "deterministic-policy-v1"');
    expect(agentEdgeSource).toContain("externalActionTaken: false");
    expect(agentEdgeSource).toContain(
      'currentProductionActivation: "BLOCKED"',
    );
    expect(agentEdgeSource).toContain(
      'action: "tokmetric.agent.plan_generated"',
    );
  });
});
