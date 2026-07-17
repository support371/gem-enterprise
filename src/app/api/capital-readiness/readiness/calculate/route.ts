import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { calculateCapitalReadiness } from "@/lib/capital-readiness/workflow";
import { capitalReadinessCalculationSchema } from "@/lib/capital-readiness/validation";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = capitalReadinessCalculationSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  return json({
    methodologyVersion: "1.0",
    calculatedBy: gate.session.userId,
    decision: calculateCapitalReadiness(parsed.data.workstreams),
  });
}
