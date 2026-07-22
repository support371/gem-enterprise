import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("social credential rotation concurrency controls", () => {
  it("claims a connector before any provider refresh request", () => {
    const lifecycleStore = source("src/lib/social-media/oauth/lifecycle-store.ts");
    const healthRoute = source("src/app/api/social-media/connectors/health/route.ts");

    expect(lifecycleStore).toContain("claimSocialConnectorCredentialRefresh");
    expect(lifecycleStore).toContain("SOCIAL_CREDENTIAL_REFRESH_IN_PROGRESS");
    expect(lifecycleStore).toContain("tokenRefreshClaimExpiresAt");
    expect(lifecycleStore).toContain("credential.rotated_at IS NOT DISTINCT FROM");
    expect(lifecycleStore).toContain("SOCIAL_CREDENTIAL_REFRESH_CLAIM_LOST");
    expect(lifecycleStore).toContain("releaseSocialConnectorCredentialRefreshClaim");

    expect(healthRoute.indexOf("claimSocialConnectorCredentialRefresh({")).toBeGreaterThan(-1);
    expect(healthRoute.indexOf("refreshSocialAccessToken({")).toBeGreaterThan(
      healthRoute.indexOf("claimSocialConnectorCredentialRefresh({"),
    );
    expect(healthRoute).toContain("refreshClaimId");
  });

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

  it("closes malformed refresh failures and protects error and audit paths", () => {
    const healthRoute = source("src/app/api/social-media/connectors/health/route.ts");
    expect(healthRoute).toContain('lifecycle.lifecycle === "EXPIRED_REFRESHABLE"');
    expect(healthRoute).toContain('? ("TOKEN_EXPIRED" as const)');
    expect(healthRoute).toContain('response.headers.set("Cache-Control", "no-store")');
    expect(healthRoute).toContain("auditableWorkspaceId = workspaceId");
    expect(healthRoute.indexOf("auditableWorkspaceId = workspaceId")).toBeGreaterThan(
      healthRoute.indexOf("requireWorkspaceAccess(workspaceId, session)"),
    );
    expect(healthRoute).toContain("if (auditableWorkspaceId)");
    expect(healthRoute).toContain("releaseSocialConnectorCredentialRefreshClaim({");
  });
});
