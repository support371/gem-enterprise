import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Customer Success Foundation ──────────────────────────────────────────";

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
    "customerSuccessProfile",
    "customerSuccessActions",
    "ownedCustomerSuccessProfiles",
    "createdCustomerSuccessActions",
    'model CustomerSuccessProfile {',
    'model CustomerSuccessAction {',
    '@@map("customer_success_profiles")',
    '@@map("customer_success_actions")',
    '@@unique([workspaceId])',
  ];

  for (const value of required) {
    if (!source.includes(value)) {
      throw new Error(`Promoted customer-success schema is missing: ${value}`);
    }
  }
}

function promoteSchema(source) {
  if (source.includes(marker)) {
    validatePromotedSchema(source);
    return { schema: source, changed: false };
  }

  const userAnchor = `  reviewedWorkspaceUpdates  WorkspaceWeeklyUpdate[]     @relation("WorkspaceUpdateReviewer")`;
  const workspaceAnchor = `  weeklyUpdates              WorkspaceWeeklyUpdate[]`;
  const projectAnchor = `  updates   WorkspaceWeeklyUpdate[]`;
  const intakeMarker = `// ─── Separated Intake Models ────────────────────────────────────────────────`;

  requireSingleAnchor(source, userAnchor, "User customer-success relation");
  requireSingleAnchor(source, workspaceAnchor, "Workspace customer-success relation");
  requireSingleAnchor(source, projectAnchor, "OrganizationProject customer-success relation");
  requireSingleAnchor(source, intakeMarker, "customer-success model insertion");

  let schema = source.replace(
    userAnchor,
    `${userAnchor}\n  ownedCustomerSuccessProfiles CustomerSuccessProfile[]    @relation("CustomerSuccessOwner")\n  createdCustomerSuccessActions CustomerSuccessAction[]     @relation("CustomerSuccessActionCreator")`,
  );

  schema = schema.replace(
    workspaceAnchor,
    `${workspaceAnchor}\n  customerSuccessProfile      CustomerSuccessProfile?\n  customerSuccessActions      CustomerSuccessAction[]`,
  );

  schema = schema.replace(
    projectAnchor,
    `${projectAnchor}\n  customerSuccessProfiles CustomerSuccessProfile[]\n  customerSuccessActions  CustomerSuccessAction[]`,
  );

  const models = `${marker}
model CustomerSuccessProfile {
  id                String   @id @default(cuid())
  workspaceId       String
  projectId         String?
  ownerUserId       String?
  lifecycleState    String   @default("ACTIVE")
  healthStatus      String   @default("UNKNOWN")
  outcomeStatus     String   @default("NOT_REVIEWED")
  satisfactionScore Int?
  outcomeSummary    String?
  lastReviewAt      DateTime?
  nextReviewAt      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  workspace Workspace            @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project   OrganizationProject? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  owner     User?                @relation("CustomerSuccessOwner", fields: [ownerUserId], references: [id], onDelete: SetNull)
  actions   CustomerSuccessAction[]

  @@unique([workspaceId])
  @@index([healthStatus, nextReviewAt])
  @@map("customer_success_profiles")
}

model CustomerSuccessAction {
  id          String   @id @default(cuid())
  profileId   String
  workspaceId String
  projectId   String?
  createdById String?
  actionType  String
  status      String   @default("PLANNED")
  title       String
  notes       String?
  dueAt       DateTime?
  completedAt DateTime?
  evidence    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile   CustomerSuccessProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  workspace Workspace              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project   OrganizationProject?   @relation(fields: [projectId], references: [id], onDelete: SetNull)
  createdBy User?                  @relation("CustomerSuccessActionCreator", fields: [createdById], references: [id], onDelete: SetNull)

  @@index([workspaceId, status, dueAt])
  @@index([profileId, actionType])
  @@map("customer_success_actions")
}

`;

  schema = schema.replace(intakeMarker, `${models}${intakeMarker}`);
  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = promoteSchema(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Customer-success Prisma promotion anchors are valid and ready."
      : "Customer-success Prisma models are present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted workspace-scoped customer-success models into Prisma schema.");
} else {
  console.log("Customer-success Prisma models already present.");
}
