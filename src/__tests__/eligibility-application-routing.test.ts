import { describe, expect, it } from "vitest";
import {
  eligibilityApplicationHref,
  eligibilityTracks,
  normalizeEligibilityTrack,
} from "@/lib/eligibilityTracks";

describe("Eligibility Application Routing & Normalization", () => {
  it("defines the exact four supported eligibility tracks", () => {
    expect(eligibilityTracks).toEqual(["individual", "company", "trust", "family_office"]);
  });

  describe("normalizeEligibilityTrack", () => {
    it.each([
      ["individual", "individual"],
      ["company", "company"],
      ["trust", "trust"],
      ["family_office", "family_office"],
    ])("normalizes valid track string '%s' to '%s'", (input, expected) => {
      expect(normalizeEligibilityTrack(input)).toBe(expected);
    });

    it("normalizes array inputs by taking the first valid track element", () => {
      expect(normalizeEligibilityTrack(["family_office", "company"])).toBe("family_office");
      expect(normalizeEligibilityTrack(["individual"])).toBe("individual");
    });

    it("returns null for absent or undefined inputs", () => {
      expect(normalizeEligibilityTrack(undefined)).toBeNull();
      expect(normalizeEligibilityTrack(null)).toBeNull();
      expect(normalizeEligibilityTrack("")).toBeNull();
    });

    it("returns null for unknown or unsupported track values", () => {
      expect(normalizeEligibilityTrack("unknown_track")).toBeNull();
      expect(normalizeEligibilityTrack("admin")).toBeNull();
      expect(normalizeEligibilityTrack("super_admin")).toBeNull();
      expect(normalizeEligibilityTrack("12345")).toBeNull();
    });

    it("returns null for malformed or non-string inputs", () => {
      expect(normalizeEligibilityTrack(123)).toBeNull();
      expect(normalizeEligibilityTrack({ track: "company" })).toBeNull();
      expect(normalizeEligibilityTrack(true)).toBeNull();
      expect(normalizeEligibilityTrack([])).toBeNull();
    });

    it("returns null for redirect-like or URL-like input attacks", () => {
      expect(normalizeEligibilityTrack("https://evil.com")).toBeNull();
      expect(normalizeEligibilityTrack("//evil.com/phish")).toBeNull();
      expect(normalizeEligibilityTrack("/app/admin")).toBeNull();
      expect(normalizeEligibilityTrack("javascript:alert(1)")).toBeNull();
      expect(normalizeEligibilityTrack("../admin")).toBeNull();
    });
  });

  describe("eligibilityApplicationHref", () => {
    it("generates deterministic and safe application URLs", () => {
      expect(eligibilityApplicationHref("individual")).toBe("/enterprise/apply?track=individual");
      expect(eligibilityApplicationHref("company")).toBe("/enterprise/apply?track=company");
      expect(eligibilityApplicationHref("trust")).toBe("/enterprise/apply?track=trust");
      expect(eligibilityApplicationHref("family_office")).toBe("/enterprise/apply?track=family_office");
    });

    it("properly encodes query parameters", () => {
      const href = eligibilityApplicationHref("family_office");
      expect(href).not.toContain(" ");
      expect(href).toBe("/enterprise/apply?track=family_office");
    });
  });

  describe("Authorization Security Safeguards", () => {
    it("ensures track parameter parsing cannot grant roles or entitlements", () => {
      // Query parameters passed to intake forms are purely informational for preselecting
      // the applicant category in public intake forms. They do not derive session state or role privileges.
      const maliciousInputs = [
        "admin",
        "super_admin",
        "role=admin",
        "entitlement=cyber",
        "approved",
      ];

      for (const input of maliciousInputs) {
        const track = normalizeEligibilityTrack(input);
        expect(track).toBeNull();
      }
    });
  });
});
