import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const checkOnly = process.argv.includes("--check");
const marker = "// ─── Separated Intake Models ────────────────────────────────────────────────";

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
    "enum IntakeKind {",
    "enum IntakeSubmissionStatus {",
    'intakeSubmissions         IntakeSubmission[] @relation("IntakeApplicant")',
    'assignedIntakeSubmissions IntakeSubmission[] @relation("IntakeAssignee")',
    'intakeStatusEvents        IntakeStatusEvent[] @relation("IntakeEventActor")',
    "model IntakeSubmission {",
    "model IntakeStatusEvent {",
    "@@index([userId])",
    '@@map("intake_submissions")',
    '@@map("intake_status_events")',
  ];

  for (const value of required) {
    if (!source.includes(value)) {
      throw new Error(`Promoted intake schema is missing: ${value}`);
    }
  }
}

function promoteSchema(source) {
  if (source.includes(marker)) {
    validatePromotedSchema(source);
    return { schema: source, changed: false };
  }

  const meetingAnchor = `enum MeetingStatus {
  REQUESTED
  CONFIRMED
  CANCELLED
  COMPLETED
}
`;
  const userAnchor = `  OAuthAuthorizationAttempt OAuthAuthorizationAttempt[]

  @@map("users")`;

  requireSingleAnchor(source, meetingAnchor, "MeetingStatus enum");
  requireSingleAnchor(source, userAnchor, "User relation");

  const enums = `

enum IntakeKind {
  ENTERPRISE
  COMMUNITY
  PRODUCT_REQUEST
}

enum IntakeSubmissionStatus {
  RECEIVED
  TRIAGE
  NEEDS_INFORMATION
  QUALIFIED
  APPROVED
  DECLINED
  CONVERTED
  CLOSED
}
`;

  let schema = source.replace(meetingAnchor, `${meetingAnchor}${enums}`);
  schema = schema.replace(
    userAnchor,
    `  OAuthAuthorizationAttempt OAuthAuthorizationAttempt[]
  intakeSubmissions         IntakeSubmission[] @relation("IntakeApplicant")
  assignedIntakeSubmissions IntakeSubmission[] @relation("IntakeAssignee")
  intakeStatusEvents        IntakeStatusEvent[] @relation("IntakeEventActor")

  @@map("users")`,
  );

  const models = `

${marker}

model IntakeSubmission {
  id                String                  @id
  publicId          String                  @unique @map("public_id")
  kind              IntakeKind
  status            IntakeSubmissionStatus @default(RECEIVED)
  queue             String
  userId            String?                 @map("user_id")
  assignedToId      String?                 @map("assigned_to_id")
  productSlug       String?                 @map("product_slug")
  productName       String?                 @map("product_name")
  productSku        String?                 @map("product_sku")
  productCategory   String?                 @map("product_category")
  name              String
  email             String
  phone             String?
  organization      String?
  title             String?
  jurisdiction      String?
  subject           String
  message           String
  payload           Json                    @default("{}")
  consentVersion    String                  @map("consent_version")
  consentGivenAt    DateTime                @map("consent_given_at")
  privacyVersion    String                  @map("privacy_version")
  privacyAcceptedAt DateTime                @map("privacy_accepted_at")
  source            String                  @default("web")
  ipHash            String?                 @map("ip_hash")
  userAgentHash     String?                 @map("user_agent_hash")
  createdAt         DateTime                @default(now()) @map("created_at")
  updatedAt         DateTime                @updatedAt @map("updated_at")

  user       User?               @relation("IntakeApplicant", fields: [userId], references: [id], onDelete: SetNull)
  assignedTo User?               @relation("IntakeAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  events     IntakeStatusEvent[]

  @@index([kind, status, createdAt])
  @@index([queue, status, createdAt])
  @@index([email, createdAt])
  @@index([productSlug, createdAt])
  @@index([userId])
  @@index([assignedToId, status])
  @@map("intake_submissions")
}

model IntakeStatusEvent {
  id           String                  @id
  submissionId String                  @map("submission_id")
  fromStatus   IntakeSubmissionStatus? @map("from_status")
  toStatus     IntakeSubmissionStatus  @map("to_status")
  actorId      String?                 @map("actor_id")
  reason       String?
  metadata     Json                    @default("{}")
  createdAt    DateTime                @default(now()) @map("created_at")

  submission IntakeSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  actor      User?            @relation("IntakeEventActor", fields: [actorId], references: [id], onDelete: SetNull)

  @@index([submissionId, createdAt])
  @@index([actorId, createdAt])
  @@map("intake_status_events")
}
`;

  schema = `${schema.trimEnd()}${models}\n`;
  validatePromotedSchema(schema);
  return { schema, changed: true };
}

const current = await readFile(schemaPath, "utf8");
const result = promoteSchema(current);

if (checkOnly) {
  console.log(
    result.changed
      ? "Intake Prisma promotion anchors are valid and ready."
      : "Intake Prisma models are present and structurally complete.",
  );
} else if (result.changed) {
  await writeFile(schemaPath, result.schema, "utf8");
  console.log("Promoted separated-intake models into prisma/schema.prisma.");
} else {
  console.log("Separated-intake Prisma models already present.");
}
