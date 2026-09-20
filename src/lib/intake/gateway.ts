import type {
  CreateIntakeSubmissionInput,
  IntakeSubmissionRecord,
} from "@/lib/intake/types";
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
  ) {
    super(message);
    this.name = "IntakeGatewayRequestError";
  }
}

interface GatewayBody {
  submission?: Omit<
    IntakeSubmissionRecord,
    "consentGivenAt" | "privacyAcceptedAt" | "createdAt" | "updatedAt"
  > & {
    consentGivenAt: string;
    privacyAcceptedAt: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  code?: string;
}

export function shouldUseIntakeGateway(): boolean {
  if (process.env.GEM_INTAKE_GATEWAY_ENABLED === "false") return false;
  if (process.env.GEM_INTAKE_GATEWAY_ENABLED === "true") return true;
  return !hasDirectDatabaseConfiguration();
}

export async function createIntakeSubmissionViaGateway(
  input: CreateIntakeSubmissionInput,
): Promise<IntakeSubmissionRecord> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url =
      process.env.GEM_INTAKE_GATEWAY_URL?.trim() || DEFAULT_INTAKE_GATEWAY_URL;
    const key =
      process.env.GEM_INTAKE_GATEWAY_ANON_KEY?.trim() ||
      DEFAULT_INTAKE_GATEWAY_ANON_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "create", input }),
      cache: "no-store",
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => ({}))) as GatewayBody;

    if (!response.ok || !body.submission) {
      throw new IntakeGatewayRequestError(
        response.status,
        body.code || "INTAKE_GATEWAY_FAILED",
        body.error || "The intake gateway request failed.",
      );
    }

    return {
      ...body.submission,
      consentGivenAt: new Date(body.submission.consentGivenAt),
      privacyAcceptedAt: new Date(body.submission.privacyAcceptedAt),
      createdAt: new Date(body.submission.createdAt),
      updatedAt: new Date(body.submission.updatedAt),
    };
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
