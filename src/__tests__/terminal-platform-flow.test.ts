import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const scriptPath = join(root, "scripts/gem-platform-flow.mjs");
const documentationPath = join(root, "docs/terminal-platform-flow.md");

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("GEM terminal platform flow", () => {
  it("emits a machine-readable audit without exposing secret values", () => {
    const result = spawnSync(
      process.execPath,
      [scriptPath, "--audit", "--json"],
      {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          META_APP_SECRET: "meta-secret-must-not-appear",
          X_CLIENT_SECRET: "x-secret-must-not-appear",
          VIDEO_RENDER_CALLBACK_SECRET: "video-secret-must-not-appear",
          SOCIAL_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
        },
      },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const report = JSON.parse(result.stdout) as {
      core: Array<{ id: string; ready: boolean; missing: string[] }>;
      providers: Array<{
        id: string;
        state: string;
        missingConfiguration: string[];
      }>;
      safety: { message: string };
    };
    expect(report.core.some((group) => group.id === "video")).toBe(true);
    expect(report.providers.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(["TIKTOK", "META", "X", "LINKEDIN", "YOUTUBE", "NEXTDOOR", "INDEED"]),
    );
    expect(report.safety.message).toContain("never enables publishing gates");
    expect(result.stdout).not.toContain("meta-secret-must-not-appear");
    expect(result.stdout).not.toContain("x-secret-must-not-appear");
    expect(result.stdout).not.toContain("video-secret-must-not-appear");
  });

  it("keeps migrations explicit and live publishing owner-controlled", () => {
    const script = source(scriptPath);
    const documentation = source(documentationPath);

    expect(script).toContain('const shouldMigrate = args.has("--migrate")');
    expect(script).not.toContain('SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "true"');
    expect(script).not.toContain('TOKMETRIC_LIVE_PUBLISHING_ENABLED", "true"');
    expect(documentation).toContain("does not apply database migrations by default");
    expect(documentation).toContain("cannot lawfully or technically complete");
    expect(documentation).toContain("OAuth consent");
    expect(documentation).toContain("no external publishing during tests or review");
  });

  it("opens the canonical integration, social, content studio, and TokMetric surfaces", () => {
    const script = source(scriptPath);
    expect(script).toContain('"/app/command-center/integrations"');
    expect(script).toContain('"/app/command-center/social-media"');
    expect(script).toContain('"/app/command-center/social-media/content-studio"');
    expect(script).toContain('"/app/command-center/tokmetric"');
  });
});
