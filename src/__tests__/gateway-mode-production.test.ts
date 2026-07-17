import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Supabase gateway-mode session authority", () => {
  it("binds gateway tokens to the current session version", () => {
    const gateway = source("supabase/functions/gem-auth-gateway/index.ts");
    expect(gateway).toContain('kid: "gem-auth-v2"');
    expect(gateway).toContain("sessionVersion,");
    expect(gateway).toContain("expectedSessionVersion !== user.sessionVersion");
    expect(gateway).toContain('"SESSION_REVOKED"');
    expect(gateway).toContain("legacyUnversionedSessionsAccepted: false");
  });

  it("uses the authoritative wrapped gateway token without a Prisma lookup", () => {
    const login = source("src/app/api/auth/login/route.ts");
    const gatewayBlock = login.slice(login.indexOf("const result = await loginWithGateway"));
    expect(gatewayBlock).toContain("issueGatewaySession(result.session, result.token)");
    expect(gatewayBlock).toContain("wrapGatewayToken(token)");
    expect(gatewayBlock).not.toContain("findCanonicalUser(");
    expect(gatewayBlock).not.toContain("db.user.findUnique");
  });

  it("revalidates gateway sessions and rejects local cookies in gateway mode", () => {
    const auth = source("src/lib/auth.ts");
    expect(auth).toContain("return validGatewaySession(gatewaySession) ? gatewaySession : null;");
    expect(auth).toContain("if (!local || shouldUseSupabaseGateway()) return null;");
  });

  it("retains the gateway source during canonical builds", () => {
    const ignore = source(".vercelignore");
    expect(ignore).toContain("!supabase/functions/gem-auth-gateway/");
    expect(ignore).toContain("!supabase/functions/gem-auth-gateway/index.ts");
  });
});
