import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("communication governance schema promotion", () => {
  it("promotes preference models in local and Vercel database workflows", () => {
    const promotion = source("scripts/apply-communication-governance-prisma.mjs");
    const pkg = source("package.json");
    const vercelBuild = source("scripts/vercel-build.mjs");

    expect(promotion).toContain("CommunicationPreference");
    expect(promotion).toContain("CommunicationPreferenceEvent");
    expect(promotion).toContain('@@map("communication_preferences")');
    expect(promotion).toContain('@@map("communication_preference_events")');
    expect(pkg).toContain("db:schema:promote:communications");
    expect(pkg).toContain("db:schema:check:communications");
    expect(vercelBuild).toContain("apply-communication-governance-prisma.mjs");
  });
});
