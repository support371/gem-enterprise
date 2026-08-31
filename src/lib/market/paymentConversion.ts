import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";

export type PaymentConversionResult =
  | { outcome: "converted" }
  | { outcome: "already_converted" }
  | { outcome: "ignored"; status: string }
  | { outcome: "not_found" };

export async function convertApprovedIntakeAfterVerifiedPayment(input: {
  intakeId: string;
  publicId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
}): Promise<PaymentConversionResult> {
  return db.$transaction(async (transaction) => {
    const records = await transaction.$queryRaw<
      Array<{ id: string; publicId: string; status: string; kind: string }>
    >(Prisma.sql`
      SELECT id, public_id AS "publicId", status::text AS status, kind::text AS kind
      FROM intake_submissions
      WHERE id = ${input.intakeId}
      FOR UPDATE
    `);
    const current = records[0];
    if (!current || current.publicId !== input.publicId || current.kind !== "ENTERPRISE") {
      return { outcome: "not_found" } as const;
    }
    if (current.status === "CONVERTED") return { outcome: "already_converted" } as const;
    if (current.status !== "APPROVED") {
      return { outcome: "ignored", status: current.status } as const;
    }

    const now = new Date();
    await transaction.$executeRaw(Prisma.sql`
      UPDATE intake_submissions
      SET status = CAST('CONVERTED' AS "IntakeSubmissionStatus"), updated_at = ${now}
      WHERE id = ${input.intakeId}
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
        ${randomUUID()},
        ${input.intakeId},
        CAST('APPROVED' AS "IntakeSubmissionStatus"),
        CAST('CONVERTED' AS "IntakeSubmissionStatus"),
        NULL,
        'Verified GEM Stripe payment completed',
        CAST(${JSON.stringify({
          source: "stripe_webhook",
          stripeSessionId: input.stripeSessionId,
          stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          offerCode: foundingBusinessReviewOffer.code,
          amountUsd: foundingBusinessReviewOffer.priceUsd,
        })} AS jsonb),
        ${now}
      )
    `);

    return { outcome: "converted" } as const;
  });
}
