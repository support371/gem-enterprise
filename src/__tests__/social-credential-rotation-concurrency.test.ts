import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("social credential rotation concurrency controls", () => {
  it("updates encrypted credentials only when the stored rotation version is unchanged", () => {
    const lifecycleStore = source("src/lib/social-media/oauth/lifecycle-store.ts");
    expect(lifecycleStore).toContain('credential.rotated_at AS "credentialRotatedAt"');
    expect(lifecycleStore).toContain("credential.rotated_at IS NOT DISTINCT FROM");
    expect(lifecycleStore).toContain("SOCIAL_CREDENTIAL_ROTATION_CONFLICT");
    expect(lifecycleStore).toContain("concurrentRotationObserved");
  });

  it("reloads a concurrently rotated credential instead of overwriting it", () => {
    const healthRoute = source("src/app/api/social-media/connectors/health/route.ts");
    expect(healthRoute).toContain("latest.credentialRotatedAt !== stored.credentialRotatedAt");
    expect(healthRoute).toContain('error.code !== "SOCIAL_CREDENTIAL_ROTATION_CONFLICT"');
    expect(healthRoute).toContain("concurrentRotationObserved = true");
    expect(healthRoute).toContain("externalPublishingActionTaken: false");
  });
});
