import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("canonical password recovery and session revocation", () => {
  it("keeps every emailed reset link on the canonical GEM domain", () => {
    const recovery = source("supabase/functions/gem-password-recovery/index.ts");
    expect(recovery).toContain(
      'const CANONICAL_APP_ORIGIN = "https://www.gemcybersecurityassist.com"',
    );
    expect(recovery).toContain('const RESET_PAGE_URL = `${CANONICAL_APP_ORIGIN}/reset-password`');
    expect(recovery).toContain('`${RESET_PAGE_URL}#token=${encodeURIComponent(token)}`');
    expect(recovery).not.toContain("chatgpt.site");
    expect(recovery).not.toContain("searchParams.set");
  });

  it("versions gateway sessions and rejects a stale account version", () => {
    const gateway = source("supabase/functions/gem-auth-gateway/index.ts");
    expect(gateway).toContain("sessionVersion");
    expect(gateway).toContain('kid: "gem-auth-v2"');
    expect(gateway).toContain("user.sessionVersion !== expectedSessionVersion");
    expect(gateway).toContain('"SESSION_REVOKED"');
  });

  it("increments the session version in every password-reset implementation", () => {
    const direct = source("src/lib/passwordResetService.ts");
    const recovery = source("supabase/functions/gem-password-recovery/index.ts");
    const migration = source(
      "prisma/migrations/20260713213000_password_recovery_session_revocation/migration.sql",
    );

    expect(direct).toContain("sessionVersion: { increment: 1 }");
    expect(recovery).toContain("const nextSessionVersion = user.sessionVersion + 1");
    expect(recovery).toContain('.eq("sessionVersion", user.sessionVersion)');
    expect(migration).toContain('"sessionVersion" = next_session_version');
    expect(migration).toContain("'sessionsRevoked', true");
  });

  it("keeps direct sessions authoritative at both cookie and API gates", () => {
    const auth = source("src/lib/auth.ts");
    const helpers = source("src/lib/api/auth-helpers.ts");
    expect(auth).toContain("validateDirectSessionAuthority");
    expect(auth).toContain("claims.sessionVersion !== account.sessionVersion");
    expect(auth).toContain("getSessionFromRequest");
    expect(helpers).toContain("sessionVersion: true");
    expect(helpers).toContain("reconcileSessionAuthority");
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
    expect(resetToken).toContain('setExpirationTime("15m")');
    expect(resetToken).toContain("passwordFingerprint");
    expect(handler).toContain(".min(14)");
    expect(handler).toContain("All existing sessions were signed out");
    expect(page).toContain("window.location.hash");
    expect(page).toContain("window.history.replaceState");
    expect(layout).toContain("no-referrer");
    expect(layout).toContain("index: false");
  });
});
