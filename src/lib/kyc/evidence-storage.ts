import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  GEM_VERIFY_EVIDENCE_BUCKET,
  GEM_VERIFY_MAX_FILE_BYTES,
  isAllowedEvidenceMimeType,
  type GemVerifyAllowedMimeType,
} from "@/lib/kyc/evidence-vault";

const SIGNED_UPLOAD_TTL_SECONDS = 2 * 60 * 60;
const SCANNER_READ_TTL_SECONDS = 10 * 60;
const CALLBACK_TTL_SECONDS = 30 * 60;

export class EvidenceStorageError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 503,
  ) {
    super(message);
    this.name = "EvidenceStorageError";
  }
}

type StorageConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

type ScannerConfig = {
  scannerUrl: string;
  scannerToken: string;
  callbackSecret: string;
  publicBaseUrl: string;
};

type ScannerCallbackPayload = {
  evidenceId: string;
  scanJobId: string;
  exp: number;
};

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

function normalizedBaseUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getEvidenceStorageConfig(): StorageConfig | null {
  const supabaseUrl =
    configured("SUPABASE_URL") || configured("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = configured("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) return null;
  return {
    supabaseUrl: normalizedBaseUrl(supabaseUrl),
    serviceRoleKey,
  };
}

export function getEvidenceScannerConfig(): ScannerConfig | null {
  const scannerUrl = configured("GEM_VERIFY_SCANNER_URL");
  const scannerToken = configured("GEM_VERIFY_SCANNER_TOKEN");
  const callbackSecret = configured("GEM_VERIFY_SCANNER_CALLBACK_SECRET");
  const publicBaseUrl =
    configured("GEM_VERIFY_PUBLIC_BASE_URL") ||
    configured("NEXT_PUBLIC_APP_URL") ||
    configured("VERCEL_PROJECT_PRODUCTION_URL");

  if (!scannerUrl || !scannerToken || !callbackSecret || !publicBaseUrl) {
    return null;
  }

  return {
    scannerUrl: normalizedBaseUrl(scannerUrl),
    scannerToken,
    callbackSecret,
    publicBaseUrl: normalizedBaseUrl(publicBaseUrl),
  };
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function storageApiUrl(config: StorageConfig, path: string) {
  return `${config.supabaseUrl}/storage/v1${path}`;
}

function serviceHeaders(config: StorageConfig, includeJson = false) {
  return {
    Authorization: `Bearer ${config.serviceRoleKey}`,
    apikey: config.serviceRoleKey,
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
  };
}

async function responseMessage(response: Response) {
  const text = await response.text().catch(() => "");
  return text.slice(0, 800) || `${response.status} ${response.statusText}`;
}

function completeStorageUrl(config: StorageConfig, value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const suffix = value.startsWith("/") ? value : `/${value}`;
  return `${config.supabaseUrl}/storage/v1${suffix}`;
}

export function sanitizeEvidenceFileName(value: string) {
  const leaf = value.normalize("NFKC").split(/[\\/]/).pop() ?? "evidence";
  const safe = leaf
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return safe || "evidence";
}

export function createEvidenceStoragePath(input: {
  applicationId: string;
  evidenceId: string;
  fileName: string;
}) {
  const application = input.applicationId.replace(/[^a-zA-Z0-9_-]/g, "");
  const evidence = input.evidenceId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `quarantine/${application}/${evidence}/${sanitizeEvidenceFileName(input.fileName)}`;
}

export async function createSignedEvidenceUpload(storagePath: string) {
  const config = getEvidenceStorageConfig();
  if (!config) {
    throw new EvidenceStorageError(
      "EVIDENCE_STORAGE_NOT_CONFIGURED",
      "Server-side evidence storage is not configured.",
    );
  }

  const endpoint = storageApiUrl(
    config,
    `/object/upload/sign/${encodeURIComponent(GEM_VERIFY_EVIDENCE_BUCKET)}/${encodeStoragePath(storagePath)}`,
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...serviceHeaders(config, true),
      "x-upsert": "false",
    },
    body: "{}",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new EvidenceStorageError(
      "SIGNED_UPLOAD_CREATION_FAILED",
      `Storage refused signed upload authorization: ${await responseMessage(response)}`,
      502,
    );
  }

  const data = (await response.json()) as {
    url?: string;
    signedUrl?: string;
    signedURL?: string;
  };
  const rawUrl = data.url ?? data.signedUrl ?? data.signedURL;
  if (!rawUrl) {
    throw new EvidenceStorageError(
      "SIGNED_UPLOAD_RESPONSE_INVALID",
      "Storage did not return a signed upload URL.",
      502,
    );
  }

  const signedUrl = completeStorageUrl(config, rawUrl);
  const token = new URL(signedUrl).searchParams.get("token");
  if (!token) {
    throw new EvidenceStorageError(
      "SIGNED_UPLOAD_TOKEN_MISSING",
      "Storage did not return a signed upload token.",
      502,
    );
  }

  return {
    signedUrl,
    token,
    expiresAt: new Date(Date.now() + SIGNED_UPLOAD_TTL_SECONDS * 1000),
  };
}

