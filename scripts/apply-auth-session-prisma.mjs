import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const checkOnly = process.argv.includes("--check");
const field = "  sessionVersion  Int        @default(0)";

function promote(source) {
  if (source.includes(field)) {
    if ((source.split(field).length - 1) !== 1) {
      throw new Error("Expected exactly one User.sessionVersion field.");
    }
    return { schema: source, changed: false };
  }

  const anchor = `  isEmailVerified Boolean    @default(false)\n  createdAt       DateTime   @default(now())`;
  if ((source.split(anchor).length - 1) !== 1) {
    throw new Error("Could not locate the canonical User model session-version anchor.");
  }

  return {
    schema: source.replace(
      anchor,
      `  isEmailVerified Boolean    @default(false)\n${field}\n  createdAt       DateTime   @default(now())`,
    ),
    changed: true,
  };
}

const current = await readFile(schemaPath, "utf8");
const result = promote(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Auth session-version Prisma anchor is valid and ready."
      : "Auth session-version Prisma field is present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted User.sessionVersion into prisma/schema.prisma.");
} else {
  console.log("User.sessionVersion already present.");
}
