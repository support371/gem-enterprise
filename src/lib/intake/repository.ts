import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type {
  CreateIntakeSubmissionInput,
  IntakeKind,
  IntakeStatus,
  IntakeStatusEventRecord,
  IntakeSubmissionRecord,
} from "@/lib/intake/types";

export class IntakeStoreUnavailableError extends Error {
  constructor() {
    super("The durable intake store has not been provisioned.");
    this.name = "IntakeStoreUnavailableError";
  }
}

function isMissingStore(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const value = `${error.name} ${error.message}`.toLowerCase();
  return (
    value.includes("intake_submissions") &&
    (value.includes("does not exist") || value.includes("42p01") || value.includes("p2010"))
  );
}

function publicIdForKind(kind: IntakeKind): string {
  const prefix = kind === "ENTERPRISE" ? "ENT" : kind === "COMMUNITY" ? "COM" : "PRD";
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return `GEM-${prefix}-${date}-${suffix}`;
}

const submissionSelect = Prisma.sql`
  SELECT
    id,
    public_id AS "publicId",
    kind,
    status,
    queue,
    user_id AS "userId",
    assigned_to_id AS "assignedToId",
    product_slug AS "productSlug",
    product_name AS "productName",
    product_sku AS "productSku",
    product_category AS "productCategory",
    name,
    email,
    phone,
    organization,
    title,
    jurisdiction,
    subject,
    message,
    payload,
    consent_version AS "consentVersion",
    consent_given_at AS "consentGivenAt",
    privacy_version AS "privacyVersion",
    privacy_accepted_at AS "privacyAcceptedAt",
    source,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM intake_submissions
`;

export async function createIntakeSubmission(
  input: CreateIntakeSubmissionInput,
): Promise<IntakeSubmissionRecord> {
  const id = randomUUID();
  const eventId = randomUUID();
  const publicId = publicIdForKind(input.kind);
  const now = new Date();

  try {
    return await db.$transaction(async (transaction) => {
      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO intake_submissions (
          id,
          public_id,
          kind,
          status,
          queue,
          user_id,
          product_slug,
          product_name,
          product_sku,
          product_category,
          name,
          email,
          phone,
          organization,
          title,
          jurisdiction,
          subject,
          message,
          payload,
          consent_version,
          consent_given_at,
          privacy_version,
          privacy_accepted_at,
          source,
          ip_hash,
          user_agent_hash,
          created_at,
          updated_at
        ) VALUES (
          ${id},
          ${publicId},
          CAST(${input.kind} AS "IntakeKind"),
          CAST('RECEIVED' AS "IntakeSubmissionStatus"),
          ${input.queue},
          ${input.userId ?? null},
          ${input.product?.slug ?? null},
          ${input.product?.name ?? null},
          ${input.product?.sku ?? null},
          ${input.product?.category ?? null},
          ${input.name},
          ${input.email},
          ${input.phone ?? null},
          ${input.organization ?? null},
          ${input.title ?? null},
          ${input.jurisdiction ?? null},
          ${input.subject},
          ${input.message},
          CAST(${JSON.stringify(input.payload)} AS jsonb),
          ${input.consentVersion},
          ${now},
          ${input.privacyVersion},
          ${now},
          ${input.source},
          ${input.ipHash ?? null},
          ${input.userAgentHash ?? null},
          ${now},
          ${now}
        )
      `);

      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO intake_status_events (
          id,
          submission_id,
          from_status,
          to_status,
          actor_id,
          reason,
          metadata,
          created_at
        ) VALUES (
          ${eventId},
          ${id},
          NULL,
          CAST('RECEIVED' AS "IntakeSubmissionStatus"),
          ${input.userId ?? null},
          'Public submission recorded',
          CAST(${JSON.stringify({ source: input.source, queue: input.queue })} AS jsonb),
          ${now}
        )
      `);

      const records = await transaction.$queryRaw<IntakeSubmissionRecord[]>(Prisma.sql`
        ${submissionSelect}
        WHERE id = ${id}
        LIMIT 1
      `);

      if (!records[0]) throw new Error("Intake submission was not returned after creation.");
      return records[0];
    });
  } catch (error) {
    if (isMissingStore(error)) throw new IntakeStoreUnavailableError();
    throw error;
  }
}

