import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Communication Governance ─────────────────────────────────────────────";

function occurrences(source, search) {
  return source.split(search).length - 1;
}

function requireSingleAnchor(source, search, label) {
  const count = occurrences(source, search);
  if (count !== 1) throw new Error(`Expected exactly one ${label} anchor, found ${count}.`);
}

function validatePromotedSchema(source) {
  const required = [
    marker,
    "communicationPreferences",
    "changedCommunicationPreferences",
    "communicationPreferenceEvents",
    'model CommunicationPreference {',
    'model CommunicationPreferenceEvent {',
    '@@map("communication_preferences")',
    '@@map("communication_preference_events")',
    '@@unique([channel, destinationNormalized, purpose], map: "communication_preferences_channel_destination_purpose_key")',
    '@@index([status, purpose, channel], map: "communication_preferences_status_purpose_idx")',
    '@@index([userId], map: "communication_preferences_userId_idx")',
    '@@index([preferenceId, createdAt], map: "communication_preference_events_preferenceId_createdAt_idx")',
    'onDelete: Restrict',
  ];
  for (const value of required) {
    if (!source.includes(value)) throw new Error(`Promoted communication-governance schema is missing: ${value}`);
  }
}

function promoteSchema(source) {
  if (source.includes(marker)) {
    validatePromotedSchema(source);
    return { schema: source, changed: false };
  }

  const userAnchor = `  reviewedWorkspaceUpdates  WorkspaceWeeklyUpdate[]     @relation("WorkspaceUpdateReviewer")`;
  const intakeMarker = `// ─── Separated Intake Models ────────────────────────────────────────────────`;
  requireSingleAnchor(source, userAnchor, "User communication-governance relation");
  requireSingleAnchor(source, intakeMarker, "communication-governance model insertion");

  let schema = source.replace(
    userAnchor,
    `${userAnchor}\n  communicationPreferences        CommunicationPreference[]      @relation("CommunicationPreferenceUser")\n  changedCommunicationPreferences CommunicationPreference[]      @relation("CommunicationPreferenceChangedBy")\n  communicationPreferenceEvents   CommunicationPreferenceEvent[] @relation("CommunicationPreferenceActor")`,
  );

  const models = `${marker}
model CommunicationPreference {
  id                    String   @id @default(cuid())
  userId                String?
  channel               String
  destinationNormalized String
  purpose               String
  status                String   @default("PENDING")
  basis                 String?
  jurisdiction          String?
  source                String
  evidenceRef           String?
  changedById           String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user      User? @relation("CommunicationPreferenceUser", fields: [userId], references: [id], onDelete: SetNull)
  changedBy User? @relation("CommunicationPreferenceChangedBy", fields: [changedById], references: [id], onDelete: SetNull)
  events    CommunicationPreferenceEvent[]

  @@unique([channel, destinationNormalized, purpose], map: "communication_preferences_channel_destination_purpose_key")
  @@index([status, purpose, channel], map: "communication_preferences_status_purpose_idx")
  @@index([userId], map: "communication_preferences_userId_idx")
  @@map("communication_preferences")
}

model CommunicationPreferenceEvent {
  id           String   @id @default(cuid())
  preferenceId String
  eventType    String
  actorUserId  String?
  source       String
  evidence     Json     @default("{}")
  createdAt    DateTime @default(now())

  preference CommunicationPreference @relation(fields: [preferenceId], references: [id], onDelete: Restrict)
  actorUser   User? @relation("CommunicationPreferenceActor", fields: [actorUserId], references: [id], onDelete: SetNull)

  @@index([preferenceId, createdAt], map: "communication_preference_events_preferenceId_createdAt_idx")
  @@map("communication_preference_events")
}

`;

  schema = schema.replace(intakeMarker, `${models}${intakeMarker}`);
  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = promoteSchema(current);

if (checkOnly) {
  console.log(result.changed
    ? "Communication-governance Prisma promotion anchors are valid and ready."
    : "Communication-governance Prisma models are present and structurally complete.");
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted communication-governance models into Prisma schema.");
} else {
  console.log("Communication-governance Prisma models already present.");
}
