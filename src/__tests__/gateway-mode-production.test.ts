import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Supabase gateway-mode production boundary", () => {
  it("binds gateway tokens to the current account session version", () => {
    const gateway = source("supabase/functions/gem-auth-gateway/index.ts");

    expect(gateway).toContain("sessionVersion,");
    expect(gateway).toContain('kid: "gem-auth-v2"');
    expect(gateway).toContain(
      "expectedSessionVersion !== user.sessionVersion",
    );
    expect(gateway).toContain('"SESSION_REVOKED"');
    expect(gateway).toContain("legacyUnversionedSessionsAccepted: false");
  });

  it("issues the authoritative wrapped gateway token without a Prisma lookup", () => {
    const login = source("src/app/api/auth/login/route.ts");
    const gatewayBlock = login.slice(login.indexOf("try {\n    const result = await loginWithGateway"));

    expect(gatewayBlock).toContain("issueGatewaySession(result.session, result.token)");
    expect(gatewayBlock).toContain("wrapGatewayToken(token)");
    expect(gatewayBlock).not.toContain("findCanonicalUser(");
    expect(gatewayBlock).not.toContain("db.user.findUnique");
  });

  it("validates wrapped sessions through the gateway and rejects local cookies in gateway mode", () => {
    const auth = source("src/lib/auth.ts");

    expect(auth).toContain(
      "return validGatewaySession(gatewaySession) ? gatewaySession : null;",
    );
    expect(auth).toContain(
      "if (!local || shouldUseSupabaseGateway()) return null;",
    );
  });

  it("persists public contacts through the gateway before any session or Prisma access", () => {
    const contact = source("src/app/api/contact/route.ts");
    const gatewayIndex = contact.indexOf("if (shouldUseSupabaseGateway())");
    const sessionIndex = contact.indexOf("const session = await getSession()");

    expect(gatewayIndex).toBeGreaterThan(0);
    expect(sessionIndex).toBeGreaterThan(gatewayIndex);
    expect(contact).toContain("submitContactGateway({");

    const client = source("src/lib/contact-gateway.ts");
    expect(client).toContain("/gem-contact-gateway");
    expect(client).toContain('action: "submit"');
    expect(client).toContain('cache: "no-store"');
  });
});
