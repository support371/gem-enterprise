import { describe, expect, it } from "vitest";
import {
  ATR_OPERATIONAL_CONFIG,
  isAtrManagedHost,
  normalizeAtrHost,
  toAtrInternalPath,
} from "@/lib/atrOperationalConfig";

describe("Alliance Trust Realty GEM active mode", () => {
  it("keeps the division operational through a GEM-controlled public route", () => {
    expect(ATR_OPERATIONAL_CONFIG.operationalStatus).toBe("ACTIVE");
    expect(ATR_OPERATIONAL_CONFIG.primaryPath).toBe("/atr");
    expect(ATR_OPERATIONAL_CONFIG.publicOrigin).toBe(
      "https://www.gemcybersecurityassist.com/atr",
    );
  });

  it("does not represent the disputed registrar domain as active GEM control", () => {
    expect(ATR_OPERATIONAL_CONFIG.disputedDomain).toBe("alliancetrustrealty.com");
    expect(ATR_OPERATIONAL_CONFIG.domainStatus).toBe("PENDING_REGISTRAR_CONTROL");
  });

  it("recognizes the GEM-managed ATR host with or without a port", () => {
    expect(isAtrManagedHost("atr.gemcybersecurityassist.com")).toBe(true);
    expect(isAtrManagedHost("ATR.GEMCYBERSECURITYASSIST.COM:443")).toBe(true);
    expect(normalizeAtrHost("ATR.GEMCYBERSECURITYASSIST.COM:443")).toBe(
      "atr.gemcybersecurityassist.com",
    );
    expect(isAtrManagedHost("alliancetrustrealty.com")).toBe(false);
  });

  it("maps clean managed-host paths into the existing ATR route family", () => {
    expect(toAtrInternalPath("/")).toBe("/atr");
    expect(toAtrInternalPath("/buy")).toBe("/atr/buy");
    expect(toAtrInternalPath("/properties")).toBe("/atr/properties");
    expect(toAtrInternalPath("/atr/invest")).toBe("/atr/invest");
  });
});
