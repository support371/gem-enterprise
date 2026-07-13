import { spawnSync } from "node:child_process";

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() || "";
}

function run(command, args, env) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    stdio: "inherit",
    env,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

const env = { ...process.env };

const pooledUrl = firstDefined(
  env.POSTGRES_PRISMA_URL,
  env.DATABASE_URL,
  env.POSTGRES_URL,
  env.NEON_DATABASE_URL,
);

const directUrl = firstDefined(
  env.POSTGRES_URL_NON_POOLING,
  env.DATABASE_URL_UNPOOLED,
  env.POSTGRES_URL_NO_SSL,
  pooledUrl,
);

if (pooledUrl) env.POSTGRES_PRISMA_URL = pooledUrl;
if (directUrl) env.POSTGRES_URL_NON_POOLING = directUrl;

console.log("Promoting separated-intake Prisma models...");
run("node", ["scripts/apply-intake-prisma-models.mjs"], env);

// `prisma validate` only parses the schema and does not connect to PostgreSQL. Some
// preview environments expose only one database variable (or load it through a
// Prisma-consumed env file), so give validation a complete, non-routable pair without
// replacing the real environment used by migration or application commands.
const schemaValidationUrl = "postgresql://schema:validation@127.0.0.1:5432/schema_validation";
const schemaValidationEnv = {
  ...env,
  POSTGRES_PRISMA_URL: pooledUrl || schemaValidationUrl,
  POSTGRES_URL_NON_POOLING: directUrl || pooledUrl || schemaValidationUrl,
};

console.log("Validating Prisma schema...");
run("pnpm", ["exec", "prisma", "validate"], schemaValidationEnv);

console.log("Generating Prisma client...");
run("pnpm", ["exec", "prisma", "generate"], schemaValidationEnv);

const shouldVerifyPreview =
  env.VERCEL_ENV === "preview" || env.RUN_PREVIEW_VERIFICATION === "true";

if (shouldVerifyPreview) {
  console.log("Running preview verification: lint, typecheck, and unit tests...");
  const verificationEnv = {
    ...env,
    NODE_ENV: "test",
    JWT_SECRET: "preview-verification-secret-min-32-characters",
    POSTGRES_PRISMA_URL: "postgresql://ci:ci@localhost:5432/gem_ci",
    POSTGRES_URL_NON_POOLING: "postgresql://ci:ci@localhost:5432/gem_ci",
    SMTP_HOST: "",
    SMTP_PORT: "587",
    SMTP_USER: "",
    SMTP_PASS: "",
    CRON_SECRET: "preview-verification-cron-secret",
    AUDIT_ENABLED: "true",
  };
  run("pnpm", ["run", "verify:preview"], verificationEnv);
}

const shouldDeployMigrations =
  env.VERCEL_ENV === "production" &&
  pooledUrl &&
  env.RUN_DB_MIGRATIONS === "true";

if (shouldDeployMigrations) {
  console.log("RUN_DB_MIGRATIONS enabled: deploying committed Prisma migrations...");
  run("pnpm", ["exec", "prisma", "migrate", "deploy"], env);
}

if (env.AUTO_DB_PUSH === "true") {
  if (!pooledUrl) {
    throw new Error(
      "AUTO_DB_PUSH is enabled, but no supported database URL is configured. Connect Supabase or add POSTGRES_PRISMA_URL/DATABASE_URL first.",
    );
  }

  console.log("AUTO_DB_PUSH enabled: synchronizing Prisma schema...");
  run("pnpm", ["exec", "prisma", "db", "push"], env);
}

if (env.AUTO_DB_SEED === "true") {
  if (env.AUTO_DB_PUSH !== "true") {
    throw new Error("AUTO_DB_SEED requires AUTO_DB_PUSH=true for a controlled first-time bootstrap.");
  }

  console.log("AUTO_DB_SEED enabled: creating secure bootstrap records...");
  run("pnpm", ["exec", "tsx", "prisma/seed.ts"], env);
}

console.log("Building Next.js application...");
run("pnpm", ["exec", "next", "build"], env);
