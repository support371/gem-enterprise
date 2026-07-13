import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { evaluatePilotEvidence } from "@/lib/kyc/pilot-evidence";

const querySchema = z.object({
  applicationId: z.string().trim().min(1),
  analystId: z.string().trim().min(1),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const parsed = querySchema.safeParse({
    applicationId: request.nextUrl.searchParams.get("applicationId"),
    analystId: request.nextUrl.searchParams.get("analystId"),
  });
  if (!parsed.success) {
    return json(
      {
        error: "Application ID and analyst ID are required.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  try {
    const [application, analyst] = await Promise.all([
      db.kYCApplication.findUnique({
        where: { id: parsed.data.applicationId },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              status: true,
              isActive: true,
              isEmailVerified: true,
            },
          },
          decision: true,
          reviews: { orderBy: { createdAt: "asc" } },
          documents: { select: { id: true } },
        },
      }),
      db.user.findUnique({
        where: { id: parsed.data.analystId },
        select: {
          id: true,
          role: true,
          status: true,
          isActive: true,
          isEmailVerified: true,
        },
      }),
    ]);

    if (!application) return json({ error: "Verification application not found." }, 404);
    if (!analyst) return json({ error: "Analyst account not found." }, 404);

    const decisionMaker = application.decision
      ? await db.user.findUnique({
          where: { id: application.decision.decisionBy },
          select: {
            id: true,
            role: true,
            status: true,
            isActive: true,
            isEmailVerified: true,
          },
        })
      : null;

    const audits = await db.auditLog.findMany({
      where: {
        OR: [
          {
            resource: "verification_application",
            resourceId: application.id,
          },
          {
            action: "role_change",
            resource: "user",
            resourceId: analyst.id,
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        action: true,
        resource: true,
        resourceId: true,
        userId: true,
        metadata: true,
        createdAt: true,
      },
    });

    const report = evaluatePilotEvidence({
      application: {
        id: application.id,
        userId: application.userId,
        status: application.status,
        reviewerId: application.reviewerId,
        formData: application.formData,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        completedAt: application.completedAt,
        reviews: application.reviews,
        decision: application.decision,
        documentCount: application.documents.length,
      },
      applicant: application.user,
      analyst,
      decisionMaker,
      audits,
    });

    return json({
      ok: true,
      evaluatedAt: new Date().toISOString(),
      mutatesProductionData: false,
      applicationId: application.id,
      analystId: analyst.id,
      ...report,
    });
  } catch (error) {
    console.error("[GET /api/verify/pilot-evidence]", error);
    return json({ error: "Pilot evidence could not be evaluated." }, 500);
  }
}