export async function listIntakeSubmissions(filters: {
  kind?: IntakeKind;
  status?: IntakeStatus;
  queue?: string;
  limit?: number;
}): Promise<IntakeSubmissionRecord[]> {
  const conditions: Prisma.Sql[] = [];
  if (filters.kind) conditions.push(Prisma.sql`kind = CAST(${filters.kind} AS "IntakeKind")`);
  if (filters.status) {
    conditions.push(
      Prisma.sql`status = CAST(${filters.status} AS "IntakeSubmissionStatus")`,
    );
  }
  if (filters.queue) conditions.push(Prisma.sql`queue = ${filters.queue}`);

  const where = conditions.length
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 250);

  try {
    return await db.$queryRaw<IntakeSubmissionRecord[]>(Prisma.sql`
      ${submissionSelect}
      ${where}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
  } catch (error) {
    if (isMissingStore(error)) throw new IntakeStoreUnavailableError();
    throw error;
  }
}

export async function getIntakeSubmission(
  id: string,
): Promise<{ submission: IntakeSubmissionRecord; events: IntakeStatusEventRecord[] } | null> {
  try {
    const submissions = await db.$queryRaw<IntakeSubmissionRecord[]>(Prisma.sql`
      ${submissionSelect}
      WHERE id = ${id}
      LIMIT 1
    `);
    const submission = submissions[0];
    if (!submission) return null;

    const events = await db.$queryRaw<IntakeStatusEventRecord[]>(Prisma.sql`
      SELECT
        id,
        submission_id AS "submissionId",
        from_status AS "fromStatus",
        to_status AS "toStatus",
        actor_id AS "actorId",
        reason,
        metadata,
        created_at AS "createdAt"
      FROM intake_status_events
      WHERE submission_id = ${id}
      ORDER BY created_at ASC
    `);

    return { submission, events };
  } catch (error) {
    if (isMissingStore(error)) throw new IntakeStoreUnavailableError();
    throw error;
  }
}

export async function updateIntakeSubmission(input: {
  id: string;
  status: IntakeStatus;
  actorId: string;
  reason: string;
  assignedToId?: string | null;
}): Promise<IntakeSubmissionRecord | null> {
  const eventId = randomUUID();
  const now = new Date();

  try {
    return await db.$transaction(async (transaction) => {
      const current = await transaction.$queryRaw<Array<{ status: IntakeStatus }>>(Prisma.sql`
        SELECT status
        FROM intake_submissions
        WHERE id = ${input.id}
        FOR UPDATE
      `);
      if (!current[0]) return null;

      await transaction.$executeRaw(Prisma.sql`
        UPDATE intake_submissions
        SET
          status = CAST(${input.status} AS "IntakeSubmissionStatus"),
          assigned_to_id = COALESCE(${input.assignedToId ?? null}, assigned_to_id),
          updated_at = ${now}
        WHERE id = ${input.id}
      `);

      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO intake_status_events (
          id,
          submission_id,
          from_status,
          to_status,
          actor_id,
          reason,
          metadata,
          created_at
        ) VALUES (
          ${eventId},
          ${input.id},
          CAST(${current[0].status} AS "IntakeSubmissionStatus"),
          CAST(${input.status} AS "IntakeSubmissionStatus"),
          ${input.actorId},
          ${input.reason},
          CAST(${JSON.stringify({ assignedToId: input.assignedToId ?? null })} AS jsonb),
          ${now}
        )
      `);

      const records = await transaction.$queryRaw<IntakeSubmissionRecord[]>(Prisma.sql`
        ${submissionSelect}
        WHERE id = ${input.id}
        LIMIT 1
      `);
      return records[0] ?? null;
    });
  } catch (error) {
    if (isMissingStore(error)) throw new IntakeStoreUnavailableError();
    throw error;
  }
}
