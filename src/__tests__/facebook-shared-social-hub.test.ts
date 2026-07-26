import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Facebook shared social connector integration", () => {
  const dashboard = source(
    "src/components/FacebookOperations/FacebookDashboard.tsx",
  );
  const bridge = source("src/app/api/facebook/connector/route.ts");

  it("uses the canonical social connector inventory and Meta OAuth start route", () => {
    expect(dashboard).toContain("/api/social-media/connectors?workspaceId=");
    expect(dashboard).toContain("/api/social-media/oauth/META/start?");
    expect(dashboard).not.toContain("/api/facebook/connector/authorize");
    expect(dashboard).not.toContain("/api/facebook/connector/status");
  });

  it("preserves the workspace through the shared OAuth callback", () => {
    expect(dashboard).toContain(
      "`/facebook/operations?workspace=${encodeURIComponent(workspaceId)}`",
    );
    expect(bridge).toContain(
      "`/facebook/operations?workspace=${encodeURIComponent(workspaceId)}`",
    );
  });

  it("does not recreate a Facebook-specific OAuth state or credential store", () => {
    for (const forbidden of [
      "createClient(",
      "facebook_oauth_states",
      "meta_connectors",
      "ENCRYPTION_KEY",
      "META_APP_SECRET",
      "createCipheriv",
    ]) {
      expect(bridge).not.toContain(forbidden);
    }
    expect(bridge).toContain("listSocialConnectors");
    expect(bridge).toContain("/api/social-media/oauth/META/start");
  });

  it("removes the duplicate callback implementation", () => {
    expect(
      existsSync(
        join(process.cwd(), "src/app/api/facebook/connector/callback.ts"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(
          process.cwd(),
          "src/app/api/social-media/oauth/[provider]/callback/route.ts",
        ),
      ),
    ).toBe(true);
  });
});
