import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { db } from "@/lib/db";
import {
  CustomerSuccessStoreUnavailableError,
  createCustomerSuccessAction,
  customerHealthStatuses,
  customerLifecycleStates,
  customerOutcomeStatuses,
  customerSuccessActionStatuses,
  customerSuccessActionTypes,
  listCustomerSuccessActions,
  listCustomerSuccessProfiles,
  updateCustomerSuccessActionStatus,
  upsertCustomerSuccessProfile,
} from "@/lib/customer-success/repository";

const nullableDate = z.string().datetime().nullable().optional();

const profileSchema = z.object({
  kind: z.literal("profile"),
  workspaceId: z.string().trim().min(1).max(120),
  projectId: z.string().trim().min(1).max(120).nullable().optional(),
  ownerUserId: z.string().trim().min(1).max(120).nullable().optional(),
  lifecycleState: z.enum(customerLifecycleStates).optional(),
  healthStatus: z.enum(customerHealthStatuses).optional(),
  outcomeStatus: z.enum(customerOutcomeStatuses).optional(),
  satisfactionScore: z.number().int().min(0).max(10).nullable().optional(),
  outcomeSummary: z.string().trim().max(4000).nullable().optional(),
  lastReviewAt: nullableDate,
  nextReviewAt: nullableDate,
});

const actionSchema = z.object({
  kind: z.literal("action"),
  profileId: z.string().trim().min(1).max(120),
  actionType: z.enum(customerSuccessActionTypes),
  status: z.enum(customerSuccessActionStatuses).optional(),
  title: z.string().trim().min(3).max(240),
  notes: z.string().trim().max(4000).nullable().optional(),
  dueAt: nullableDate,
  evidence: z.record(z.string(), z.unknown()).optional(),
});

const postSchema = z.discriminatedUnion("kind", [profileSchema, actionSchema]);
const patchSchema = z.object({
  actionId: z.string().trim().min(1).max(120),
  status: z.enum(customerSuccessActionStatuses),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function dateValue(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function handleError(error: unknown, scope: string) {
  if (error instanceof CustomerSuccessStoreUnavailableError) {
    return json({ error: error.message, code: "CUSTOMER_SUCCESS_STORAGE_NOT_READY" }, 503);
  }
  if (error instanceof Error && /not found|does not belong/i.test(error.message)) {
    return json({ error: error.message }, 400);
  }
  console.error(`[customer-success:${scope}]`, error);
  return json({ error: "Unable to complete the customer-success operation" }, 500);
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const profileId = request.nextUrl.searchParams.get("profileId")?.trim();
  try {
    if (profileId) {
      const actions = await listCustomerSuccessActions(profileId);
      return json({ actions, viewerRole: gate.session.role });
    }

    const [profiles, workspaces] = await Promise.all([
      listCustomerSuccessProfiles(),
      db.workspace.findMany({
        select: {
          id: true,
          name: true,
          organization: { select: { id: true, name: true } },
          organizationProjects: {
            select: { id: true, name: true, status: true },
            orderBy: { updatedAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
        take: 250,
      }),
    ]);

    return json({ profiles, workspaces, viewerRole: gate.session.role });
  } catch (error) {
    return handleError(error, "get");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid customer-success request", details: parsed.error.flatten() }, 400);

  try {
    if (parsed.data.kind === "profile") {
      const profileId = await upsertCustomerSuccessProfile({
        workspaceId: parsed.data.workspaceId,
        projectId: parsed.data.projectId,
        ownerUserId: parsed.data.ownerUserId,
        lifecycleState: parsed.data.lifecycleState,
        healthStatus: parsed.data.healthStatus,
        outcomeStatus: parsed.data.outcomeStatus,
        satisfactionScore: parsed.data.satisfactionScore,
        outcomeSummary: parsed.data.outcomeSummary,
        lastReviewAt: dateValue(parsed.data.lastReviewAt),
        nextReviewAt: dateValue(parsed.data.nextReviewAt),
      });
      return json({ profileId }, 201);
    }

    const actionId = await createCustomerSuccessAction({
      profileId: parsed.data.profileId,
      createdById: gate.session.userId,
      actionType: parsed.data.actionType,
      status: parsed.data.status,
      title: parsed.data.title,
      notes: parsed.data.notes,
      dueAt: dateValue(parsed.data.dueAt),
      evidence: parsed.data.evidence,
    });
    return json({ actionId }, 201);
  } catch (error) {
    return handleError(error, "post");
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid customer-success update", details: parsed.error.flatten() }, 400);

  try {
    const changed = await updateCustomerSuccessActionStatus(parsed.data);
    if (!changed) return json({ error: "Customer-success action not found" }, 404);
    return json({ ok: true });
  } catch (error) {
    return handleError(error, "patch");
  }
}
