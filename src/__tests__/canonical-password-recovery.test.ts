import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("canonical password recovery and session revocation", () => {
  it("keeps recovery entirely on the canonical GEM application", () => {
    const forgot = source("src/app/api/auth/forgot-password/route.ts");
    const service = source("src/lib/passwordResetService.ts");

    expect(forgot).toContain(
      'const DEFAULT_APP_URL = "https://www.gemcybersecurityassist.com"',
    );
    expect(forgot).toContain('new URL("/reset-password", appBaseUrl())');
    expect(forgot).toContain("resetUrl.hash");
    expect(forgot).toContain("gatewayRecoveryDisabled: true");
    expect(forgot).not.toContain("requestPasswordRecoveryGateway");
    expect(forgot).not.toContain("chatgpt.site");
    expect(service).not.toContain("completePasswordRecoveryGateway");
  });

  it("uses the old gateway only for credential verification and issues a canonical JWT", () => {
    const login = source("src/app/api/auth/login/route.ts");
    expect(login).toContain("loginWithGateway");
    expect(login).toContain("gateway_credential_verification");
    expect(login).toContain("signSession");
    expect(login).not.toContain("wrapGatewayToken");
  });

  it("rejects legacy wrapped gateway sessions without a database version", () => {
    const auth = source("src/lib/auth.ts");
    expect(auth).toContain("Gateway tokens issued before Release 3");
    expect(auth).toContain("validSessionVersion(gatewaySession.sessionVersion)");
    expect(auth).toContain("return validateDirectSessionAuthority(gatewaySession)");
  });

  it("centralizes revocation in password-change database triggers", () => {
    const direct = source("src/lib/passwordResetService.ts");
    const migration = source(
      "prisma/migrations/20260713213000_password_recovery_session_revocation/migration.sql",
    );

    expect(direct).toContain("sessionVersion: user.sessionVersion");
    expect(direct).toContain("updated.sessionVersion <= user.sessionVersion");
    expect(migration).toContain("gem_increment_session_version_on_password_change");
    expect(migration).toContain('NEW."sessionVersion" := OLD."sessionVersion" + 1');
    expect(migration).toContain("gem_audit_session_revocation_on_password_change");
    expect(migration).toContain("'sessionsRevoked', true");
  });

  it("keeps direct sessions authoritative at cookie, proxy, and API gates", () => {
    const auth = source("src/lib/auth.ts");
    const helpers = source("src/lib/api/auth-helpers.ts");
    const proxy = source("src/proxy.ts");
    expect(auth).toContain("validateDirectSessionAuthority");
    expect(auth).toContain("claims.sessionVersion !== account.sessionVersion");
    expect(auth).toContain("getSessionFromRequest");
    expect(helpers).toContain("sessionVersion: true");
    expect(helpers).toContain("reconcileSessionAuthority");
    expect(proxy).toContain("getSessionFromRequest");
  });

  it("publishes a secret-free readiness contract", () => {
    const readiness = source("src/app/api/auth/recovery-readiness/route.ts");
    expect(readiness).toContain('resetPageOrigin: "https://www.gemcybersecurityassist.com"');
    expect(readiness).toContain('tokenTransport: "url_fragment"');
    expect(readiness).toContain("emailDeliveryConfigured: isMailDeliveryConfigured()");
    expect(readiness).toContain("gatewayRecoveryDisabled: true");
    expect(readiness).toContain("legacyGatewaySessionsAccepted: false");
  });

  it("promotes the session-version field before Prisma validation and generation", () => {
    const promotion = source("scripts/apply-auth-session-prisma.mjs");
    const build = source("scripts/vercel-build.mjs");
    const packageJson = source("package.json");
    expect(promotion).toContain("sessionVersion");
    expect(build).toContain('run("node", ["scripts/apply-auth-session-prisma.mjs"], env)');
    expect(packageJson).toContain('"db:schema:promote:auth"');
    expect(packageJson).toContain('"db:schema:check:auth"');
  });

  it("retains single-use, expiry, password-policy, and fragment protections", () => {
    const resetToken = source("src/lib/passwordReset.ts");
    const handler = source("src/lib/passwordResetHandler.ts");
    const page = source("src/app/reset-password/page.tsx");
    const layout = source("src/app/reset-password/layout.tsx");
    expect(resetToken).toContain("const RESET_TTL_SECONDS = 15 * 60");
    expect(resetToken).toContain('setExpirationTime(`${RESET_TTL_SECONDS}s`)');
    expect(resetToken).toContain("passwordFingerprint");
    expect(handler).toContain(".min(14)");
    expect(handler).toContain("All existing sessions were signed out");
    expect(page).toContain("window.location.hash");
    expect(page).toContain("window.history.replaceState");
    expect(layout).toContain("no-referrer");
    expect(layout).toContain("index: false");
  });
});
