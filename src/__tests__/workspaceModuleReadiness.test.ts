/**
 * workspaceModuleReadiness.test.ts (WS-G)
 *
 * Honesty-focused unit tests for the WS-C workspace module readiness layer
 * (src/lib/workspaceModuleReadiness.ts) built on the WS-A capability
 * resolver. Pure functions only: no DB, no network, no secrets.
 */
import { describe, expect, it } from "vitest";
import { clientWorkspaceModules } from "@/lib/clientWorkspaceCatalog";
import {
  resolveWorkspaceModuleReadiness,
  resolveWorkspaceModuleState,
  type WorkspaceModuleReadinessContext,
} from "@/lib/workspaceModuleReadiness";

function ctx(
  overrides: Partial<WorkspaceModuleReadinessContext> = {},
): WorkspaceModuleReadinessContext {
  return {
    access: "member",
    entitlements: [],
    connectors: [],
    kycStatus: null,
    emergencyLock: false,
    controls: {
      publishingDisabled: false,
      advertisingDisabled: false,
      connectorDisabled: false,
    },
    activeProjectCount: 0,
    dataSourceKnown: true,
    ...overrides,
  };
}

const connected = [{ provider: "plaid", state: "CONNECTED" }];
const staleConnector = [{ provider: "plaid", state: "DISCONNECTED" }];
const expiredConnector = [{ provider: "plaid", state: "TOKEN_EXPIRED" }];

describe("finance / portfolio / savings fail closed without a usable connector", () => {
  it.each(["finance", "portfolio", "savings"])(
    "%s resolves PROVIDER_NOT_CONFIGURED when no connectors exist",
    (moduleId) => {
      const result = resolveWorkspaceModuleState(moduleId, ctx());
      expect(result.state).toBe("PROVIDER_NOT_CONFIGURED");
      expect(result.reasons.length).toBeGreaterThan(0);
    },
  );

  it.each(["finance", "portfolio", "savings"])(
    "%s stays fail-closed when connectors are in non-configured states",
    (moduleId) => {
      const result = resolveWorkspaceModuleState(moduleId, ctx({ connectors: staleConnector }));
      expect(result.state).toBe("PROVIDER_NOT_CONFIGURED");
    },
  );

  it("never fabricates balances: the readiness input keeps providerHealthy null when unconfigured", () => {
    const input = resolveWorkspaceModuleReadiness("finance", ctx());
    expect(input.providerNeeded).toBe(true);
    expect(input.providerConfigured).toBe(false);
    expect(input.providerHealthy).toBeNull();
  });

  it("a configured-but-unhealthy connector resolves DEGRADED, never LIVE", () => {
    const result = resolveWorkspaceModuleState("finance", ctx({ connectors: expiredConnector }));
    expect(result.state).toBe("DEGRADED");
  });

  it("a healthy connector without a ready backend resolves SURFACE_AVAILABLE, not LIVE", () => {
    const result = resolveWorkspaceModuleState("portfolio", ctx({ connectors: connected }));
    expect(result.state).toBe("SURFACE_AVAILABLE");
  });
});

describe("KYC-gated modules", () => {
  it("digital_finance requires KYC: restricted while KYC is pending", () => {
    const result = resolveWorkspaceModuleState(
      "digital_finance",
      ctx({ connectors: connected, kycStatus: "pending" }),
    );
    expect(result.state).toBe("RESTRICTED");
    expect(result.reasons.join(" ").toLowerCase()).toContain("kyc");
  });

  it("digital_finance is restricted with no KYC record at all", () => {
    const result = resolveWorkspaceModuleState(
      "digital_finance",
      ctx({ connectors: connected, kycStatus: null }),
    );
    expect(result.state).toBe("RESTRICTED");
  });

  it("digital_finance with approved KYC and a healthy connector is not restricted and not live", () => {
    const result = resolveWorkspaceModuleState(
      "digital_finance",
      ctx({ connectors: connected, kycStatus: "approved" }),
    );
    expect(result.state).toBe("SURFACE_AVAILABLE");
  });

  it("compliance requires KYC: restricted until the application is approved", () => {
    const blocked = resolveWorkspaceModuleState("compliance", ctx({ kycStatus: "in_review" }));
    expect(blocked.state).toBe("RESTRICTED");

    const approved = resolveWorkspaceModuleState("compliance", ctx({ kycStatus: "APPROVED" }));
    expect(approved.state).not.toBe("RESTRICTED");
    expect(approved.state).toBe("SURFACE_AVAILABLE");
  });
});

