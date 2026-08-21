import { describe, expect, it } from "vitest";
import {
  MANAGEMENT_SURFACES,
  isManagementAccessPath,
  loginPathForSurface,
  normalizeRequestHostname,
  officialSurfaceUrl,
  resolveManagementSurface,
  surfaceAllowsRole,
  surfaceForRole,
} from "@/lib/managementSurfaces";

describe("management surface registry", () => {
  it("normalizes forwarded host values without trusting paths or ports", () => {
    expect(normalizeRequestHostname("ADMIN.GEMCYBERSECURITYASSIST.COM:443"))
      .toBe("admin.gemcybersecurityassist.com");
    expect(normalizeRequestHostname("portal.gemcybersecurityassist.com, proxy.internal"))
      .toBe("portal.gemcybersecurityassist.com");
    expect(normalizeRequestHostname(null)).toBe("");
  });

  it("recognizes only the explicit GEM surface allowlist", () => {
    expect(resolveManagementSurface("www.gemcybersecurityassist.com")?.id).toBe("public");
    expect(resolveManagementSurface("gemcybersecurityassist.com")?.id).toBe("public");
    expect(resolveManagementSurface("portal.gemcybersecurityassist.com")?.id).toBe("client");
    expect(resolveManagementSurface("admin.gemcybersecurityassist.com")?.id).toBe("admin");
    expect(resolveManagementSurface("control.gemcybersecurityassist.com")?.id).toBe("control");
    expect(resolveManagementSurface("admin.attacker.example")).toBeNull();
  });

  it("keeps client, team, admin, and owner authority separated", () => {
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.client, "client")).toBe(true);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.client, "super_admin")).toBe(false);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.team, "analyst")).toBe(true);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.team, "admin")).toBe(false);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.admin, "admin")).toBe(true);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.admin, "super_admin")).toBe(false);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.control, "super_admin")).toBe(true);
    expect(surfaceAllowsRole(MANAGEMENT_SURFACES.control, "admin")).toBe(false);
  });

  it("derives the destination surface from server-authoritative roles", () => {
    expect(surfaceForRole("client").id).toBe("client");
    expect(surfaceForRole("analyst").id).toBe("team");
    expect(surfaceForRole("admin").id).toBe("admin");
    expect(surfaceForRole("internal").id).toBe("admin");
    expect(surfaceForRole("super_admin").id).toBe("control");
  });

  it("provides stable host entry routes without publishing owner access", () => {
    expect(loginPathForSurface(MANAGEMENT_SURFACES.client)).toBe("/client-login");
    expect(loginPathForSurface(MANAGEMENT_SURFACES.control)).toBe("/super-admin-login");
    expect(MANAGEMENT_SURFACES.control.publicDirectory).toBe(false);
    expect(MANAGEMENT_SURFACES.admin.publicDirectory).toBe(false);
    expect(officialSurfaceUrl("client", "/app/workspace"))
      .toBe("https://portal.gemcybersecurityassist.com/app/workspace");
  });

  it("keeps every management sign-in outside the public-site chrome", () => {
    expect(isManagementAccessPath("/login")).toBe(true);
    expect(isManagementAccessPath("/client-login")).toBe(true);
    expect(isManagementAccessPath("/team-login")).toBe(true);
    expect(isManagementAccessPath("/admin-login")).toBe(true);
    expect(isManagementAccessPath("/super-admin-login")).toBe(true);
    expect(isManagementAccessPath("/")).toBe(false);
    expect(isManagementAccessPath("/services")).toBe(false);
  });
});
