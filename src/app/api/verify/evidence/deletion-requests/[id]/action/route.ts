import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().min(10).max(1000),
  })
  .strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  if (gate.session.role !== "super_admin") {
    return json(
      {
        error: "Only a super administrator may decide an evidence deletion request.",
        code: "EVIDENCE_DELETION_DECISION_ROLE_REQUIRED",
        deletionPerformed: false,
      },
      403,
    );
  }

  const { id } = await params;
  if (!id || id.length > 128) {
    return json({ error: "Deletion request identifier is invalid." }, 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Deletion request decision is invalid.",
        details: parsed.error.flatten().fieldErrors,
        deletionPerformed: false,
      },
      400,
    );
  }

  return json(
    {
      error:
        "Deletion decisions remain disabled until the protected gateway action is approved and deployed.",
      code: "EVIDENCE_DELETION_DECISION_GATEWAY_PENDING",
      deletionRequestId: id,
      requestedDecision: parsed.data.action,
      deletionPerformed: false,
      executionEndpointAvailable: false,
      failClosed: true,
    },
    503,
  );
}
