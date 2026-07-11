import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(
  command,
  [
    "exec",
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  { encoding: "utf8", env: process.env },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(result.stderr || `Prisma schema diff failed with status ${result.status}`);
}

mkdirSync("public/recovery", { recursive: true });
writeFileSync("public/recovery/gem-enterprise-schema.sql", result.stdout, "utf8");
console.log("Generated temporary Prisma schema SQL snapshot for controlled recovery.");
