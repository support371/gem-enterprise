import { spawnSync } from "node:child_process";

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() || "";
}

function run(command, args, env) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, { stdio: "inherit", env });
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

if (env.AUTO_DB_PUSH === "true" || env.AUTO_DB_SEED === "true") {
  throw new Error(
    "Automatic database bootstrap is disabled for production-safe GEM builds. Prisma db push cannot apply SQL-only CHECK, RLS, trigger, and grant/revoke controls. Apply reviewed migrations through the controlled production migration path, verify the security invariants, and keep AUTO_DB_PUSH/AUTO_DB_SEED=false.",
  );
}

console.log("Promoting auth session-version Prisma field...");
run("node", ["scripts/apply-auth-session-prisma.mjs"], env);
console.log("Promoting separated-intake Prisma models...");
run("node", ["scripts/apply-intake-prisma-models.mjs"], env);
console.log("Promoting scoped service-request Prisma fields...");
run("node", ["scripts/apply-service-request-prisma.mjs"], env);
console.log("Promoting customer-success Prisma models...");
run("node", ["scripts/apply-customer-success-prisma.mjs"], env);
console.log("Promoting communication-governance Prisma models...");
run("node", ["scripts/apply-communication-governance-prisma.mjs"], env);

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

const shouldVerifyPreview = false; // diagnostic only: isolate current Next.js production build
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

console.log("Building Next.js application...");
run("pnpm", ["exec", "next", "build"], env);
