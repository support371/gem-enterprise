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
const adminGatewaySource = readFileSync(
  "supabase/functions/gem-admin-write/index.ts",
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
    expect(adminGatewaySource).toContain("requireAdmin");
    expect(adminGatewaySource).toContain("requireSuperAdmin");
    expect(adminGatewaySource).toContain("SUPER_ADMIN_REQUIRED");
    expect(adminGatewaySource).toContain('payload.iss !== "gem-auth-gateway"');
    expect(adminGatewaySource).toContain('payload.aud !== "gem-enterprise"');
  });

  it("generates the readable value only in GEM and sends only its digest", () => {
    expect(adminSource).toContain("randomBytes(48)");
    expect(adminSource).toContain("tokmetric_gpt_");
    expect(adminSource).toContain('createHash("sha256")');
    expect(adminSource).toContain("digestOneTimeValue(oneTimeValue)");
    expect(adminSource).toContain("tokmetric_credential_issue_hash");
    expect(adminSource).toContain("tokenHash: digestOneTimeValue(oneTimeValue)");
    expect(adminGatewaySource).toContain("requiredDigest");
    expect(adminGatewaySource).toContain("token_hash: tokenHash");
    expect(adminGatewaySource).not.toContain("randomBytes(48)");
    expect(adminGatewaySource).not.toContain("oneTimeValue");
  });

  it("never returns a digest or readable value from registry views", () => {
    const viewStart = adminGatewaySource.indexOf("function credentialView");
    const viewEnd = adminGatewaySource.indexOf(
      "async function requireTokMetricWorkspace",
    );
    const credentialView = adminGatewaySource.slice(viewStart, viewEnd);
    expect(credentialView).not.toContain("token_hash");
    expect(credentialView).not.toContain("tokenHash");
    expect(credentialView).not.toContain("bearer");
  });

  it("uses the existing centralized administrator gateway", () => {
    expect(adminSource).toContain("adminWriteGateway");
    expect(adminSource).toContain("tokmetric_credential_list");
    expect(adminSource).toContain("tokmetric_credential_issue_hash");
    expect(adminSource).toContain("tokmetric_credential_revoke");
    expect(adminSource).not.toContain("DEFAULT_GATEWAY_ANON_KEY");
    expect(adminSource).not.toContain("sb_publishable_");
  });

  it("preserves existing administrator and retention actions", () => {
    expect(adminGatewaySource).toContain('action === "update_user"');
    expect(adminGatewaySource).toContain('action === "retention_policy_list"');
    expect(adminGatewaySource).toContain('action === "retention_policy_create"');
    expect(adminGatewaySource).toContain('action === "retention_policy_action"');
  });

  it("binds all credential operations to the canonical workspace", () => {
    expect(adminGatewaySource).toContain(
      'const TOKMETRIC_WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c"',
    );
    expect(adminGatewaySource).toContain("actor_user_id: actor.id");
    expect(adminGatewaySource).toContain(
      "workspace_id: TOKMETRIC_WORKSPACE_ID",
    );
    expect(adminGatewaySource).toContain("WORKSPACE_CONFIRMATION_MISMATCH");
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
    expect(adminGatewaySource).toContain("MAX_ACTIVE_TOKMETRIC_CREDENTIALS");
    expect(adminGatewaySource).toContain("ACTIVE_CREDENTIAL_LIMIT_REACHED");
    expect(adminGatewaySource).toContain("CREDENTIAL_CONFIRMATION_MISMATCH");
    expect(adminGatewaySource).toContain("tokmetric.gpt_credential.issued");
    expect(adminGatewaySource).toContain("tokmetric.gpt_credential.revoked");
    expect(adminGatewaySource).toContain('sourceChannel: "command_center"');
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
    expect(adminGatewaySource).toContain("SUPABASE_SERVICE_ROLE_KEY");
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

  it("retains the extended admin gateway source during verification", () => {
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-admin-write/",
    );
    expect(vercelIgnoreSource).toContain(
      "!supabase/functions/gem-admin-write/index.ts",
    );
  });
});
