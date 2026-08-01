#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const PNPM = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const args = new Set(process.argv.slice(2));
const all = args.has("--all");
const actions = {
  install: all || args.has("--install"),
  verify: all || args.has("--verify"),
  migrate: args.has("--migrate"),
  workerCheck: all || args.has("--worker-check"),
  start: all || args.has("--start"),
  open: all || args.has("--open") || args.has("--connect"),
};
const jsonOutput = args.has("--json");

const providerDefinitions = [
  {
    id: "TIKTOK",
    label: "TikTok / TokMetric",
    enable: "TOKMETRIC_TIKTOK_OAUTH_ENABLED",
    required: [
      "TIKTOK_CLIENT_KEY",
      "TIKTOK_CLIENT_SECRET",
      "TIKTOK_REDIRECT_URI",
      "TOKMETRIC_TOKEN_ENCRYPTION_KEY",
    ],
    approval: null,
    live: ["TOKMETRIC_LIVE_PUBLISHING_ENABLED"],
  },
  {
    id: "META",
    label: "Facebook Page + Instagram Professional",
    enable: "META_SOCIAL_OAUTH_ENABLED",
    required: [
      "META_GRAPH_API_VERSION",
      "META_APP_ID",
      "META_APP_SECRET",
      "META_SOCIAL_SCOPES",
      "META_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "META_APP_REVIEW_APPROVED",
    live: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "META_SOCIAL_PUBLISHING_ENABLED"],
  },
  {
    id: "X",
    label: "X company account",
    enable: "X_SOCIAL_OAUTH_ENABLED",
    required: [
      "X_CLIENT_ID",
      "X_CLIENT_SECRET",
      "X_SOCIAL_SCOPES",
      "X_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: null,
    live: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "X_SOCIAL_PUBLISHING_ENABLED"],
  },
  {
    id: "LINKEDIN",
    label: "LinkedIn Company",
    enable: "LINKEDIN_SOCIAL_OAUTH_ENABLED",
    required: [
      "LINKEDIN_CLIENT_ID",
      "LINKEDIN_CLIENT_SECRET",
      "LINKEDIN_SOCIAL_SCOPES",
      "LINKEDIN_API_VERSION",
      "LINKEDIN_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED",
    live: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "LINKEDIN_SOCIAL_PUBLISHING_ENABLED"],
  },
  {
    id: "YOUTUBE",
    label: "YouTube channel / Brand Account",
    enable: "YOUTUBE_SOCIAL_OAUTH_ENABLED",
    required: [
      "GOOGLE_SOCIAL_CLIENT_ID",
      "GOOGLE_SOCIAL_CLIENT_SECRET",
      "YOUTUBE_SOCIAL_SCOPES",
      "YOUTUBE_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
    ],
    approval: "YOUTUBE_DATA_API_AUDIT_APPROVED",
    live: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "YOUTUBE_PUBLISHING_ENABLED"],
  },
  {
    id: "NEXTDOOR",
    label: "Nextdoor business / authorized identity",
    enable: "NEXTDOOR_OAUTH_ENABLED",
    required: [
      "NEXTDOOR_CLIENT_ID",
      "NEXTDOOR_CLIENT_SECRET",
      "NEXTDOOR_SOCIAL_SCOPES",
      "NEXTDOOR_OAUTH_REDIRECT_URI",
      "SOCIAL_TOKEN_ENCRYPTION_KEY",
      "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT",
    ],
    approval: "NEXTDOOR_PUBLISH_API_ACCESS_APPROVED",
    live: ["SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "NEXTDOOR_PUBLISHING_ENABLED"],
  },
  {
    id: "INDEED",
    label: "Indeed Employer feed",
    enable: "INDEED_EMPLOYER_INTEGRATION_ENABLED",
    required: ["INDEED_EMPLOYER_ID", "INDEED_JOB_FEED_URL"],
    approval: null,
    live: ["INDEED_JOB_PUBLISHING_ENABLED"],
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
    id: "videoApplication",
    label: "Application video-dispatch configuration",
    required: [
      "VIDEO_RENDER_DISPATCH_MODE",
      "COMFYUI_WORKFLOW_JSON",
      "COMFYUI_PROMPT_NODE_ID",
      "VIDEO_RENDER_CALLBACK_SECRET",
      "VIDEO_RENDER_STORAGE_URL",
      "VIDEO_RENDER_STORAGE_KEY",
      "VIDEO_RENDER_STORAGE_AUTH_ORIGIN",
      "VIDEO_ASSET_ALLOWED_ORIGINS",
    ],
  },
  {
    id: "videoWorker",
    label: "Trusted video-worker runtime",
    required: [
      "GEM_VIDEO_WORKER_API_URL",
      "VIDEO_RENDER_CALLBACK_SECRET",
      "COMFYUI_BASE_URL",
      "VIDEO_RENDER_STORAGE_URL",
      "VIDEO_RENDER_STORAGE_KEY",
      "VIDEO_RENDER_STORAGE_BUCKET",
      "VIDEO_RENDER_WORKER_STATE_DIR",
    ],
  },
];