describe("setup-gated modules", () => {
  it("threat_monitoring stays SETUP_REQUIRED until enrollment is recorded", () => {
    const result = resolveWorkspaceModuleState("threat_monitoring", ctx());
    expect(result.state).toBe("SETUP_REQUIRED");
    expect(result.reasons.join(" ").toLowerCase()).toContain("setup");
  });

  it("automations has no route in this build and resolves UNAVAILABLE", () => {
    const result = resolveWorkspaceModuleState("automations", ctx());
    expect(result.state).toBe("UNAVAILABLE");
  });

  it("digital_services is SETUP_REQUIRED while publishing controls are locked", () => {
    const result = resolveWorkspaceModuleState(
      "digital_services",
      ctx({ controls: { publishingDisabled: true, advertisingDisabled: false, connectorDisabled: false } }),
    );
    expect(result.state).toBe("SETUP_REQUIRED");
  });
});

describe("emergency lock", () => {
  it("emergency lock resolves to RESTRICTED on every module", () => {
    for (const moduleId of ["finance", "compliance", "threat_monitoring", "integrations", "journey"]) {
      const result = resolveWorkspaceModuleState(moduleId, ctx({ emergencyLock: true }));
      expect(result.state).toBe("RESTRICTED");
      expect(result.reasons.join(" ").toLowerCase()).toContain("emergency lock");
    }
  });

  it("emergency lock outranks gateway-mode honesty for provider-backed modules", () => {
    const result = resolveWorkspaceModuleState(
      "finance",
      ctx({ emergencyLock: true, dataSourceKnown: false }),
    );
    expect(result.state).toBe("RESTRICTED");
  });
});

describe("gateway mode honesty (dataSourceKnown = false)", () => {
  it("provider-backed modules resolve SURFACE_AVAILABLE instead of guessing", () => {
    const result = resolveWorkspaceModuleState("savings", ctx({ dataSourceKnown: false }));
    expect(result.state).toBe("SURFACE_AVAILABLE");
    expect(result.reasons.join(" ")).toContain("not visible in this session");
  });

  it("KYC-gated modules resolve SURFACE_AVAILABLE in gateway mode rather than assuming a KYC verdict", () => {
    const result = resolveWorkspaceModuleState(
      "digital_finance",
      ctx({ dataSourceKnown: false, kycStatus: null }),
    );
    expect(result.state).toBe("SURFACE_AVAILABLE");
    expect(result.reasons.join(" ")).toContain("not visible in this session");
  });

  it("non-DB-dependent modules still resolve through the normal gates in gateway mode", () => {
    // threat_monitoring has no provider/KYC/entitlement dependency, so the
    // normal resolver still applies and it stays setup-required.
    const result = resolveWorkspaceModuleState("threat_monitoring", ctx({ dataSourceKnown: false }));
    expect(result.state).toBe("SETUP_REQUIRED");
  });
});

describe("a route existing never means LIVE", () => {
  it("no catalog module resolves LIVE even with every signal green", () => {
    const generous = ctx({
      access: "owner",
      entitlements: clientWorkspaceModules
        .map((module) => module.entitlementSlug)
        .filter((slug): slug is string => Boolean(slug)),
      connectors: connected,
      kycStatus: "approved",
    });

    const live: string[] = [];
    for (const module of clientWorkspaceModules) {
      const result = resolveWorkspaceModuleState(module.id, generous);
      if (result.state === "LIVE") live.push(module.id);
      expect(["SURFACE_AVAILABLE", "SETUP_REQUIRED", "UNAVAILABLE"]).toContain(result.state);
    }
    expect(live).toEqual([]);
  });

  it("the readiness input never asserts backendReady from catalog data", () => {
    for (const module of clientWorkspaceModules) {
      const input = resolveWorkspaceModuleReadiness(module.id, ctx());
      expect(input.backendReady).toBe(false);
    }
  });

  it("resolveWorkspaceModuleState never returns LIVE in the fail-closed fixtures above", () => {
    expect(resolveWorkspaceModuleState("finance", ctx()).state).not.toBe("LIVE");
    expect(
      resolveWorkspaceModuleState("finance", ctx({ connectors: connected, emergencyLock: true })).state,
    ).not.toBe("LIVE");
  });
});
