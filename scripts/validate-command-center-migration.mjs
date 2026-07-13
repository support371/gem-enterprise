import { spawnSync } from "node:child_process";
import process from "node:process";

const databaseUrl = process.env.COMMAND_CENTER_TEST_DATABASE_URL?.trim();
const confirmedDisposable = process.env.COMMAND_CENTER_ALLOW_DISPOSABLE_DB === "true";

if (!databaseUrl) {
  throw new Error("COMMAND_CENTER_TEST_DATABASE_URL is required.");
}

if (!confirmedDisposable) {
  throw new Error(
    "Refusing migration validation without COMMAND_CENTER_ALLOW_DISPOSABLE_DB=true.",
  );
}

const parsed = new URL(databaseUrl);
const databaseName = parsed.pathname.replace(/^\//, "").toLowerCase();
const hostname = parsed.hostname.toLowerCase();
const forbiddenSignals = ["prod", "production", "live", "primary"];

if (
  forbiddenSignals.some(
    (signal) => databaseName.includes(signal) || hostname.includes(signal),
  )
) {
  throw new Error(
    `Refusing to use a database that appears production-like: ${hostname}/${databaseName}`,
  );
}

const migrationFile =
  "prisma/migrations/20260713032500_command_center_operating_models/migration.sql";
const rollbackFile =
  "prisma/migrations/20260713032500_command_center_operating_models/rollback.sql";

function run(label, args) {
  console.log(`\n[command-center migration] ${label}`);
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      POSTGRES_PRISMA_URL: databaseUrl,
      POSTGRES_URL_NON_POOLING: databaseUrl,
    },
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

run("validate promoted Prisma schema", ["run", "db:generate"]);
run("apply migration to disposable database", [
  "exec",
  "prisma",
  "db",
  "execute",
  "--file",
  migrationFile,
  "--url",
  databaseUrl,
]);
run("verify database matches promoted Prisma schema", [
  "exec",
  "prisma",
  "migrate",
  "diff",
  "--from-url",
  databaseUrl,
  "--to-schema-datamodel",
  "prisma/schema.prisma",
  "--exit-code",
]);
run("rollback disposable migration", [
  "exec",
  "prisma",
  "db",
  "execute",
  "--file",
  rollbackFile,
  "--url",
  databaseUrl,
]);
run("reapply migration after rollback", [
  "exec",
  "prisma",
  "db",
  "execute",
  "--file",
  migrationFile,
  "--url",
  databaseUrl,
]);
run("verify forward recovery after rollback", [
  "exec",
  "prisma",
  "migrate",
  "diff",
  "--from-url",
  databaseUrl,
  "--to-schema-datamodel",
  "prisma/schema.prisma",
  "--exit-code",
]);

console.log(
  "\nCommand-center migration apply, rollback, reapply, and schema-diff validation passed on the disposable database.",
);
