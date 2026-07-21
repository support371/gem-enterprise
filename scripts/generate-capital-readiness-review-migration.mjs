import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const proposalPath = path.resolve(root, "prisma/proposals/CAPITAL_READINESS_MODELS.prisma");
const defaultOutput = path.resolve(
  root,
  "prisma/migrations/20260717123000_capital_readiness_transaction_command_center/migration.sql",
);
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));
const outputPath = outputArgument ? path.resolve(root, outputArgument.slice("--output=".length)) : defaultOutput;
const checkOnly = process.argv.includes("--check");

const proposal = await readFile(proposalPath, "utf8");

const quote = (identifier) => `"${identifier.replaceAll('"', '""')}"`;
const sqlString = (value) => `'${value.replaceAll("'", "''")}'`;
const normalizeName = (value) => value.replaceAll(/[^A-Za-z0-9_]/g, "_").slice(0, 60);

function blocks(kind) {
  const expression = new RegExp(`${kind}\\s+(\\w+)\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  return [...proposal.matchAll(expression)].map((match) => ({ name: match[1], body: match[2] }));
}

const enums = blocks("enum").map(({ name, body }) => ({
  name,
  values: body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//")),
}));
const enumNames = new Set(enums.map((item) => item.name));

const rawModels = blocks("model");
const modelTableMap = new Map([
  ["Workspace", "tokmetric_workspaces"],
]);
for (const model of rawModels) {
  const mapped = model.body.match(/@@map\("([^"]+)"\)/)?.[1] ?? model.name;
  modelTableMap.set(model.name, mapped);
}

function parseType(typeToken, rest) {
  const optional = typeToken.endsWith("?");
  const withoutOptional = optional ? typeToken.slice(0, -1) : typeToken;
  const array = withoutOptional.endsWith("[]");
  const base = array ? withoutOptional.slice(0, -2) : withoutOptional;

  let sqlType;
  switch (base) {
    case "String":
      sqlType = "TEXT";
      break;
    case "Int":
      sqlType = "INTEGER";
      break;
    case "Boolean":
      sqlType = "BOOLEAN";
      break;
    case "DateTime":
      sqlType = "TIMESTAMP(3)";
      break;
    case "Json":
      sqlType = "JSONB";
      break;
    case "Decimal": {
      const decimal = rest.match(/@db\.Decimal\((\d+),\s*(\d+)\)/);
      sqlType = decimal ? `DECIMAL(${decimal[1]},${decimal[2]})` : "DECIMAL(65,30)";
      break;
    }
    default:
      if (!enumNames.has(base)) throw new Error(`Unsupported capital scalar or enum type: ${base}`);
      sqlType = quote(base);
  }

  return { base, optional, array, sqlType: array ? `${sqlType}[]` : sqlType };
}

function parseDefault(base, array, rest, sqlType) {
  const match = rest.match(/@default\(([^)]+(?:\)[^)]*)?)\)/);
  if (!match) return "";
  const value = match[1].trim();
  if (value === "cuid()") return "";
  if (value === "now()") return " DEFAULT CURRENT_TIMESTAMP";
  if (value === "true" || value === "false") return ` DEFAULT ${value}`;
  if (value === "[]") return ` DEFAULT ARRAY[]::${sqlType}`;
  if (value.startsWith('"') && value.endsWith('"')) {
    const literal = JSON.parse(value);
    if (base === "Json") return ` DEFAULT ${sqlString(literal)}::jsonb`;
    return ` DEFAULT ${sqlString(literal)}`;
  }
  if (enumNames.has(base)) return ` DEFAULT ${sqlString(value)}::${quote(base)}`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return ` DEFAULT ${value}`;
  throw new Error(`Unsupported default ${value} for ${base}${array ? "[]" : ""}`);
}

function parseModel(model) {
  const tableName = modelTableMap.get(model.name);
  const lines = model.body.split("\n").map((line) => line.trim()).filter(Boolean);
  const columns = [];
  const uniqueConstraints = [];
  const indexes = [];
  const relations = [];
  let primaryKey = null;

  for (const line of lines) {
    if (line.startsWith("//") || line.startsWith("@@map")) continue;
    if (line.startsWith("@@unique")) {
      const fields = line.match(/@@unique\(\[([^\]]+)\]\)/)?.[1]
        .split(",")
        .map((field) => field.trim());
      if (fields) uniqueConstraints.push(fields);
      continue;
    }
    if (line.startsWith("@@index")) {
      const fields = line.match(/@@index\(\[([^\]]+)\]\)/)?.[1]
        .split(",")
        .map((field) => field.trim());
      if (fields) indexes.push(fields);
      continue;
    }

    const relation = line.match(
      /^(\w+)\s+(\w+)\??\s+@relation\(fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\],\s*onDelete:\s*(\w+)\)/,
    );
    if (relation) {
      relations.push({
        field: relation[1],
        targetModel: relation[2],
        localFields: relation[3].split(",").map((field) => field.trim()),
        targetFields: relation[4].split(",").map((field) => field.trim()),
        onDelete: relation[5],
      });
      continue;
    }

    const field = line.match(/^(\w+)\s+([^\s]+)(.*)$/);
    if (!field) continue;
    const [, fieldName, typeToken, rest] = field;
    if (modelTableMap.has(typeToken.replace(/[?\[\]]/g, "")) && !rest.includes("@relation")) continue;
    const parsedType = parseType(typeToken, rest);
    const nullable = parsedType.optional ? "" : " NOT NULL";
    const defaultValue = parseDefault(parsedType.base, parsedType.array, rest, parsedType.sqlType);
    columns.push(`${quote(fieldName)} ${parsedType.sqlType}${nullable}${defaultValue}`);
    if (rest.includes("@id")) primaryKey = [fieldName];
    if (rest.includes("@unique")) uniqueConstraints.push([fieldName]);
  }

  if (!primaryKey) throw new Error(`Capital model ${model.name} has no primary key.`);
  return { name: model.name, tableName, columns, primaryKey, uniqueConstraints, indexes, relations };
}

const models = rawModels.map(parseModel);
const sql = [];
sql.push("-- GEM Enterprise Capital Readiness & Transaction Command Center");
sql.push("-- REVIEW MIGRATION ONLY. DO NOT APPLY TO PRODUCTION WITHOUT THE ACTIVATION RUNBOOK.");
sql.push("-- Deterministically generated from prisma/proposals/CAPITAL_READINESS_MODELS.prisma.");
sql.push("");

for (const item of enums) {
  sql.push(`CREATE TYPE ${quote(item.name)} AS ENUM (${item.values.map(sqlString).join(", ")});`);
}
sql.push("");

for (const model of models) {
  const definitions = [...model.columns];
  definitions.push(
    `CONSTRAINT ${quote(`${normalizeName(model.tableName)}_pkey`)} PRIMARY KEY (${model.primaryKey.map(quote).join(", ")})`,
  );
  for (const fields of model.uniqueConstraints) {
    const name = `${normalizeName(model.tableName)}_${fields.map(normalizeName).join("_")}_key`;
    definitions.push(`CONSTRAINT ${quote(name)} UNIQUE (${fields.map(quote).join(", ")})`);
  }
  sql.push(`CREATE TABLE ${quote(model.tableName)} (\n  ${definitions.join(",\n  ")}\n);`);
  sql.push("");
}

const deleteMap = {
  Cascade: "CASCADE",
  Restrict: "RESTRICT",
  SetNull: "SET NULL",
  NoAction: "NO ACTION",
};
for (const model of models) {
  for (const relation of model.relations) {
    const targetTable = modelTableMap.get(relation.targetModel);
    if (!targetTable) throw new Error(`No table map for relation target ${relation.targetModel}.`);
    const name = `${normalizeName(model.tableName)}_${relation.localFields.map(normalizeName).join("_")}_fkey`;
    sql.push(
      `ALTER TABLE ${quote(model.tableName)} ADD CONSTRAINT ${quote(name)} FOREIGN KEY (${relation.localFields
        .map(quote)
        .join(", ")}) REFERENCES ${quote(targetTable)} (${relation.targetFields.map(quote).join(", ")}) ON DELETE ${
        deleteMap[relation.onDelete] ?? "NO ACTION"
      } ON UPDATE CASCADE;`,
    );
  }
}
sql.push("");

for (const model of models) {
  for (const fields of model.indexes) {
    const name = `${normalizeName(model.tableName)}_${fields.map(normalizeName).join("_")}_idx`;
    sql.push(`CREATE INDEX ${quote(name)} ON ${quote(model.tableName)} (${fields.map(quote).join(", ")});`);
  }
}
sql.push("");

const generated = `${sql.join("\n").trim()}\n`;

if (checkOnly) {
  const existing = await readFile(outputPath, "utf8").catch(() => null);
  if (existing === null) {
    console.error(`Review migration is missing: ${path.relative(root, outputPath)}`);
    process.exit(1);
  }
  if (existing !== generated) {
    console.error("Capital review migration is stale. Regenerate it before review.");
    process.exit(1);
  }
  console.log(`Capital review migration is current: ${path.relative(root, outputPath)}`);
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, generated, "utf8");
  console.log(`Generated capital review migration: ${path.relative(root, outputPath)}`);
}
