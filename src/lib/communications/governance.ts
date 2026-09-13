import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const communicationChannels = ["EMAIL", "SMS", "PHONE"] as const;
export const communicationPurposes = ["MARKETING", "TRANSACTIONAL", "SUPPORT"] as const;
export const communicationStatuses = ["PENDING", "ALLOWED", "BLOCKED"] as const;
export const communicationBases = [
  "EXPLICIT_CONSENT",
  "EXISTING_RELATIONSHIP",
  "LEGITIMATE_INTEREST_REVIEWED",
  "TRANSACTIONAL_NECESSITY",
  "OTHER_REVIEWED",
] as const;

export type CommunicationChannel = (typeof communicationChannels)[number];
export type CommunicationPurpose = (typeof communicationPurposes)[number];
export type CommunicationStatus = (typeof communicationStatuses)[number];
export type CommunicationBasis = (typeof communicationBases)[number];

export interface CommunicationPreferenceRecord {
  id: string;
  userId: string | null;
  channel: CommunicationChannel;
  destinationNormalized: string;
  purpose: CommunicationPurpose;
  status: CommunicationStatus;
  basis: CommunicationBasis | null;
  jurisdiction: string | null;
  source: string;
  evidenceRef: string | null;
  changedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CommunicationGovernanceUnavailableError extends Error {
  constructor() {
    super("Communication governance storage is not ready. Apply the communication-governance migration before enabling campaign delivery.");
    this.name = "CommunicationGovernanceUnavailableError";
  }
}

export class CommunicationResubscriptionRequiredError extends Error {
  constructor() {
    super("A recipient unsubscribe cannot be overridden by an administrative allow. Record fresh explicit consent, its evidence reference, and explicit resubscription confirmation first.");
    this.name = "CommunicationResubscriptionRequiredError";
  }
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isStorageMissing(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /communication_preferences|communication_preference_events|relation .* does not exist|42P01/i.test(message);
}

export async function listCommunicationPreferences(limit = 500): Promise<CommunicationPreferenceRecord[]> {
  try {
    return await db.$queryRaw<CommunicationPreferenceRecord[]>(Prisma.sql`
      SELECT "id", "userId", "channel", "destinationNormalized", "purpose", "status", "basis",
             "jurisdiction", "source", "evidenceRef", "changedById", "createdAt", "updatedAt"
      FROM "communication_preferences"
      ORDER BY "updatedAt" DESC
      LIMIT ${limit}
    `);
  } catch (error) {
    if (isStorageMissing(error)) throw new CommunicationGovernanceUnavailableError();
    throw error;
  }
}

export async function listAllowedMarketingEmails(): Promise<Set<string>> {
  try {
    const rows = await db.$queryRaw<Array<{ destinationNormalized: string }>>(Prisma.sql`
      SELECT "destinationNormalized"
      FROM "communication_preferences"
      WHERE "channel" = 'EMAIL' AND "purpose" = 'MARKETING' AND "status" = 'ALLOWED'
    `);
    return new Set(rows.map((row) => normalizeEmail(row.destinationNormalized)));
  } catch (error) {
    if (isStorageMissing(error)) throw new CommunicationGovernanceUnavailableError();
    throw error;
  }
}

export async function isMarketingEmailAllowed(email: string): Promise<boolean> {
  const destinationNormalized = normalizeEmail(email);
  try {
    const rows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "communication_preferences"
      WHERE "channel" = 'EMAIL'
        AND "purpose" = 'MARKETING'
        AND "status" = 'ALLOWED'
        AND "destinationNormalized" = ${destinationNormalized}
      LIMIT 1
    `);
    return rows.length === 1;
  } catch (error) {
    if (isStorageMissing(error)) throw new CommunicationGovernanceUnavailableError();
    throw error;
  }
}

export async function setCommunicationPreference(input: {
  channel: CommunicationChannel;
  destination: string;
  purpose: CommunicationPurpose;
  status: CommunicationStatus;
  basis?: CommunicationBasis | null;
  jurisdiction?: string | null;
  source: string;
  evidenceRef?: string | null;
  userId?: string | null;
  changedById?: string | null;
  eventType?: "CREATED" | "ALLOWED" | "BLOCKED" | "UNSUBSCRIBED" | "RESUBSCRIBED";
  eventEvidence?: Record<string, unknown>;
  resubscribeConfirmed?: boolean;
}): Promise<string> {
  const destinationNormalized =
    input.channel === "EMAIL" ? normalizeEmail(input.destination) : input.destination.trim();
  if (!destinationNormalized) throw new Error("Communication destination is required");

  const id = randomUUID();
  const eventId = randomUUID();
  const eventEvidenceJson = JSON.stringify(input.eventEvidence ?? {});

  try {
    return await db.$transaction(async (tx) => {
      let eventType = input.eventType ?? (input.status === "ALLOWED" ? "ALLOWED" : input.status === "BLOCKED" ? "BLOCKED" : "CREATED");

      if (input.channel === "EMAIL" && input.purpose === "MARKETING" && input.status === "ALLOWED") {
        const existing = await tx.$queryRaw<Array<{
          id: string;
          status: CommunicationStatus;
          source: string;
          latestEventType: string | null;
        }>>(Prisma.sql`
          SELECT p."id", p."status", p."source",
            (
              SELECT e."eventType"
              FROM "communication_preference_events" e
              WHERE e."preferenceId" = p."id"
              ORDER BY e."createdAt" DESC, e."id" DESC
              LIMIT 1
            ) AS "latestEventType"
          FROM "communication_preferences" p
          WHERE p."channel" = 'EMAIL'
            AND p."purpose" = 'MARKETING'
            AND p."destinationNormalized" = ${destinationNormalized}
          LIMIT 1
          FOR UPDATE
        `);

        const current = existing[0];
        const recipientOptOutActive = Boolean(
          current &&
          current.status === "BLOCKED" &&
          (current.source === "recipient_unsubscribe" || current.latestEventType === "UNSUBSCRIBED"),
        );

        if (recipientOptOutActive) {
          if (
            input.basis !== "EXPLICIT_CONSENT" ||
            !input.evidenceRef?.trim() ||
            input.resubscribeConfirmed !== true
          ) {
            throw new CommunicationResubscriptionRequiredError();
          }
          eventType = "RESUBSCRIBED";
        }
      }

      const preferenceRows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        INSERT INTO "communication_preferences" (
          "id", "userId", "channel", "destinationNormalized", "purpose", "status", "basis",
          "jurisdiction", "source", "evidenceRef", "changedById", "updatedAt"
        ) VALUES (
          ${id}, ${input.userId ?? null}, ${input.channel}, ${destinationNormalized}, ${input.purpose},
          ${input.status}, ${input.basis ?? null}, ${input.jurisdiction ?? null}, ${input.source},
          ${input.evidenceRef ?? null}, ${input.changedById ?? null}, CURRENT_TIMESTAMP
        )
        ON CONFLICT ("channel", "destinationNormalized", "purpose") DO UPDATE SET
          "userId" = COALESCE(EXCLUDED."userId", "communication_preferences"."userId"),
          "status" = EXCLUDED."status",
          "basis" = COALESCE(EXCLUDED."basis", "communication_preferences"."basis"),
          "jurisdiction" = COALESCE(EXCLUDED."jurisdiction", "communication_preferences"."jurisdiction"),
          "source" = EXCLUDED."source",
          "evidenceRef" = COALESCE(EXCLUDED."evidenceRef", "communication_preferences"."evidenceRef"),
          "changedById" = EXCLUDED."changedById",
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING "id"
      `);
      const preferenceId = preferenceRows[0].id;

      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "communication_preference_events" (
          "id", "preferenceId", "eventType", "actorUserId", "source", "evidence"
        ) VALUES (
          ${eventId}, ${preferenceId}, ${eventType}, ${input.changedById ?? null}, ${input.source},
          CAST(${eventEvidenceJson} AS JSONB)
        )
      `);

      return preferenceId;
    });
  } catch (error) {
    if (isStorageMissing(error)) throw new CommunicationGovernanceUnavailableError();
    throw error;
  }
}

function unsubscribeSecret() {
  const value = process.env.COMMUNICATION_UNSUBSCRIBE_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error("COMMUNICATION_UNSUBSCRIBE_SECRET must be configured with at least 32 characters");
  }
  return value;
}

function encodePayload(value: object) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function createMarketingUnsubscribeToken(email: string, ttlDays = 365) {
  const payload = encodePayload({
    v: 1,
    email: normalizeEmail(email),
    purpose: "MARKETING",
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  });
  const signature = createHmac("sha256", unsubscribeSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyMarketingUnsubscribeToken(token: string): { email: string } {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new Error("Invalid unsubscribe token");
  const expected = createHmac("sha256", unsubscribeSecret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error("Invalid unsubscribe token");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    v?: number;
    email?: string;
    purpose?: string;
    exp?: number;
  };
  if (decoded.v !== 1 || decoded.purpose !== "MARKETING" || !decoded.email || !decoded.exp) {
    throw new Error("Invalid unsubscribe token");
  }
  if (decoded.exp < Date.now()) throw new Error("Expired unsubscribe token");
  return { email: normalizeEmail(decoded.email) };
}

export function marketingUnsubscribeUrl(email: string) {
  const base = (process.env.GEM_PUBLIC_BASE_URL || "https://www.gemcybersecurityassist.com").replace(/\/$/, "");
  return `${base}/unsubscribe?token=${encodeURIComponent(createMarketingUnsubscribeToken(email))}`;
}

export function oneClickUnsubscribeUrl(email: string) {
  const base = (process.env.GEM_PUBLIC_BASE_URL || "https://www.gemcybersecurityassist.com").replace(/\/$/, "");
  return `${base}/api/communications/unsubscribe?token=${encodeURIComponent(createMarketingUnsubscribeToken(email))}`;
}
