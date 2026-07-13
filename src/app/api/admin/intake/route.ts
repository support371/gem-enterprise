import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";
import {
  IntakeStoreUnavailableError,
  listIntakeSubmissions,
} from "@/lib/intake/repository";
import { intakeKinds, intakeStatuses } from "@/lib/intake/types";

const querySchema = z.object({
  kind: z.enum(intakeKinds).optional(),
  status: z.enum(intakeStatuses).optional(),
  queue: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(250).optional(),
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
    kind: request.nextUrl.searchParams.get("kind") || undefined,
    status: request.nextUrl.searchParams.get("status") || undefined,
    queue: request.nextUrl.searchParams.get("queue") || undefined,
    limit: request.nextUrl.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return json({ error: "Invalid intake queue filters" }, 400);
  }

  try {
    const submissions = await listIntakeSubmissions(parsed.data);
    const summary = submissions.reduce(
      (counts, item) => {
        counts.total += 1;
        counts.byKind[item.kind] = (counts.byKind[item.kind] ?? 0) + 1;
        counts.byStatus[item.status] = (counts.byStatus[item.status] ?? 0) + 1;
        return counts;
      },
      {
        total: 0,
        byKind: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
      },
    );

    return json({ submissions, summary, viewerRole: gate.session.role });
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[GET /api/admin/intake]", error);
    return json({ error: "Unable to load the intake queue" }, 500);
  }
}
