import { timingSafeEqual } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GEM_VERIFY_MAX_FILE_BYTES } from "@/lib/kyc/evidence-vault";
import { runGemStaticEvidenceScan } from "@/lib/kyc/evidence-static-scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_REQUEST_BYTES = 32 * 1024;
const SOURCE_FETCH_TIMEOUT_MS = 20_000;
const CALLBACK_TIMEOUT_MS = 15_000;

const scannerRequestSchema = z
  .object({
    evidenceId: z.string().uuid(),
    scanJobId: z.string().uuid(),
    sourceUrl: z.string().url().max(4000),
    sourceUrlExpiresAt: z.string().datetime(),
    expectedSha256: z.string().regex(/^[a-f0-9]{64}$/i),
    expectedFileSizeBytes: z.number().int().min(1).max(GEM_VERIFY_MAX_FILE_BYTES),
    expectedMimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
    callback: z
      .object({
        url: z.string().url().max(2000),
        authorization: z.string().min(20).max(5000),
      })
      .strict(),
  })
  .strict();

type ScannerRequest = z.infer<typeof scannerRequestSchema>;

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

function normalizedUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol.replace(/\/+$/, ""));
}

function bearer(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-gem-verify-scanner-token")?.trim() ?? "";
}

function secureEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function scannerToken() {
  const token = configured("GEM_VERIFY_SCANNER_TOKEN");
  return token.length >= 32 ? token : "";
}

function approvedSourceOrigin() {
  const value = configured("SUPABASE_URL") || configured("NEXT_PUBLIC_SUPABASE_URL");
  return value ? normalizedUrl(value).origin : null;
}

function approvedCallbackOrigin() {
  const value =
    configured("GEM_VERIFY_PUBLIC_BASE_URL") ||
    configured("NEXT_PUBLIC_APP_URL") ||
    configured("VERCEL_PROJECT_PRODUCTION_URL");
  return value ? normalizedUrl(value).origin : null;
}

function validateDestinations(data: ScannerRequest) {
  const errors: string[] = [];
  const source = new URL(data.sourceUrl);
  const callback = new URL(data.callback.url);
  const sourceOrigin = approvedSourceOrigin();
  const callbackOrigin = approvedCallbackOrigin();

  if (source.protocol !== "https:") errors.push("The evidence source must use HTTPS.");
  if (!sourceOrigin || source.origin !== sourceOrigin) {
    errors.push("The evidence source is not the configured private storage origin.");
  }
  if (
    !source.pathname.startsWith("/storage/v1/object/sign/gem-verify-evidence/") &&
    !source.pathname.startsWith("/storage/v1/object/authenticated/gem-verify-evidence/")
  ) {
    errors.push("The evidence source is outside the approved private bucket path.");
  }

  if (callback.protocol !== "https:") errors.push("The scanner callback must use HTTPS.");
  if (!callbackOrigin || callback.origin !== callbackOrigin) {
    errors.push("The scanner callback is not the configured GEM production origin.");
  }
  if (callback.pathname !== "/api/verify/evidence/scanner-callback") {
    errors.push("The scanner callback path is not approved.");
  }
  if (!data.callback.authorization.startsWith("Bearer ")) {
    errors.push("The scanner callback authorization is invalid.");
  }

  const expiresAt = new Date(data.sourceUrlExpiresAt).getTime();
  const remaining = expiresAt - Date.now();
  if (!Number.isFinite(expiresAt) || remaining <= 0 || remaining > 15 * 60 * 1000) {
    errors.push("The evidence source authorization is expired or exceeds the scanner window.");
  }

  return errors;
}

async function postCallback(
  data: ScannerRequest,
  payload: Record<string, unknown>,
) {
  const response = await fetch(data.callback.url, {
    method: "POST",
    headers: {
      Authorization: data.callback.authorization,
      "Content-Type": "application/json",
      "X-GEM-Verify-Engine": "gem-static-safety-v1",
    },
    body: JSON.stringify({
      evidenceId: data.evidenceId,
      scanJobId: data.scanJobId,
      ...payload,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(CALLBACK_TIMEOUT_MS),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Scanner callback failed with HTTP ${response.status}: ${message.slice(0, 300)}`);
  }
}

async function executeScan(data: ScannerRequest) {
  try {
    await postCallback(data, {
      status: "running",
      engine: "gem-static-safety-v1",
      details: {
        firstParty: true,
        assurance: "structural_file_safety_only",
      },
    });

    const response = await fetch(data.sourceUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Private evidence retrieval failed with HTTP ${response.status}.`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > GEM_VERIFY_MAX_FILE_BYTES) {
      throw new Error("Private evidence exceeds the approved file-size limit.");
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > GEM_VERIFY_MAX_FILE_BYTES) {
      throw new Error("Private evidence is empty or exceeds the approved file-size limit.");
    }

    const result = runGemStaticEvidenceScan({
      bytes,
      mimeType: data.expectedMimeType,
      expectedSha256: data.expectedSha256,
      expectedFileSizeBytes: data.expectedFileSizeBytes,
    });

    await postCallback(data, {
      status:
        result.status === "passed"
          ? "passed"
          : result.status === "failed"
            ? "failed"
            : "error",
      sha256: result.sha256,
      engine: result.engine,
      signature: result.signature,
      details: {
        firstParty: true,
        scannerStatus: result.status,
        findings: result.findings,
        ...result.details,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Internal scanner failure.";
    try {
      await postCallback(data, {
        status: "error",
        engine: "gem-static-safety-v1",
        signature: "GEM_SCANNER_RUNTIME_ERROR",
        details: {
          firstParty: true,
          assurance: "structural_file_safety_only",
          error: message,
        },
      });
    } catch (callbackError) {
      console.error("[GEM Verify internal scanner] terminal callback failed", {
        scanJobId: data.scanJobId,
        error: callbackError instanceof Error ? callbackError.message.slice(0, 500) : "unknown",
      });
    }
  }
}

export async function GET() {
  return json({
    ok: true,
    service: "gem-verify-first-party-scanner",
    engine: "gem-static-safety-v1",
    configured: Boolean(scannerToken() && approvedSourceOrigin() && approvedCallbackOrigin()),
    capabilities: {
      pdfStructure: true,
      imageStructure: true,
      checksumIntegrity: true,
      activePdfContentBlocking: true,
      polyglotTrailingDataBlocking: true,
      antivirusEquivalent: false,
      biometricAnalysis: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "Scanner request payload is too large." }, 413);
  }

  const expectedToken = scannerToken();
  const suppliedToken = bearer(request);
  if (!expectedToken || !suppliedToken || !secureEqual(suppliedToken, expectedToken)) {
    return json({ error: "Unauthorized scanner request." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Scanner request body must be valid JSON." }, 400);
  }

  const parsed = scannerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Scanner request payload is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const destinationErrors = validateDestinations(parsed.data);
  if (destinationErrors.length) {
    return json(
      {
        error: "Scanner source or callback authorization is not approved.",
        details: destinationErrors,
      },
      403,
    );
  }

  after(() => executeScan(parsed.data));

  return json(
    {
      ok: true,
      jobId: parsed.data.scanJobId,
      status: "accepted",
      engine: "gem-static-safety-v1",
      firstParty: true,
      antivirusEquivalent: false,
    },
    202,
  );
}
