import type { AuthRole } from "@/lib/auth";

export type ManagementSurfaceId =
  | "public"
  | "identity"
  | "client"
  | "team"
  | "admin"
  | "control"
  | "apps";

export interface ManagementSurface {
  id: ManagementSurfaceId;
  label: string;
  hostname: string;
  loginPath: string;
  allowedRoles: readonly AuthRole[];
  publicDirectory: boolean;
}

export const MANAGEMENT_SURFACES: Record<ManagementSurfaceId, ManagementSurface> = {
  public: {
    id: "public",
    label: "GEM Enterprise",
    hostname: "www.gemcybersecurityassist.com",
    loginPath: "/login",
    allowedRoles: [],
    publicDirectory: true,
  },
  identity: {
    id: "identity",
    label: "GEM Identity",
    hostname: "auth.gemcybersecurityassist.com",
    loginPath: "/login",
    allowedRoles: ["client", "analyst", "admin", "super_admin", "internal"],
    publicDirectory: false,
  },
  client: {
    id: "client",
    label: "Client Portal",
    hostname: "portal.gemcybersecurityassist.com",
    loginPath: "/client-login",
    allowedRoles: ["client"],
    publicDirectory: true,
  },
  team: {
    id: "team",
    label: "Team Workspace",
    hostname: "team.gemcybersecurityassist.com",
    loginPath: "/team-login",
    allowedRoles: ["analyst"],
    publicDirectory: false,
  },
  admin: {
    id: "admin",
    label: "Admin Console",
    hostname: "admin.gemcybersecurityassist.com",
    loginPath: "/admin-login",
    allowedRoles: ["admin", "internal"],
    publicDirectory: false,
  },
  control: {
    id: "control",
    label: "Owner Control Plane",
    hostname: "control.gemcybersecurityassist.com",
    loginPath: "/super-admin-login",
    allowedRoles: ["super_admin"],
    publicDirectory: false,
  },
  apps: {
    id: "apps",
    label: "GEM App Launcher",
    hostname: "apps.gemcybersecurityassist.com",
    loginPath: "/login",
    allowedRoles: ["client", "analyst", "admin", "super_admin", "internal"],
    publicDirectory: false,
  },
};

export function normalizeRequestHostname(host: string | null | undefined): string {
  if (!host) return "";
  const first = host.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  return first.replace(/:\d+$/, "").replace(/\.$/, "");
}

export function resolveManagementSurface(
  host: string | null | undefined,
): ManagementSurface | null {
  const hostname = normalizeRequestHostname(host);
  if (!hostname) return null;
  if (hostname === "gemcybersecurityassist.com") return MANAGEMENT_SURFACES.public;
  return (
    Object.values(MANAGEMENT_SURFACES).find(
      (surface) => surface.hostname === hostname,
    ) ?? null
  );
}

export function surfaceAllowsRole(
  surface: ManagementSurface | null,
  role: AuthRole,
): boolean {
  if (!surface || surface.id === "public") return true;
  return surface.allowedRoles.includes(role);
}

export function surfaceForRole(role: AuthRole): ManagementSurface {
  if (role === "super_admin") return MANAGEMENT_SURFACES.control;
  if (role === "admin" || role === "internal") return MANAGEMENT_SURFACES.admin;
  if (role === "analyst") return MANAGEMENT_SURFACES.team;
  return MANAGEMENT_SURFACES.client;
}

export function loginPathForSurface(surface: ManagementSurface | null): string {
  return surface?.loginPath ?? "/login";
}

export function officialSurfaceUrl(
  surface: ManagementSurfaceId,
  pathname = "/",
): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${MANAGEMENT_SURFACES[surface].hostname}${normalizedPath}`;
}
