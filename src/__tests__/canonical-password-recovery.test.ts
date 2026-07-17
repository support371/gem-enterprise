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
    expect(forgot).toContain('const DEFAULT_APP_URL = "https://www.gemcybersecurityassist.com"');
    expect(forgot).toContain('new URL("/reset-password", appBaseUrl())');
    expect(forgot).toContain("resetUrl.hash");
    expect(forgot).toContain("gatewayRecoveryDisabled: true");
    expect(forgot).not.toContain("requestPasswordRecoveryGateway");
    expect(service).not.toContain("completePasswordRecoveryGateway");
  });

  it("uses a versioned gateway session without a Prisma lookup", () => {
    const login = source("src/app/api/auth/login/route.ts");
    expect(login).toContain("loginWithGateway");
    expect(login).toContain("validGatewaySession");
    expect(login).toContain("issueGatewaySession(result.session, result.token)");
    expect(login).toContain("wrapGatewayToken(token)");
    const gatewayBlock = login.slice(login.indexOf("const result = await loginWithGateway"));
    expect(gatewayBlock).not.toContain("findCanonicalUser(");
    expect(gatewayBlock).not.toContain("db.user.findUnique");
  });

  it("rejects unversioned and revoked gateway sessions", () => {
    const auth = source("src/lib/auth.ts");
    const gateway = source("supabase/functions/gem-auth-gateway/index.ts");
    expect(auth).toContain("validSessionVersion(session.sessionVersion)");
    expect(auth).toContain("validGatewaySession(gatewaySession)");
    expect(gateway).toContain("expectedSessionVersion !== user.sessionVersion");
    expect(gateway).toContain('"SESSION_REVOKED"');
    expect(gateway).toContain("legacyUnversionedSessionsAccepted: false");
  });

  it("centralizes revocation in password-change database triggers", () => {
    const direct = source("src/lib/passwordResetService.ts");
    const migration = source("prisma/migrations/20260713213000_password_recovery_session_revocation/migration.sql");
    const hardening = source("prisma/migrations/20260713214600_revoke_password_trigger_rpc_execute/migration.sql");
    expect(direct).toContain("sessionVersion: user.sessionVersion");
    expect(direct).toContain("updated.sessionVersion <= user.sessionVersion");
    expect(migration).toContain("gem_increment_session_version_on_password_change");
    expect(migration).toContain('NEW."sessionVersion" := OLD."sessionVersion" + 1');
    expect(migration).toContain("gem_audit_session_revocation_on_password_change");
    expect(hardening).toContain("FROM PUBLIC");
    expect(hardening).toContain("FROM anon");
    expect(hardening).toContain("FROM authenticated");
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
    expect(readiness).toContain("emailDeliveryConfigured: emailDelivery.configured");
    expect(readiness).toContain('transportVerification: "on_demand"');
    expect(readiness).toContain("verificationRequiresAdmin: true");
    expect(readiness).toContain("gatewayRecoveryDisabled: true");
    expect(readiness).toContain("legacyGatewaySessionsAccepted: false");
    expect(readiness).not.toContain("SMTP_PASS");
    expect(readiness).not.toContain("SMTP_USER");
  });

  it("protects no-send transport verification behind the administrator gate", () => {
    const verification = source("src/app/api/auth/recovery-readiness/verify/route.ts");
    expect(verification).toContain("requireAdmin()");
    expect(verification).toContain("verifyMailTransport()");
    expect(verification).toContain("sentMessage: false");
    expect(verification).toContain("credentialsExposed: false");
    expect(verification).not.toContain("sendMail(");
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
