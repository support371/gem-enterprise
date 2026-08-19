export const ATR_OPERATIONAL_CONFIG = {
  product: "Alliance Trust Realty",
  division: "real-estate",
  operationalOwner: "GEM Cybersecurity & Monitoring Assist",
  operationalStatus: "ACTIVE",
  ownershipMode: "GEM_OPERATIONAL_CONTROL",
  primaryPath: "/atr",
  publicOrigin: "https://www.gemcybersecurityassist.com/atr",
  managedHost: "atr.gemcybersecurityassist.com",
  standaloneDeployment:
    "https://shrill-sympathetic-runtimes-d7mh-2r3r75lsr.vercel.app",
  disputedDomain: "alliancetrustrealty.com",
  domainStatus: "PENDING_REGISTRAR_CONTROL",
  domainUsePolicy:
    "Do not represent the disputed domain as controlled until registrar and DNS control are restored.",
  fallbackPolicy:
    "Keep Alliance Trust Realty operational through GEM-controlled routes regardless of external domain status.",
} as const;

export type AtrOperationalStatus =
  (typeof ATR_OPERATIONAL_CONFIG)["operationalStatus"];

export function normalizeAtrHost(host: string | null | undefined): string {
  if (!host) return "";
  return host.trim().toLowerCase().split(":")[0] ?? "";
}

export function isAtrManagedHost(host: string | null | undefined): boolean {
  return normalizeAtrHost(host) === ATR_OPERATIONAL_CONFIG.managedHost;
}

export function toAtrInternalPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/") return ATR_OPERATIONAL_CONFIG.primaryPath;
  if (
    normalized === ATR_OPERATIONAL_CONFIG.primaryPath ||
    normalized.startsWith(`${ATR_OPERATIONAL_CONFIG.primaryPath}/`)
  ) {
    return normalized;
  }

  return `${ATR_OPERATIONAL_CONFIG.primaryPath}${normalized}`;
}