export async function createSignedEvidenceReadUrl(
  storagePath: string,
  expiresInSeconds = SCANNER_READ_TTL_SECONDS,
) {
  const config = getEvidenceStorageConfig();
  if (!config) {
    throw new EvidenceStorageError(
      "EVIDENCE_STORAGE_NOT_CONFIGURED",
      "Server-side evidence storage is not configured.",
    );
  }

  const endpoint = storageApiUrl(
    config,
    `/object/sign/${encodeURIComponent(GEM_VERIFY_EVIDENCE_BUCKET)}/${encodeStoragePath(storagePath)}`,
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: serviceHeaders(config, true),
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new EvidenceStorageError(
      "SIGNED_READ_CREATION_FAILED",
      `Storage refused signed read authorization: ${await responseMessage(response)}`,
      502,
    );
  }

  const data = (await response.json()) as {
    signedURL?: string;
    signedUrl?: string;
    url?: string;
  };
  const rawUrl = data.signedURL ?? data.signedUrl ?? data.url;
  if (!rawUrl) {
    throw new EvidenceStorageError(
      "SIGNED_READ_RESPONSE_INVALID",
      "Storage did not return a signed read URL.",
      502,
    );
  }

  return {
    signedUrl: completeStorageUrl(config, rawUrl),
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

export async function downloadEvidenceObject(storagePath: string) {
  const config = getEvidenceStorageConfig();
  if (!config) {
    throw new EvidenceStorageError(
      "EVIDENCE_STORAGE_NOT_CONFIGURED",
      "Server-side evidence storage is not configured.",
    );
  }

  const endpoint = storageApiUrl(
    config,
    `/object/authenticated/${encodeURIComponent(GEM_VERIFY_EVIDENCE_BUCKET)}/${encodeStoragePath(storagePath)}`,
  );
  const response = await fetch(endpoint, {
    method: "GET",
    headers: serviceHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new EvidenceStorageError(
      response.status === 404 ? "EVIDENCE_OBJECT_NOT_FOUND" : "EVIDENCE_OBJECT_DOWNLOAD_FAILED",
      `Evidence object could not be retrieved: ${await responseMessage(response)}`,
      response.status === 404 ? 404 : 502,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > GEM_VERIFY_MAX_FILE_BYTES) {
    throw new EvidenceStorageError(
      "EVIDENCE_OBJECT_SIZE_INVALID",
      "Stored evidence is empty or exceeds the approved file limit.",
      422,
    );
  }

  return {
    bytes,
    size: bytes.length,
    contentType: response.headers.get("content-type")?.split(";")[0]?.trim() ?? null,
    etag: response.headers.get("etag"),
  };
}

export function detectEvidenceMimeType(bytes: Buffer): GemVerifyAllowedMimeType | null {
  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(pngSignature)) {
    return "image/png";
  }
  return null;
}

export function sha256Hex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

export function validateStoredEvidence(input: {
  bytes: Buffer;
  declaredMimeType: string;
  declaredSize: number;
}) {
  const detectedMimeType = detectEvidenceMimeType(input.bytes);
  const errors: string[] = [];

  if (!detectedMimeType || !isAllowedEvidenceMimeType(detectedMimeType)) {
    errors.push("The stored file signature is not an approved evidence type.");
  }
  if (detectedMimeType && detectedMimeType !== input.declaredMimeType) {
    errors.push("The stored file signature does not match the declared MIME type.");
  }
  if (input.bytes.length !== input.declaredSize) {
    errors.push("The stored file size does not match the authorized upload size.");
  }

  return {
    valid: errors.length === 0,
    errors,
    detectedMimeType,
    size: input.bytes.length,
    sha256: sha256Hex(input.bytes),
  } as const;
}

function callbackSignature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createScannerCallbackToken(input: {
  evidenceId: string;
  scanJobId: string;
}) {
  const config = getEvidenceScannerConfig();
  if (!config) {
    throw new EvidenceStorageError(
      "EVIDENCE_SCANNER_NOT_CONFIGURED",
      "Evidence scanner callback authentication is not configured.",
    );
  }

  const payload: ScannerCallbackPayload = {
    evidenceId: input.evidenceId,
    scanJobId: input.scanJobId,
    exp: Math.floor(Date.now() / 1000) + CALLBACK_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${callbackSignature(encoded, config.callbackSecret)}`;
}

export function verifyScannerCallbackToken(token: string): ScannerCallbackPayload | null {
  const config = getEvidenceScannerConfig();
  if (!config) return null;

  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return null;

  const expectedSignature = callbackSignature(encoded, config.callbackSecret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as ScannerCallbackPayload;
    if (
      !parsed.evidenceId ||
      !parsed.scanJobId ||
      !Number.isFinite(parsed.exp) ||
      parsed.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function dispatchEvidenceScan(input: {
  evidenceId: string;
  scanJobId: string;
  storagePath: string;
  sha256: string;
  fileSizeBytes: number;
  mimeType: GemVerifyAllowedMimeType;
}) {
  const config = getEvidenceScannerConfig();
  if (!config) {
    throw new EvidenceStorageError(
      "EVIDENCE_SCANNER_NOT_CONFIGURED",
      "The evidence scanner is not configured.",
    );
  }

  const source = await createSignedEvidenceReadUrl(
    input.storagePath,
    SCANNER_READ_TTL_SECONDS,
  );
  const callbackToken = createScannerCallbackToken({
    evidenceId: input.evidenceId,
    scanJobId: input.scanJobId,
  });
  const callbackUrl = `${config.publicBaseUrl}/api/verify/evidence/scanner-callback`;

  const requestBody = {
    evidenceId: input.evidenceId,
    scanJobId: input.scanJobId,
    sourceUrl: source.signedUrl,
    sourceUrlExpiresAt: source.expiresAt.toISOString(),
    expectedSha256: input.sha256,
    expectedFileSizeBytes: input.fileSizeBytes,
    expectedMimeType: input.mimeType,
    callback: {
      url: callbackUrl,
      authorization: `Bearer ${callbackToken}`,
    },
  };

  const response = await fetch(config.scannerUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.scannerToken}`,
      "Content-Type": "application/json",
      "X-GEM-Verify-Scan-Job": input.scanJobId,
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });

  const responseText = await response.text().catch(() => "");
  let responsePayload: Record<string, unknown> = {};
  if (responseText) {
    try {
      responsePayload = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      responsePayload = { message: responseText.slice(0, 800) };
    }
  }

  if (!response.ok) {
    throw new EvidenceStorageError(
      "EVIDENCE_SCAN_DISPATCH_FAILED",
      `The scanning worker rejected the evidence scan request: ${responseText.slice(0, 800) || response.statusText}`,
      502,
    );
  }

  const providerJobId =
    typeof responsePayload.jobId === "string"
      ? responsePayload.jobId
      : typeof responsePayload.id === "string"
        ? responsePayload.id
        : null;

  return {
    providerJobId,
    requestPayload: requestBody,
    responsePayload,
  };
}
