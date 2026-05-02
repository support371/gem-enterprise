import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";

const entityTypeSchema = z.enum(["individual", "business", "trust", "family_office"]);

const kycSubmissionSchema = z
  .object({
    entityType: entityTypeSchema,
    formData: z.record(z.unknown()).optional(),
  })
  .passthrough();

function normalizeEntityType(value: string) {
  return value === "family-office" ? "family_office" : value;
}

function normalizeFormData(body: Record<string, unknown>) {
  const { entityType, formData, ...rest } = body;
  const submittedFormData =
    formData && typeof formData === "object" && !Array.isArray(formData)
      ? (formData as Record<string, unknown>)
      : {};

  return {
    ...submittedFormData,
    ...rest,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await db.kYCApplication.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      documents: true,
      decision: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ ok: true, application });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rawBody = await req.json();
    const normalizedBody = {
      ...(rawBody ?? {}),
      entityType: normalizeEntityType(String(rawBody?.entityType ?? "")),
    };

    const parsed = kycSubmissionSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid KYC submission", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const formData = normalizeFormData(parsed.data as Record<string, unknown>);

    const application = await db.kYCApplication.create({
      data: {
        userId: session.userId,
        entityType: parsed.data.entityType,
        status: "in_progress",
        data: formData,
        formData,
        submittedAt: new Date(),
      },
    });

    await db.profile.upsert({
      where: { userId: session.userId },
      update: {
        entityType: parsed.data.entityType,
        firstName: typeof formData.firstName === "string" ? formData.firstName : undefined,
        lastName: typeof formData.lastName === "string" ? formData.lastName : undefined,
        country: typeof formData.country === "string" ? formData.country : undefined,
        phone: typeof formData.phone === "string" ? formData.phone : undefined,
      },
      create: {
        userId: session.userId,
        entityType: parsed.data.entityType,
        firstName: typeof formData.firstName === "string" ? formData.firstName : undefined,
        lastName: typeof formData.lastName === "string" ? formData.lastName : undefined,
        country: typeof formData.country === "string" ? formData.country : undefined,
        phone: typeof formData.phone === "string" ? formData.phone : undefined,
      },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "kyc_submit",
      resource: "kyc_application",
      resourceId: application.id,
      metadata: {
        entityType: parsed.data.entityType,
        status: application.status,
      },
    });

    return NextResponse.json({ ok: true, application });
  } catch (error) {
    console.error("[POST /api/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
