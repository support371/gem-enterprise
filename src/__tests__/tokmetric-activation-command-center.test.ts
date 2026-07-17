import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("TokMetric activation command center", () => {
  it("retains the governed command gateway in production builds", () => {
    const ignore = source(".vercelignore");
    expect(ignore).toContain("!supabase/functions/gem-tokmetric-command-gateway/");
    expect(ignore).toContain(
      "!supabase/functions/gem-tokmetric-command-gateway/index.ts",
    );
    expect(ignore).toContain(
      "!supabase/functions/gem-tokmetric-command-gateway/deno.json",
    );
  });

  it("requires a versioned GEM administrator session", () => {
    const gateway = source(
      "supabase/functions/gem-tokmetric-command-gateway/index.ts",
    );
    expect(gateway).toContain("sessionVersion");
    expect(gateway).toContain('"SESSION_REVOKED"');
    expect(gateway).toContain('payload.iss !== "gem-auth-gateway"');
    expect(gateway).toContain('payload.aud !== "gem-enterprise"');
    expect(gateway).toContain("ADMIN_ROLES.includes");
  });

  it("keeps activation operations internal and fail closed", () => {
    const gateway = source(
      "supabase/functions/gem-tokmetric-command-gateway/index.ts",
    );
    expect(gateway).toContain('controlledWriteMode: "COMMAND_CENTER_ONLY"');
    expect(gateway).toContain("externalWritesAvailable: false");
    expect(gateway).toContain("externalActionTaken: false");
    expect(gateway).toContain('"LIVE_PUBLISHING_GATE_DISABLED"');
    expect(gateway).not.toContain("PUBLISHED_CONFIRMED");
    expect(gateway).not.toContain('fetch("https://open.tiktokapis.com');
  });

  it("supports the complete controlled activation sequence", () => {
    const gateway = source(
      "supabase/functions/gem-tokmetric-command-gateway/index.ts",
    );
    for (const operation of [
      "snapshot",
      "create_draft",
      "create_version",
      "run_review",
      "request_approval",
      "decide_approval",
      "publish_preflight",
    ]) {
      expect(gateway).toContain(`operation === "${operation}"`);
    }
  });

  it("proxies commands only through the HttpOnly GEM session", () => {
    const route = source("src/app/api/tokmetric/command/route.ts");
    const client = source("src/lib/tokmetric/command-gateway.ts");
    expect(route).toContain("getGatewaySessionToken");
    expect(route).toContain("GEM_SESSION_REQUIRED");
    expect(route).toContain("invokeTokMetricCommandGateway");
    expect(route).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(client).toContain('cache: "no-store"');
    expect(route).not.toContain("POSTGRES_PRISMA_URL");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("exposes real operator controls in the protected command center", () => {
    const panel = source(
      "src/components/tokmetric/TokMetricActivationPanel.tsx",
    );
    const page = source("src/app/app/command-center/tokmetric/page.tsx");
    expect(panel).toContain('fetch("/api/tokmetric/command"');
    expect(panel).toContain("Connect Login Kit");
    expect(panel).toContain("Connect Posting API");
    expect(panel).toContain("Create internal content draft");
    expect(panel).toContain("Run review");
    expect(panel).toContain("Request approval");
    expect(panel).toContain("Preflight");
    expect(panel).toContain("External actions taken: none");
    expect(page).toContain("<TokMetricActivationPanel />");
  });
});
