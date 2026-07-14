import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Scoped Service Requests ───────────────────────────────────────────────";

function occurrences(source, search) {
  return source.split(search).length - 1;
}

function requireSingleAnchor(source, search, label) {
  const count = occurrences(source, search);
  if (count !== 1) {
    throw new Error(`Expected exactly one ${label} anchor, found ${count}.`);
  }
}

function validatePromotedSchema(source) {
  const required = [
    marker,
    "serviceRequests             ServiceRequest[]",
    "workspaceId String?",
    "workspace Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Restrict)",
    "@@index([workspaceId, createdAt])",
    '@@map("requests")',
  ];

  for (const value of required) {
    if (!source.includes(value)) {
      throw new Error(`Promoted service-request schema is missing: ${value}`);
    }
  }
}

function promoteSchema(source) {
  if (source.includes(marker)) {
    validatePromotedSchema(source);
    return { schema: source, changed: false };
  }

  const workspaceAnchor = `  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]

  @@unique([organizationId, slug])`;
  const requestHeaderAnchor = `model ServiceRequest {
  id          String          @id @default(cuid())
  userId      String
`;
  const requestRelationAnchor = `  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("requests")`;

  requireSingleAnchor(source, workspaceAnchor, "Workspace relation");
  requireSingleAnchor(source, requestHeaderAnchor, "ServiceRequest header");
  requireSingleAnchor(source, requestRelationAnchor, "ServiceRequest relation");

  let schema = source.replace(
    workspaceAnchor,
    `  oauthAuthorizationAttempts OAuthAuthorizationAttempt[]
  serviceRequests             ServiceRequest[]

  @@unique([organizationId, slug])`,
  );
  schema = schema.replace(
    requestHeaderAnchor,
    `${marker}
model ServiceRequest {
  id          String          @id @default(cuid())
  userId      String
  workspaceId String?
`,
  );
  schema = schema.replace(
    requestRelationAnchor,
    `  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Restrict)

  @@index([workspaceId, createdAt])
  @@map("requests")`,
  );

  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = promoteSchema(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Service-request Prisma promotion anchors are valid and ready."
      : "Scoped service-request Prisma fields are present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted optional workspace scope into ServiceRequest.");
} else {
  console.log("Scoped service-request Prisma fields already present.");
}