function parseDotEnv(text) {
  const output = {};
  for (const sourceLine of text.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    output[key] = value;
  }
  return output;
}

function loadEnvironment() {
  const output = {};
  for (const fileName of [".env", ".env.local"]) {
    const path = resolve(ROOT, fileName);
    if (existsSync(path)) Object.assign(output, parseDotEnv(readFileSync(path, "utf8")));
  }
  return { ...output, ...process.env };
}

function meaningful(value) {
  if (!value?.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return ![
    "replace-with",
    "replace_this",
    "your-",
    "your_",
    "example.com",
    "username:password",
  ].some((marker) => normalized.includes(marker));
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

function repositoryFiles() {
  return [
    "package.json",
    "prisma/schema.prisma",
    "prisma/migrations/20260725035000_video_render_jobs/migration.sql",
    "prisma/migrations/20260726062000_video_worker_dispatch/migration.sql",
    "scripts/video-render-worker.ts",
    "src/app/app/command-center/social-media/page.tsx",
    "src/app/app/command-center/social-media/content-studio/page.tsx",
    "src/app/api/social-media/oauth/[provider]/start/route.ts",
    "src/app/api/social-media/oauth/[provider]/callback/route.ts",
    "src/app/api/social-media/orchestrator/daily/process/route.ts",
    "src/app/api/video/worker/dispatch/route.ts",
    "src/app/api/video/worker/finalize/route.ts",
  ].map((path) => ({ path, present: existsSync(resolve(ROOT, path)) }));
}

function audit(env) {
  const core = coreGroups.map((group) => {
    const missingVariables = missing(env, group.required);
    const modeProblem =
      group.id === "videoApplication" &&
      meaningful(env.VIDEO_RENDER_DISPATCH_MODE) &&
      env.VIDEO_RENDER_DISPATCH_MODE.trim().toLowerCase() !== "worker";
    return {
      id: group.id,
      label: group.label,
      ready: missingVariables.length === 0 && !modeProblem,
      missing: missingVariables,
      issue: modeProblem ? "VIDEO_RENDER_DISPATCH_MODE must be worker" : null,
    };
  });

  const providers = providerDefinitions.map((provider) => {
    const missingConfiguration = missing(env, provider.required);
    const configurationEnabled = enabled(env, provider.enable);
    const approvalGranted = !provider.approval || enabled(env, provider.approval);
    const livePublishingEnabled = provider.live.every((key) => enabled(env, key));
    let state = "CONFIGURATION_REQUIRED";
    if (!missingConfiguration.length && !configurationEnabled) {
      state = "ENABLE_OAUTH_AFTER_CREDENTIALS";
    } else if (!missingConfiguration.length && configurationEnabled && !approvalGranted) {
      state = "PLATFORM_APPROVAL_REQUIRED";
    } else if (!missingConfiguration.length && configurationEnabled) {
      state = provider.hiringOnly ? "HIRING_WORKFLOW_ONLY" : "READY_FOR_HUMAN_AUTHORIZATION";
    }
    return {
      id: provider.id,
      label: provider.label,
      state,
      missingConfiguration,
      configurationEnabled,
      approvalGranted,
      livePublishingEnabled,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    repository: ROOT,
    runtime: {
      node: process.versions.node,
      nodeSupported: Number.parseInt(process.versions.node.split(".")[0], 10) >= 24,
      pnpmAvailable: commandAvailable(PNPM),
    },
    files: repositoryFiles(),
    core,
    providers,
    safety: {
      globalSocialPublishingEnabled: enabled(env, "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED"),
      tikTokPublishingEnabled: enabled(env, "TOKMETRIC_LIVE_PUBLISHING_ENABLED"),
      message:
        "The terminal flow never enables publishing gates, fabricates platform approval, or bypasses OAuth consent.",
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
  for (const entry of missingFiles) console.log(`  - ${entry.path}`);
  console.log("\nCore activation");
  for (const group of report.core) {
    console.log(`  ${group.ready ? "[ready]" : "[blocked]"} ${group.label}`);
    for (const key of group.missing) console.log(`    - ${key}`);
    if (group.issue) console.log(`    - ${group.issue}`);
  }
  console.log("\nSocial account connection");
  for (const provider of report.providers) {
    console.log(`  [${provider.state}] ${provider.label}`);
    for (const key of provider.missingConfiguration) console.log(`    - ${key}`);
  }
  console.log("\nPublishing gates");
  console.log(
    `  Cross-platform: ${report.safety.globalSocialPublishingEnabled ? "ENABLED" : "disabled"}`,
  );
  console.log(
    `  TikTok: ${report.safety.tikTokPublishingEnabled ? "ENABLED" : "disabled"}`,
  );
  console.log(`  ${report.safety.message}`);
}

function run(command, commandArgs) {
  console.log(`\n> ${command} ${commandArgs.join(" ")}`);
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} exited with ${result.status}`);
  }
}

function appBaseUrl(env) {
  const explicit = process.argv.find((value) => value.startsWith("--base-url="));
  if (explicit) return explicit.slice("--base-url=".length).replace(/\/$/, "");
  if (actions.start) return "http://localhost:3000";
  if (meaningful(env.NEXT_PUBLIC_APP_URL)) return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

function openUrl(url) {
  const [command, commandArgs] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
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
  const paths = [
    "/app/command-center/integrations",
    "/app/command-center/social-media",
    "/app/command-center/social-media/content-studio",
    "/app/command-center/tokmetric",
  ];
  console.log("\nHuman authorization pages");
  for (const path of paths) {
    const url = `${base}${path}`;
    console.log(`  ${url}`);
    try {
      openUrl(url);
    } catch {
      console.log("  Browser opening unavailable; copy the URL manually.");
    }
  }
}

function startServices() {
  const children = [
    spawn(PNPM, ["dev"], { cwd: ROOT, stdio: "inherit", shell: false }),
    spawn(PNPM, ["video:worker"], { cwd: ROOT, stdio: "inherit", shell: false }),
  ];
  const stop = (signal) => {
    for (const child of children) if (!child.killed) child.kill(signal);
  };
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));
  return new Promise((resolvePromise, rejectPromise) => {
    let exited = 0;
    for (const child of children) {
      child.on("error", rejectPromise);
      child.on("exit", (code) => {
        exited += 1;
        if (code && code !== 0) rejectPromise(new Error(`A GEM service exited with ${code}`));
        else if (exited === children.length) resolvePromise();
      });
    }
  });
}

function usage() {
  console.log(`
Usage:
  node scripts/gem-platform-flow.mjs --audit
  node scripts/gem-platform-flow.mjs --all
  node scripts/gem-platform-flow.mjs --all --migrate
  node scripts/gem-platform-flow.mjs --connect --base-url=https://your-host

--all installs, verifies, checks the worker, starts Next.js and the worker, and opens the dashboards.
--migrate is separate and applies committed migrations with prisma migrate deploy.
No option enables publishing or completes provider consent.
`);
}

async function main() {
  if (args.has("--help")) {
    usage();
    return;
  }
  const env = loadEnvironment();
  const report = audit(env);
  printReport(report);

  if (actions.install) run(PNPM, ["install", "--frozen-lockfile"]);
  if (actions.verify) {
    run(PNPM, ["db:generate"]);
    run(PNPM, ["verify:preview"]);
  }
  if (actions.migrate) {
    if (!meaningful(env.POSTGRES_PRISMA_URL)) {
      throw new Error("POSTGRES_PRISMA_URL must be configured before applying migrations.");
    }
    run(PNPM, ["exec", "prisma", "migrate", "deploy"]);
  }
  if (actions.workerCheck) {
    const worker = report.core.find((group) => group.id === "videoWorker");
    const application = report.core.find((group) => group.id === "videoApplication");
    if (!worker?.ready || !application?.ready) {
      const missingNames = [...(application?.missing ?? []), ...(worker?.missing ?? [])];
      throw new Error(`Video activation is incomplete: ${[...new Set(missingNames)].join(", ")}`);
    }
    run(PNPM, ["video:worker:check"]);
  }
  if (actions.open && !actions.start) openCommandCenters(env);
  if (actions.start) {
    if (actions.open) setTimeout(() => openCommandCenters(env), 4000).unref();
    await startServices();
  }
}

main().catch((error) => {
  console.error(`\nGEM terminal flow failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
