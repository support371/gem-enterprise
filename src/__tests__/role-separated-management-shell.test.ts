import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("role-separated management shell", () => {
  it("provides distinct client, team, admin, and platform-owner entrances", () => {
    expect(source("src/app/client-login/page.tsx")).toContain('portal="client"');
    expect(source("src/app/team-login/page.tsx")).toContain('portal="team"');
    expect(source("src/app/admin-login/page.tsx")).toContain('portal="admin"');
    expect(source("src/app/super-admin-login/page.tsx")).toContain('portal="super_admin"');
  });

  it("never submits a requested role as part of authentication", () => {
    const portal = source("src/components/auth/RoleLoginPortal.tsx");
    expect(portal).toContain('body: JSON.stringify({ email: data.email, password: data.password })');
    expect(portal).toContain("canUseRequestedDestination(body.role, requested)");
    expect(portal).not.toMatch(/JSON\.stringify\(\{[^}]*role:/);
  });

  it("uses a POST logout and clears the cookie even if audit persistence fails", () => {
    const button = source("src/components/auth/LogoutButton.tsx");
    const route = source("src/app/api/auth/logout/route.ts");
    const layout = source("src/app/app/layout.tsx");
    expect(button).toContain('method: "POST"');
    expect(button).not.toContain('href="/api/auth/logout"');
    expect(layout).toContain('if (role === "super_admin") return "/super-admin-login?signedOut=1"');
    expect(route).toContain("audit persistence failed");
    expect(route).toContain("clearSessionCookie(response)");
  });

  it("keeps owner forms unobstructed and labels gateway permissions", () => {
    const layout = source("src/app/app/layout.tsx");
    const gateway = source("supabase/functions/gem-workspace-gateway/index.ts");
    expect(layout).toContain('pathname.startsWith("/app/admin/workspace-access")');
    expect(layout).toContain("!hideFloatingSupport ? <AIChatWidget");
    expect(gateway).toContain('label:`${action} ${scope}`');
  });

  it("persists support sessions through the authenticated gateway when Prisma is unavailable", () => {
    const resolver = source("src/lib/support/support-session-store.ts");
    const gateway = source("supabase/functions/gem-workspace-gateway/index.ts");
    expect(resolver).toContain('auth.authSource !== "supabase_gateway"');
    expect(resolver).toContain('"support_session"');
    expect(gateway).toContain('if(action==="support_session")');
    expect(gateway).toContain('eq("userId",u.id)');
  });
});
