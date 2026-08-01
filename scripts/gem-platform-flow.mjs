#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const PNPM = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const args = new Set(process.argv.slice(2));
const modeAll = args.has("--all");
const shouldInstall = modeAll || args.has("--install");
const shouldVerify = modeAll || args.has("--verify");
const shouldCheckWorker = modeAll || args.has("--worker-check");
const shouldStart = modeAll || args.has("--start");
const shouldOpen = modeAll || args.has("--open") || args.has("--connect");
const shouldMigrate = args.has("--migrate");
const jsonOutput = args.has("--json");
const skipAudit = args.has("--skip-audit");

const providerDefinitions = [
  {
    id: "TIKTOK",
    label: "TikTok / TokMetric",
    oauthEnabled: "TOKMETRIC_TIKTOK_OAUTH_ENABLED",
    required: [
      "TIKTOK_CLIENT_KEY",
      "TIKTOK_CLIENT_SECRET",
      "TIKTOK_REDIRECT_URI",
      "TOKMETRIC_TOKEN_ENCRYPTION_KEY",
    ],
    approval: null,
    liveGates: ["TOKMETRIC_LIVE_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/tokmetric",
  },
  {
    id: "META",
    label: "Facebook Page + Instagram Professional",
    oauthEnabled: "META_SOCIAL_OAUTH_ENABLED",
    required: [
      "META_GRAPH_API_VERSION",
      "META_APP_ID",
      "META_APP_SECRET",
      "META_SOCIAL_SCOPES",
      "META_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "META_APP_REVIEW_APPROVED",
    liveGates: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "META_SOCIAL_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
  },
  {
    id: "X",
    label: "X company account",
    oauthEnabled: "X_SOCIAL_OAUTH_ENABLED",
    required: [
      "X_CLIENT_ID",
      "X_CLIENT_SECRET",
      "X_SOCIAL_SCOPES",
      "X_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: null,
    liveGates: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "X_SOCIAL_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
  },
  {
    id: "LINKEDIN",
    label: "LinkedIn Company",
    oauthEnabled: "LINKEDIN_SOCIAL_OAUTH_ENABLED",
    required: [
      "LINKEDIN_CLIENT_ID",
      "LINKEDIN_CLIENT_SECRET",
      "LINKEDIN_SOCIAL_SCOPES",
      "LINKEDIN_API_VERSION",
      "LINKEDIN_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED",
    liveGates: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "LINKEDIN_SOCIAL_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
  },
  {
    id: "YOUTUBE",
    label: "YouTube channel / Brand Account",
    oauthEnabled: "YOUTUBE_SOCIAL_OAUTH_ENABLED",
    required: [
      "GOOGLE_SOCIAL_CLIENT_ID",
      "GOOGLE_SOCIAL_CLIENT_SECRET",
      "YOUTUBE_SOCIAL_SCOPES",
      "YOUTUBE_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "YOUTUBE_DATA_API_AUDIT_APPROVED",
    liveGates: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "YOUTUBE_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
  },
  {
    id: "NEXTDOOR",
    label: "Nextdoor business / authorized identity",
    oauthEnabled: "NEXTDOOR_OAUTH_ENABLED",
    required: [
      "NEXTDOOR_CLIENT_ID",
      "NEXTDOOR_CLIENT_SECRET",
      "NEXTDOOR_SOCIAL_SCOPES",
      "NEXTDOOR_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
      "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT",
    ],
    approval: "NEXTDOOR_PUBLISH_API_ACCESS_APPROVED",
    liveGates: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "NEXTDOOR_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
  },
  {
    id: "INDEED",
    label: "Indeed Employer feed",
    oauthEnabled: "INDEED_EMPLOYER_INTEGRATION_ENABLED",
    required: ["INDEED_EMPLOYER_ID", "INDEED_JOB_FEED_URL"],
    approval: null,
    liveGates: ["INDEED_JOB_PUBLISHING_ENABLED"],
    connectionPath: "/app/command-center/social-media",
    hiringOnly: true,
  },
];

const coreGroups = [
  {
    id: "database",
    label: "Database",
    required: ["POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING"],
  },
  {
    id: "application",
    label: "Application and authentication",
    required: ["JWT_SECRET", "NEXT_PUBLIC_APP_URL"],
  },
  {
    id: "orchestrator",
    label: "Scheduled content orchestrator",
    required: [
      "CONTENT_ORCHESTRATOR_WORKSPACE_ID",
      "CONTENT_ORCHESTRATOR_ACTOR_ID",
      "CONTENT_ORCHESTRATOR_CRON_SECRET",
      "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT",
    ],
  },
  {
    id: "video",
    label: "Trusted video worker",
    required: [
      "COMFYUI_BASE_URL",
      "COMFYUI_WORKFLOW_JSON",
      "COMFYUI_PROMPT_NODE_ID",
      "VIDEO_RENDER_CALLBACK_SECRET",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
];

function parseDotEnv(text) {
  const values = {};
  for (const sourceLine of text.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function loadEnvironment() {
  const values = {};
  for (const name of [".env", ".env.local"]) {
    const path = resolve(ROOT, name);
    if (existsSync(path)) Object.assign(values, parseDotEnv(readFileSync(path, "utf8")));
  }
  return { ...values, ...process.env };
}

function meaningful(value) {
  if (!value?.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !(
    normalized.includes("replace-with") ||
    normalized.includes("replace_this") ||
    normalized.includes("your-") ||
    normalized.includes("your_") ||
    normalized.includes("example.com") ||
    normalized.includes("username:password")
  );
}

function enabled(env, key) {
  return env[key]?.trim().toLowerCase() === "true";
}

function missing(env, keys) {
  return keys.filter((key) => !meaningful(env[key]));
}

function commandAvailable(command) {
  const result = spawnSync(command, ["--version"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  return result.status === 0;
}

function verifyRepositoryFiles() {
  const files = [
    "package.json",
    "prisma/schema.prisma",
    "prisma/migrations/20260725035000_video_render_jobs/migration.sql",
    "scripts/video-render-worker.ts",
    "src/app/app/command-center/social-media/page.tsx",
    "src/app/app/command-center/social-media/content-studio/page.tsx",
    "src/app/api/social-media/oauth/[provider]/start/route.ts",
    "src/app/api/social-media/oauth/[provider]/callback/route.ts",
    "src/app/api/social-media/orchestrator/daily/process/route.ts",
  ];
  return files.map((path) => ({ path, present: existsSync(resolve(ROOT, path)) }));
}

function audit(env) {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  const core = coreGroups.map((group) => ({
    ...group,
    missing: missing(env, group.required),
    ready: missing(env, group.required).length === 0,
  }));
  const providers = providerDefinitions.map((provider) => {
    const missingConfiguration = missing(env, provider.required);
    const oauthEnabled = enabled(env, provider.oauthEnabled);
    const approvalGranted = !provider.approval || enabled(env, provider.approval);
    const livePublishingEnabled = provider.liveGates.every((key) => enabled(env, key));
    let state = "CONFIGURATION_REQUIRED";
    if (!missingConfiguration.length && !oauthEnabled) state = "ENABLE_OAUTH_AFTER_CREDENTIALS";
    else if (!missingConfiguration.length && oauthEnabled && !approvalGranted) state = "PLATFORM_APPROVAL_REQUIRED";
    else if (!missingConfiguration.length && oauthEnabled) state = "READY_FOR_HUMAN_AUTHORIZATION";
    if (provider.hiringOnly && !missingConfiguration.length && oauthEnabled) state = "HIRING_WORKFLOW_ONLY";
    return {
      id: provider.id,
      label: provider.label,
      state,
      oauthEnabled,
      approvalGranted,
      livePublishingEnabled,
      missingConfiguration,
      connectionPath: provider.connectionPath,
      hiringOnly: Boolean(provider.hiringOnly),
    };
  });

  return {
    timestamp: new Date().toISOString(),
    repository: ROOT,
    runtime: {
      node: process.versions.node,
      nodeSupported: nodeMajor >= 24,
      pnpmAvailable: commandAvailable(PNPM),
    },
    files: verifyRepositoryFiles(),
    core,
    providers,
    safety: {
      globalSocialPublishingEnabled: enabled(env, "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED"),
      tikTokPublishingEnabled: enabled(env, "TOKMETRIC_LIVE_PUBLISHING_ENABLED"),
      message:
        "The terminal flow never enables publishing gates, submits platform-review claims, or bypasses OAuth consent.",
    },
  };
}

function printReport(report) {
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log("\nGEM Enterprise terminal activation audit");
  console.log("========================================");
  console.log(`Node ${report.runtime.node}: ${report.runtime.nodeSupported ? "ready" : "Node 24.x required"}`);
  console.log(`pnpm: ${report.runtime.pnpmAvailable ? "ready" : "not installed"}`);
  const missingFiles = report.files.filter((entry) => !entry.present);
  console.log(`Repository surfaces: ${missingFiles.length ? `${missingFiles.length} missing` : "complete"}`);
  for (const entry of missingFiles) console.log(`  - missing ${entry.path}`);

  console.log("\nCore activation");
  for (const group of report.core) {
    console.log(`  ${group.ready ? "[ready]" : "[blocked]"} ${group.label}`);
    for (const key of group.missing) console.log(`    - ${key}`);
  }

  console.log("\nSocial account authorization");
  for (const provider of report.providers) {
    console.log(`  [${provider.state}] ${provider.label}`);
    for (const key of provider.missingConfiguration) console.log(`    - ${key}`);
  }

  console.log("\nPublishing gates");
  console.log(
    `  Cross-platform live publishing: ${report.safety.globalSocialPublishingEnabled ? "ENABLED" : "disabled"}`,
  );
  console.log(
    `  TikTok live publishing: ${report.safety.tikTokPublishingEnabled ? "ENABLED" : "disabled"}`,
  );
  console.log(`  ${report.safety.message}`);
}

function run(command, commandArgs, options = {}) {
  console.log(`\n> ${command} ${commandArgs.join(" ")}`);
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} exited with ${result.status}`);
  }
}

function appBaseUrl(env) {
  const requested = process.argv.find((value) => value.startsWith("--base-url="));
  if (requested) return requested.slice("--base-url=".length).replace(/\/$/, "");
  if (meaningful(env.NEXT_PUBLIC_APP_URL)) return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

function openUrl(url) {
  const commands =
    process.platform === "win32"
      ? [["cmd", ["/c", "start", "", url]]]
      : process.platform === "darwin"
        ? [["open", [url]]]
        : [["xdg-open", [url]]];
  const [command, commandArgs] = commands[0];
  const child = spawn(command, commandArgs, {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
    shell: false,
  });
  child.unref();
}

function openCommandCenters(env) {
  const base = appBaseUrl(env);
  const pages = [
    "/app/command-center/integrations",
    "/app/command-center/social-media",
    "/app/command-center/social-media/content-studio",
    "/app/command-center/tokmetric",
  ];
  console.log("\nHuman authorization pages");
  for (const path of pages) {
    const url = `${base}${path}`;
    console.log(`  ${url}`);
    try {
      openUrl(url);
    } catch {
      console.log("  Browser opening was unavailable; copy the URL manually.");
    }
  }
}

function startServices() {
  const children = [
    spawn(PNPM, ["dev"], { cwd: ROOT, stdio: "inherit", shell: false }),
    spawn(PNPM, ["video:worker"], { cwd: ROOT, stdio: "inherit", shell: false }),
  ];
  const stop = (signal) => {
    for (const child of children) {
      if (!child.killed) child.kill(signal);
    }
  };
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));
  return new Promise((resolvePromise, rejectPromise) => {
    let completed = 0;
    for (const child of children) {
      child.on("error", rejectPromise);
      child.on("exit", (code) => {
        completed += 1;
        if (code && code !== 0) rejectPromise(new Error(`A GEM service exited with ${code}`));
        else if (completed === children.length) resolvePromise();
      });
    }
  });
}

function printUsage() {
  console.log(`
Usage:
  node scripts/gem-platform-flow.mjs --audit
  node scripts/gem-platform-flow.mjs --all
  node scripts/gem-platform-flow.mjs --all --migrate
  node scripts/gem-platform-flow.mjs --connect --base-url=http://localhost:3000

Flags:
  --audit          Print platform, video, orchestrator, and provider readiness. Default action.
  --all            Install, verify, check the worker, start services, and open dashboards.
  --install        Run pnpm install --frozen-lockfile.
  --verify         Run Prisma generation and the repository verification chain.
  --migrate        Apply committed database migrations with prisma migrate deploy.
  --worker-check   Verify the trusted render worker configuration and connectivity.
  --start          Start the Next.js application and the continuous video worker.
  --connect        Open the social, video, integration, and TokMetric dashboards.
  --open           Alias for --connect.
  --json           Emit the audit as JSON.
  --base-url=URL   Override the command-center base URL.
  --help           Show this help.

Safety:
  --all does not apply migrations unless --migrate is also supplied.
  No command enables live publishing, fabricates platform approval, or completes OAuth consent for you.
`);
}

async function main() {
  if (args.has("--help")) {
    printUsage();
    return;
  }
  const env = loadEnvironment();
  const report = audit(env);
  if (!skipAudit) printReport(report);

  if (shouldInstall) run(PNPM, ["install", "--frozen-lockfile"]);
  if (shouldVerify) {
    run(PNPM, ["db:generate"]);
    run(PNPM, ["verify:preview"]);
  }
  if (shouldMigrate) {
    if (!meaningful(env.POSTGRES_PRISMA_URL)) {
      throw new Error("POSTGRES_PRISMA_URL must be configured before applying migrations.");
    }
    run(PNPM, ["exec", "prisma", "migrate", "deploy"]);
  }
  if (shouldCheckWorker) {
    const video = report.core.find((group) => group.id === "video");
    if (!video?.ready) {
      throw new Error(
        `Trusted video worker configuration is incomplete: ${video?.missing.join(", ")}`,
      );
    }
    run(PNPM, ["video:worker:check"]);
  }
  if (shouldOpen && !shouldStart) openCommandCenters(env);
  if (shouldStart) {
    if (shouldOpen) {
      setTimeout(() => openCommandCenters(env), 4000).unref();
    }
    await startServices();
  }
}

main().catch((error) => {
  console.error(`\nGEM terminal flow failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
