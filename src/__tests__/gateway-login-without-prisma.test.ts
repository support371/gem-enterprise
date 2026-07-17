import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const loginRouteSource = readFileSync(
  "src/app/api/auth/login/route.ts",
  "utf8",
);
const authSource = readFileSync("src/lib/auth.ts", "utf8");

describe("gateway-mode login boundary", () => {
  it("stores the signed Supabase gateway token without a Prisma lookup", () => {
    const gatewayStart = loginRouteSource.indexOf(
      "const result = await loginWithGateway(email, password);",
    );
    const gatewayEnd = loginRouteSource.indexOf(
      "} catch (error)",
      gatewayStart,
    );
    const gatewayBlock = loginRouteSource.slice(gatewayStart, gatewayEnd);

    expect(gatewayStart).toBeGreaterThan(-1);
    expect(gatewayBlock).toContain("wrapGatewayToken(result.token)");
    expect(gatewayBlock).toContain("resolveAccessDestination(result.session)");
    expect(gatewayBlock).not.toContain("findCanonicalUser");
    expect(gatewayBlock).not.toContain("db.user");
    expect(gatewayBlock).not.toContain("signSession");
  });

  it("revalidates wrapped gateway sessions through Supabase in gateway mode", () => {
    const resolverStart = authSource.indexOf(
      "async function resolveSessionToken",
    );
    const resolverEnd = authSource.indexOf(
      "export async function getSessionCookieValue",
      resolverStart,
    );
    const resolver = authSource.slice(resolverStart, resolverEnd);

    expect(resolver).toContain("unwrapGatewayToken(token)");
    expect(resolver).toContain("verifyGatewaySession(gatewayToken)");
    expect(resolver).toContain(
      "if (shouldUseSupabaseGateway()) return gatewaySession;",
    );
    expect(resolver.indexOf("shouldUseSupabaseGateway()"))
      .toBeLessThan(resolver.indexOf("validateDirectSessionAuthority"));
  });

  it("keeps direct database authority checks for local database mode", () => {
    expect(authSource).toContain("validateDirectSessionAuthority");
    expect(loginRouteSource).toContain("if (!shouldUseSupabaseGateway())");
    expect(loginRouteSource).toContain("return await localLogin");
  });
});
