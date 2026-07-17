import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const edgeSource = readFileSync(
  "supabase/functions/gem-tokmetric-credential-admin/index.ts",
  "utf8",
);
const routeSource = readFileSync(
  "src/app/api/tokmetric/gpt-credentials/route.ts",
  "utf8",
);
const serverClientSource = readFileSync(
  "src/lib/tokmetric/credential-admin-route.ts",
  "utf8",
);
const componentSource = readFileSync(
  "src/components/tokmetric/TokMetricGptCredentialManager.tsx",
  "utf8",
);
const pageSource = readFileSync(
  "src/app/app/command-center/tokmetric/page.tsx",
  "utf8",
);
const vercelIgnoreSource = readFileSync(".vercelignore", "utf8");

describe("TokMetric GPT credential manager", () => {
  it("requires an authenticated super administrator", () => {
    expect(edgeSource).toContain("requireSuperAdmin");
    expect(edgeSource).toContain('user.role !== "super_admin"');
    expect(edgeSource).toContain("SUPER_ADMIN_REQUIRED");
    expect(serverClientSource).toContain("getGatewaySessionToken");
    expect(serverClientSource).toContain("GATEWAY_SESSION_REQUIRED");
  });

  it("generates a one-time bearer and stores only its hash", () => {
    expect(edgeSource).toContain("crypto.getRandomValues");
    expect(edgeSource).toContain("tokmetric_gpt_");
    expect(edgeSource).toContain("const tokenHash = await sha256(bearer)");
    expect(edgeSource).toContain("token_hash: tokenHash");
    expect(edgeSource).toContain("oneTimeDisplay: true");
    expect(edgeSource).not.toContain("token_plaintext");
    expect(edgeSource).not.toContain("plaintext_bearer");
  });

  it("does not expose token hashes through the credential registry", () => {
    const viewStart = edgeSource.indexOf("function credentialView");
    const viewEnd = edgeSource.indexOf("async function requireWorkspace");
    const credentialView = edgeSource.slice(viewStart, viewEnd);
    expect(credentialView).not.toContain("token_hash");
    expect(credentialView).not.toContain("bearer");
  });

  it("binds credentials to the production workspace and active actor", () => {
    expect(edgeSource).toContain("actor_user_id: actor.id");
    expect(edgeSource).toContain("workspace_id: workspaceId");
    expect(edgeSource).toContain("WORKSPACE_CONFIRMATION_MISMATCH");
    expect(routeSource).toContain("TOKMETRIC_PRODUCTION_WORKSPACE_ID");
    expect(serverClientSource).toContain(
      '"ws_60488340ded94dcfab3b875ef9ae591c"',
    );
  });

  it("limits issuance and supports audited revocation", () => {
    expect(edgeSource).toContain("MAX_ACTIVE_CREDENTIALS_PER_WORKSPACE");
    expect(edgeSource).toContain("ACTIVE_CREDENTIAL_LIMIT_REACHED");
    expect(edgeSource).toContain("CREDENTIAL_CONFIRMATION_MISMATCH");
    expect(edgeSource).toContain("tokmetric.gpt_credential.issued");
    expect(edgeSource).toContain("tokmetric.gpt_credential.revoked");
    expect(edgeSource).toContain('sourceChannel: "command_center"');
  });

  it("keeps service-role access server-side", () => {
    expect(serverClientSource).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(serverClientSource).toContain("getGatewaySessionToken");
    expect(componentSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(componentSource).not.toContain("serviceRoleKey");
    expect(componentSource).not.toContain("localStorage");
    expect(componentSource).not.toContain("sessionStorage");
    expect(componentSource).not.toContain("indexedDB");
  });

  it("displays the bearer once and provides an explicit copy flow", () => {
    expect(componentSource).toContain("One-time bearer");
    expect(componentSource).toContain("navigator.clipboard.writeText");
    expect(componentSource).toContain("This value disappears when the page reloads");
    expect(componentSource).toContain("Issue one-time bearer");
    expect(componentSource).toContain("readOnly");
  });

  it("surfaces the manager in the consolidated Command Center", () => {
    expect(pageSource).toContain("TokMetricGptCredentialManager");
    expect(pageSource).toContain("Bearer credential management");
  });

  it("retains the Edge Function source during Vercel verification", () => {
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-tokmetric-credential-admin/",
    );
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-tokmetric-credential-admin/index.ts",
    );
  });
});
