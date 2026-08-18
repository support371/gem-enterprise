import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const script = readFileSync(
  join(root, "ops/owner-flow/run-all-windows.ps1"),
  "utf8",
);
const entry = readFileSync(
  join(root, "ops/owner-flow/run-all-windows-entry.ps1"),
  "utf8",
);
const documentation = readFileSync(
  join(root, "ops/owner-flow/README.md"),
  "utf8",
);
const example = readFileSync(
  join(root, "ops/owner-flow/social-providers.example.json"),
  "utf8",
);
const gitignore = readFileSync(join(root, ".gitignore"), "utf8");

describe("unified GEM owner terminal flow", () => {
  it("keeps every external publishing gate disabled", () => {
    for (const name of [
      "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED",
      "META_SOCIAL_PUBLISHING_ENABLED",
      "X_SOCIAL_PUBLISHING_ENABLED",
      "NEXTDOOR_PUBLISHING_ENABLED",
      "LINKEDIN_SOCIAL_PUBLISHING_ENABLED",
      "YOUTUBE_PUBLISHING_ENABLED",
      "TOKMETRIC_LIVE_PUBLISHING_ENABLED",
      "INDEED_JOB_PUBLISHING_ENABLED",
    ]) {
      expect(script).toContain(`Set-VercelValue $gate \"false\"`);
      expect(script).not.toContain(`Set-VercelValue \"${name}\" \"true\"`);
    }
    expect(documentation).toContain(
      "OAuth connection is not publishing authorization",
    );
  });

  it("uses managed secret prompts and never requests provider account passwords", () => {
    expect(script).toContain("Read-Host $Prompt -AsSecureString");
    expect(script).toContain('"--sensitive"');
    expect(script).not.toMatch(/facebook password|instagram password|x password|tiktok password/i);
    expect(documentation).toContain(
      "Do not enter Facebook, Instagram, X, TikTok, Nextdoor, LinkedIn, Google, or Indeed account passwords",
    );
  });

  it("configures the existing orchestrator, video activation, and command centers", () => {
    expect(script).toContain("CONTENT_ORCHESTRATOR_WORKSPACE_ID");
    expect(script).toContain("CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS");
    expect(script).toContain('Set-VercelValue "CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS" "20"');
    expect(script).toContain("ops\\video-render-worker\\activate-windows.ps1");
    expect(script).toContain("/app/command-center/social-media");
    expect(script).toContain("/app/command-center/tokmetric");
    expect(script).toContain("/app/command-center/social-media/content-studio");
  });

  it("uses exact provider callbacks and preserves TikTok inside TokMetric", () => {
    expect(script).toContain("/api/social-media/oauth/meta/callback");
    expect(script).toContain("/api/social-media/oauth/x/callback");
    expect(script).toContain("/api/social-media/oauth/nextdoor/callback");
    expect(script).toContain("/api/social-media/oauth/linkedin/callback");
    expect(script).toContain("/api/social-media/oauth/youtube/callback");
    expect(script).toContain("/api/tokmetric/oauth/callback");
    expect(documentation).toContain("Do not create a second TikTok connector");
  });

  it("rejects placeholder locality and keeps private configuration out of Git", () => {
    expect(entry).toContain("Replace the example Nextdoor local context");
    expect(example).toContain("Replace this sentence");
    expect(gitignore).toContain(
      "ops/owner-flow/social-providers.local.json",
    );
  });

  it("writes a secret-free readiness report instead of environment values", () => {
    expect(script).toContain("last-readiness.json");
    expect(script).toContain("configured =");
    expect(script).toContain("enabled =");
    expect(script).not.toContain("value = $script:ProductionEnvironment[$_]");
    expect(documentation).toContain("It never includes secret values");
  });

  it("keeps audit read-only and gates production changes on exact evidence", () => {
    expect(script).toContain("Invoke-DependencyInspection");
    expect(script).toContain("Audit mode recorded the condition and did not install anything");
    expect(script).toContain("Assert-RepositoryBoundary");
    expect(script).toContain("Assert-ExactHeadPreview");
    expect(script).toContain("PreviewCommit");
    expect(script).toContain("do not have the same Git tree");
    expect(script).toContain("APPLY APPROVED GEM CONFIGURATION");
    expect(script).toContain("DEPLOY VERIFIED GEM PRODUCTION");
    expect(script).toContain("INSTALL LOCKED DEPENDENCIES");
    expect(script).toContain("last-commands.json");
    expect(script).toContain("WINDOWS_CURRENT_USER_DPAPI");
    expect(script).toContain("ROLL BACK GEM PRODUCTION");
    expect(entry).toContain('"Rollback"');
  });

  it("keeps public platform video separate and owner-approved", () => {
    expect(script).toContain("ENTERPRISE_SOLUTIONS_VIDEO_URL");
    expect(script).toContain("ENTERPRISE_SOLUTIONS_VIDEO_APPROVED");
    expect(script).toContain("PUBLISH APPROVED VIDEO");
    expect(entry).toContain("PlatformVideoUrl");
    expect(entry).toContain("ApprovePlatformVideo");
    expect(documentation).toContain("Private workspace media is never selected automatically");
  });
});
