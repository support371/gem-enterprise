import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(
  "src/app/api/tokmetric/gpt-credentials/route.ts",
  "utf8",
);
const adminSource = readFileSync(
  "src/lib/tokmetric/credential-admin-route.ts",
  "utf8",
);
const gatewaySource = readFileSync("src/lib/supabase-gateway.ts", "utf8");
const storeGatewaySource = readFileSync(
  "supabase/functions/gem-tokmetric-credential-store/index.ts",
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
  it("requires a signed GEM session and active super administrator", () => {
    expect(adminSource).toContain("getGatewaySessionToken");
    expect(adminSource).toContain("GEM_SESSION_REQUIRED");
    expect(storeGatewaySource).toContain("requireSuperAdmin");
    expect(storeGatewaySource).toContain('user.role !== "super_admin"');
    expect(storeGatewaySource).toContain("SUPER_ADMIN_REQUIRED");
    expect(storeGatewaySource).toContain('payload.iss !== "gem-auth-gateway"');
    expect(storeGatewaySource).toContain('payload.aud !== "gem-enterprise"');
  });

  it("generates the readable value only in GEM and sends only its digest", () => {
    expect(adminSource).toContain("randomBytes(48)");
    expect(adminSource).toContain("tokmetric_gpt_");
    expect(adminSource).toContain('createHash("sha256")');
    expect(adminSource).toContain("digestOneTimeValue(oneTimeValue)");
    expect(adminSource).toContain('"issue_hash"');
    expect(adminSource).toContain("tokenHash: digestOneTimeValue(oneTimeValue)");
    expect(storeGatewaySource).toContain("requiredDigest");
    expect(storeGatewaySource).toContain("token_hash: tokenHash");
    expect(storeGatewaySource).not.toContain("randomBytes(48)");
    expect(storeGatewaySource).not.toContain("oneTimeValue");
  });

  it("never returns a digest or readable value from the store registry", () => {
    const viewStart = storeGatewaySource.indexOf("function credentialView");
    const viewEnd = storeGatewaySource.indexOf("async function requireWorkspace");
    const credentialView = storeGatewaySource.slice(viewStart, viewEnd);
    expect(credentialView).not.toContain("token_hash");
    expect(credentialView).not.toContain("tokenHash");
    expect(credentialView).not.toContain("bearer");
  });

  it("uses the centralized Supabase invocation key location", () => {
    expect(gatewaySource).toContain("tokMetricCredentialStoreGateway");
    expect(gatewaySource).toContain('"gem-tokmetric-credential-store"');
    expect(adminSource).toContain("tokMetricCredentialStoreGateway");
    expect(adminSource).not.toContain("DEFAULT_GATEWAY_ANON_KEY");
    expect(adminSource).not.toContain("sb_publishable_");
  });

  it("binds all store operations to the canonical workspace", () => {
    expect(storeGatewaySource).toContain(
      'const WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c"',
    );
    expect(storeGatewaySource).toContain("actor_user_id: actor.id");
    expect(storeGatewaySource).toContain("workspace_id: WORKSPACE_ID");
    expect(storeGatewaySource).toContain("WORKSPACE_CONFIRMATION_MISMATCH");
    expect(adminSource).toContain(
      '"ws_60488340ded94dcfab3b875ef9ae591c"',
    );
  });

  it("derives the client workspace from the authorized registry response", () => {
    expect(componentSource).toContain("setWorkspaceId(body.workspace.id)");
    expect(componentSource).toContain("confirmWorkspaceId: workspaceId");
    expect(componentSource).not.toContain("const WORKSPACE_ID");
    expect(componentSource).not.toContain(
      '"ws_60488340ded94dcfab3b875ef9ae591c"',
    );
  });

  it("limits issuance and supports confirmed, audited revocation", () => {
    expect(storeGatewaySource).toContain("MAX_ACTIVE_CREDENTIALS");
    expect(storeGatewaySource).toContain("ACTIVE_CREDENTIAL_LIMIT_REACHED");
    expect(storeGatewaySource).toContain("CREDENTIAL_CONFIRMATION_MISMATCH");
    expect(storeGatewaySource).toContain("tokmetric.gpt_credential.issued");
    expect(storeGatewaySource).toContain("tokmetric.gpt_credential.revoked");
    expect(storeGatewaySource).toContain('sourceChannel: "command_center"');
  });

  it("uses a controlled revocation dialog and prevents duplicate requests", () => {
    expect(componentSource).toContain("revocationCredential");
    expect(componentSource).toContain("revocationReason");
    expect(componentSource).toContain("revocationLabelConfirmation");
    expect(componentSource).toContain("revokingId");
    expect(componentSource).toContain('role="dialog"');
    expect(componentSource).toContain('aria-modal="true"');
    expect(componentSource).not.toContain("window.prompt");
  });

  it("does not disclose workspace configuration in invalid-action responses", () => {
    const unknownActionStart = routeSource.indexOf(
      'error: "Unknown credential action."',
    );
    const unknownActionResponse = routeSource.slice(unknownActionStart);
    expect(unknownActionResponse).not.toContain("workspaceId");
    expect(routeSource).not.toContain("TOKMETRIC_PRODUCTION_WORKSPACE_ID");
  });

  it("removes the Vercel database-authority dependency", () => {
    expect(adminSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(adminSource).not.toContain("SUPABASE_URL");
    expect(adminSource).not.toContain("/rest/v1");
    expect(componentSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(storeGatewaySource).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("never persists the readable value in browser storage", () => {
    expect(componentSource).not.toContain("localStorage");
    expect(componentSource).not.toContain("sessionStorage");
    expect(componentSource).not.toContain("indexedDB");
    expect(componentSource).toContain("This value disappears when the page reloads");
  });

  it("displays the value once and provides an explicit copy flow", () => {
    expect(componentSource).toContain("One-time bearer");
    expect(componentSource).toContain("navigator.clipboard.writeText");
    expect(componentSource).toContain("Issue one-time bearer");
    expect(componentSource).toContain("readOnly");
  });

  it("surfaces the manager in the consolidated Command Center", () => {
    expect(pageSource).toContain("TokMetricGptCredentialManager");
    expect(pageSource).toContain("Bearer credential management");
  });

  it("retains the store gateway source during Vercel verification", () => {
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-tokmetric-credential-store/",
    );
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-tokmetric-credential-store/index.ts",
    );
  });
});
