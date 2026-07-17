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
const storeSource = readFileSync(
  "src/lib/tokmetric/credential-store.ts",
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

describe("TokMetric GPT credential manager", () => {
  it("requires a verified active super administrator", () => {
    expect(adminSource).toContain("getGatewaySessionToken");
    expect(adminSource).toContain("verifyGatewaySession");
    expect(adminSource).toContain("verifiedSuperAdmin");
    expect(storeSource).toContain('account.role !== "super_admin"');
    expect(storeSource).toContain('sessionRole !== "super_admin"');
    expect(storeSource).toContain("SUPER_ADMIN_REQUIRED");
  });

  it("generates a one-time value and stores only its SHA-256 digest", () => {
    expect(adminSource).toContain("randomBytes(48)");
    expect(adminSource).toContain("tokmetric_gpt_");
    expect(adminSource).toContain('createHash("sha256")');
    expect(adminSource).toContain("digestOneTimeValue(oneTimeValue)");
    expect(storeSource).toContain("token_hash: input.tokenHash");
    expect(storeSource).not.toContain("token_plaintext");
    expect(storeSource).not.toContain("plaintext_bearer");
  });

  it("does not expose token hashes through registry views", () => {
    const viewStart = storeSource.indexOf("export function credentialView");
    const viewEnd = storeSource.indexOf("export async function productionWorkspace");
    const credentialView = storeSource.slice(viewStart, viewEnd);
    expect(credentialView).not.toContain("token_hash");
    expect(credentialView).not.toContain("tokenHash");
    expect(credentialView).not.toContain("bearer");
  });

  it("binds every operation to the production workspace and authenticated actor", () => {
    expect(storeSource).toContain("TOKMETRIC_PRODUCTION_WORKSPACE_ID");
    expect(storeSource).toContain("actor_user_id: input.actorId");
    expect(storeSource).toContain(
      "workspace_id: TOKMETRIC_PRODUCTION_WORKSPACE_ID",
    );
    expect(adminSource).toContain("WORKSPACE_CONFIRMATION_MISMATCH");
    expect(routeSource).toContain("TOKMETRIC_PRODUCTION_WORKSPACE_ID");
    expect(storeSource).toContain(
      '"ws_60488340ded94dcfab3b875ef9ae591c"',
    );
  });

  it("limits issuance and supports confirmed, audited revocation", () => {
    expect(storeSource).toContain("MAX_ACTIVE_CREDENTIALS_PER_WORKSPACE");
    expect(adminSource).toContain("ACTIVE_CREDENTIAL_LIMIT_REACHED");
    expect(adminSource).toContain("CREDENTIAL_CONFIRMATION_MISMATCH");
    expect(adminSource).toContain("tokmetric.gpt_credential.issued");
    expect(adminSource).toContain("tokmetric.gpt_credential.revoked");
    expect(storeSource).toContain('sourceChannel: "command_center"');
  });

  it("separates one-time generation from server-only database authority", () => {
    expect(storeSource).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(storeSource).not.toContain("@supabase/supabase-js");
    expect(storeSource).toContain("/rest/v1");
    expect(adminSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(componentSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(componentSource).not.toContain("serviceRoleKey");
    expect(storeSource).not.toContain("randomBytes(48)");
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
});
