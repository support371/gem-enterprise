import type {
  CreateIntakeSubmissionInput,
  IntakeKind,
  IntakeStatus,
  IntakeStatusEventRecord,
  IntakeSubmissionRecord,
} from "@/lib/intake/types";
import { createIntakeGatewayCapability, type IntakeGatewayAction } from "@/lib/intake/gateway-capability";
import { hasDirectDatabaseConfiguration } from "@/lib/supabase-gateway";

const DEFAULT_INTAKE_GATEWAY_URL =
  "https://zaoqyzygptwbdelweskj.supabase.co/functions/v1/gem-intake-gateway";
const DEFAULT_INTAKE_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphb3F5enlncHR3YmRlbHdlc2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDY2NDIsImV4cCI6MjA4NDI4MjY0Mn0.g_8vrbhd9PU9a9ludnCl_aUIXuGmuCY0b8fX_03IrEQ";
const REQUEST_TIMEOUT_MS = 30_000;

export class IntakeGatewayRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly currentStatus?: IntakeStatus,
  ) {
    super(message);
    this.name = "IntakeGatewayRequestError";
  }
}

type SerializedSubmission = Omit<
  IntakeSubmissionRecord,
  "consentGivenAt" | "privacyAcceptedAt" | "createdAt" | "updatedAt"
> & {
  consentGivenAt: string;
  privacyAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
};

type SerializedEvent = Omit<IntakeStatusEventRecord, "createdAt"> & {
  createdAt: string;
};

interface GatewayBody {
  submission?: SerializedSubmission;
  submissions?: SerializedSubmission[];
  events?: SerializedEvent[];
  outcome?: "converted" | "already_converted" | "ignored" | "not_found";
  status?: string;
  error?: string;
  code?: string;
  currentStatus?: IntakeStatus;
}

export function shouldUseIntakeGateway(): boolean {
  if (process.env.GEM_INTAKE_GATEWAY_ENABLED === "false") return false;
  if (process.env.GEM_INTAKE_GATEWAY_ENABLED === "true") return true;
  return !hasDirectDatabaseConfiguration();
}

function deserializeSubmission(submission: SerializedSubmission): IntakeSubmissionRecord {
  return {
    ...submission,
    consentGivenAt: new Date(submission.consentGivenAt),
    privacyAcceptedAt: new Date(submission.privacyAcceptedAt),
    createdAt: new Date(submission.createdAt),
    updatedAt: new Date(submission.updatedAt),
  };
}

function deserializeEvent(event: SerializedEvent): IntakeStatusEventRecord {
  return { ...event, createdAt: new Date(event.createdAt) };
}

async function gatewayRequest(
  body: Record<string, unknown>,
  options?: { action?: IntakeGatewayAction; intakeId?: string | null; actorId?: string | null },
): Promise<GatewayBody> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = process.env.GEM_INTAKE_GATEWAY_URL?.trim() || DEFAULT_INTAKE_GATEWAY_URL;
    const key =
      process.env.GEM_INTAKE_GATEWAY_ANON_KEY?.trim() || DEFAULT_INTAKE_GATEWAY_ANON_KEY;
    const capability = options?.action
      ? await createIntakeGatewayCapability({
          action: options.action,
          intakeId: options.intakeId ?? null,
          actorId: options.actorId ?? null,
        })
      : null;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(capability ? { ...body, capability } : body),
      cache: "no-store",
      signal: controller.signal,
    });
    const responseBody = (await response.json().catch(() => ({}))) as GatewayBody;

    if (!response.ok) {
      throw new IntakeGatewayRequestError(
        response.status,
        responseBody.code || "INTAKE_GATEWAY_FAILED",
        responseBody.error || "The intake gateway request failed.",
        responseBody.currentStatus,
      );
    }
    return responseBody;
  } catch (error) {
    if (error instanceof IntakeGatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new IntakeGatewayRequestError(
        504,
        "INTAKE_GATEWAY_TIMEOUT",
        "The intake gateway timed out.",
      );
    }
    throw new IntakeGatewayRequestError(
      503,
      "INTAKE_GATEWAY_UNAVAILABLE",
      "The intake gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function createIntakeSubmissionViaGateway(
  input: CreateIntakeSubmissionInput,
): Promise<IntakeSubmissionRecord> {
  const body = await gatewayRequest({ action: "create", input });
  if (!body.submission) {
    throw new IntakeGatewayRequestError(
      502,
      "INTAKE_GATEWAY_INVALID_RESPONSE",
      "The intake gateway returned an invalid response.",
    );
  }
  return deserializeSubmission(body.submission);
}

export async function listIntakeSubmissionsViaGateway(filters: {
  kind?: IntakeKind;
  status?: IntakeStatus;
  queue?: string;
  limit?: number;
}): Promise<IntakeSubmissionRecord[]> {
  const body = await gatewayRequest(
    { action: "list", filters },
    { action: "list", intakeId: null },
  );
  return (body.submissions ?? []).map(deserializeSubmission);
}

export async function getIntakeSubmissionViaGateway(
  id: string,
): Promise<{ submission: IntakeSubmissionRecord; events: IntakeStatusEventRecord[] } | null> {
  try {
    const body = await gatewayRequest(
      { action: "get", intakeId: id },
      { action: "get", intakeId: id },
    );
    if (!body.submission) return null;
    return {
      submission: deserializeSubmission(body.submission),
      events: (body.events ?? []).map(deserializeEvent),
    };
  } catch (error) {
    if (error instanceof IntakeGatewayRequestError && error.statusCode === 404) return null;
    throw error;
  }
}

export async function updateIntakeSubmissionViaGateway(input: {
  id: string;
  status: IntakeStatus;
  expectedStatus: IntakeStatus;
  actorId: string;
  reason: string;
  assignedToId?: string | null;
}): Promise<IntakeSubmissionRecord | null> {
  const transition: Record<string, unknown> = {
    status: input.status,
    expectedStatus: input.expectedStatus,
    reason: input.reason,
  };
  if (input.assignedToId !== undefined) transition.assignedToId = input.assignedToId;

  try {
    const body = await gatewayRequest(
      { action: "update", intakeId: input.id, transition },
      { action: "update", intakeId: input.id, actorId: input.actorId },
    );
    return body.submission ? deserializeSubmission(body.submission) : null;
  } catch (error) {
    if (error instanceof IntakeGatewayRequestError && error.statusCode === 404) return null;
    throw error;
  }
}

export async function convertIntakeAfterPaymentViaGateway(input: {
  publicId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  offerCode: string;
  amountUsd: number;
}): Promise<
  | { outcome: "converted" }
  | { outcome: "already_converted" }
  | { outcome: "ignored"; status: string }
  | { outcome: "not_found" }
> {
  const body = await gatewayRequest(
    {
      action: "convert",
      publicId: input.publicId,
      payment: {
        stripeSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId ?? null,
        offerCode: input.offerCode,
        amountUsd: input.amountUsd,
      },
    },
    { action: "convert", intakeId: input.publicId },
  );
  if (body.outcome === "converted" || body.outcome === "already_converted" || body.outcome === "not_found") {
    return { outcome: body.outcome };
  }
  return { outcome: "ignored", status: body.status || "UNKNOWN" };
}
