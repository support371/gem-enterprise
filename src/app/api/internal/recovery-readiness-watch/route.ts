import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const APP_URL = "https://www.gemcybersecurityassist.com";
const REPOSITORY = "support371/gem-enterprise";
const ISSUE_NUMBER = 200;
const CANONICAL_RECOVERY_URL = `${APP_URL}/forgot-password`;
const ADMIN_RECOVERY_EMAIL = "admin@gemcybersecurityassist.com";
const RUNTIME_LOG_WINDOW_MS = 60 * 60 * 1000;

type JsonObject = Record<string, unknown>;

type RecoveryReadiness = JsonObject & {
  emailDeliveryConfigured?: boolean;
};

type VercelDeployment = {
  uid?: string;
  url?: string;
  state?: string;
  readyState?: string;
  target?: string;
  meta?: {
    githubCommitSha?: string;
  };
};

type DatabaseIntegrityRow = {
  sessionVersionPresent: boolean;
  triggerCount: number;
  privilegesRevoked: boolean;
};

class VerificationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details: JsonObject = {},
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

function configured(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function bearer(request: NextRequest): string {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-gem-internal-job-token")?.trim() ?? "";
}

function secureEqual(left: string, right: string): boolean {
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

function requireEnvironment(names: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  const missing: string[] = [];

  for (const name of names) {
    const value = configured(name);
    if (!value) missing.push(name);
    values[name] = value;
  }

  if (missing.length > 0) {
    throw new VerificationError(
      "RECOVERY_WATCH_CONFIGURATION_MISSING",
      "Required recovery-watch configuration is missing.",
      { missing },
    );
  }

  return values;
}

async function responseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  allowedStatuses: number[] = [200],
): Promise<{ status: number; body: T }> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const body = await responseBody(response);

  if (!allowedStatuses.includes(response.status)) {
    throw new VerificationError("UPSTREAM_REQUEST_FAILED", `Upstream request returned HTTP ${response.status}.`, {
      url: new URL(url).origin + new URL(url).pathname,
      status: response.status,
    });
  }

  return { status: response.status, body: body as T };
}

async function githubJson<T>(
  path: string,
  init: RequestInit = {},
  allowedStatuses: number[] = [200],
): Promise<{ status: number; body: T }> {
  const token = configured("GITHUB_RECOVERY_WATCH_TOKEN");
  if (!token) {
    throw new VerificationError(
      "GITHUB_RECOVERY_WATCH_TOKEN_MISSING",
      "The GitHub recovery-watch token is not configured.",
    );
  }

  return fetchJson<T>(`https://api.github.com/repos/${REPOSITORY}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "gem-enterprise-recovery-watch",
      ...(init.headers as Record<string, string> | undefined),
    },
  }, allowedStatuses);
}

async function readPublicReadiness(): Promise<RecoveryReadiness> {
  const { body } = await fetchJson<RecoveryReadiness>(`${APP_URL}/api/auth/recovery-readiness`);
  if (!body || typeof body !== "object") {
    throw new VerificationError("INVALID_READINESS_RESPONSE", "Recovery readiness did not return JSON.");
  }
  return body;
}

async function readIssueState(): Promise<string> {
  const { body } = await githubJson<{ state?: string }>(`/issues/${ISSUE_NUMBER}`);
  return body.state ?? "unknown";
}

async function readMainSha(): Promise<string> {
  const { body } = await githubJson<{ sha?: string }>("/commits/main");
  if (!body.sha) {
    throw new VerificationError("MAIN_SHA_UNAVAILABLE", "GitHub main did not return a commit SHA.");
  }
  return body.sha;
}

async function verifyDeployment(mainSha: string, env: Record<string, string>) {
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", env.VERCEL_PROJECT_ID);
  url.searchParams.set("teamId", env.VERCEL_ORG_ID);
  url.searchParams.set("target", "production");
  url.searchParams.set("limit", "20");

  const { body } = await fetchJson<{ deployments?: VercelDeployment[] }>(url.toString(), {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
  });

  const deployment = body.deployments?.find((candidate) => {
    const state = candidate.state ?? candidate.readyState;
    return state === "READY" && candidate.meta?.githubCommitSha === mainSha;
  });

  if (!deployment?.uid || !deployment.url) {
    throw new VerificationError(
      "CANONICAL_DEPLOYMENT_NOT_READY",
      "No READY production deployment matches GitHub main.",
      { mainSha },
    );
  }

  return {
    id: deployment.uid,
    url: `https://${deployment.url}`,
    sha: mainSha,
  };
}

async function verifyPublicSurfaces() {
  const pages = ["/forgot-password", "/reset-password", "/client-login"];
  const results: Record<string, number> = {};

  for (const path of pages) {
    const response = await fetch(`${APP_URL}${path}`, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    results[path] = response.status;
    if (response.status !== 200) {
      throw new VerificationError("PUBLIC_SURFACE_SMOKE_FAILED", `${path} returned HTTP ${response.status}.`, {
        path,
        status: response.status,
      });
    }
  }

  const session = await fetch(`${APP_URL}/api/auth/session`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  results["/api/auth/session"] = session.status;
  if (![401, 403].includes(session.status)) {
    throw new VerificationError(
      "SESSION_BOUNDARY_FAILED",
      `/api/auth/session returned HTTP ${session.status} without authentication.`,
    );
  }

  const protectedApi = await fetch(`${APP_URL}/api/admin/users`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  results["/api/admin/users"] = protectedApi.status;
  if (![401, 403, 404].includes(protectedApi.status)) {
    throw new VerificationError(
      "PROTECTED_API_BOUNDARY_FAILED",
      `Protected API returned HTTP ${protectedApi.status} without authentication.`,
    );
  }

  return results;
}

function normalizeRecoveryResponse(value: JsonObject): JsonObject {
  const { requestId: _requestId, timestamp: _timestamp, ...rest } = value;
  return Object.fromEntries(Object.entries(rest).sort(([left], [right]) => left.localeCompare(right)));
}

async function requestRecovery(email: string): Promise<JsonObject> {
  const { body } = await fetchJson<JsonObject>(`${APP_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return body;
}

async function verifyNonEnumeration() {
  const unknownEmail = `recovery-watch-${Date.now()}@example.invalid`;
  const unknown = await requestRecovery(unknownEmail);
  const known = await requestRecovery(ADMIN_RECOVERY_EMAIL);

  for (const response of [unknown, known]) {
    if (response.success !== true || response.delivery !== "requested") {
      throw new VerificationError(
        "RECOVERY_REQUEST_NOT_ACCEPTED",
        "Canonical recovery did not return the expected accepted response.",
      );
    }
  }

  const unknownNormalized = normalizeRecoveryResponse(unknown);
  const knownNormalized = normalizeRecoveryResponse(known);
  if (JSON.stringify(unknownNormalized) !== JSON.stringify(knownNormalized)) {
    throw new VerificationError(
      "RECOVERY_ENUMERATION_DETECTED",
      "Known and unknown recovery responses were distinguishable.",
    );
  }

  return {
    unknownEmailResponseMatched: true,
    controlledAdminRequestAccepted: true,
  };
}

async function verifyDatabaseIntegrity() {
  const rows = await db.$queryRaw<DatabaseIntegrityRow[]>`
    SELECT
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'sessionVersion'
          AND data_type = 'integer'
      ) AS "sessionVersionPresent",
      (
        SELECT count(*)::integer
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_proc p ON p.oid = t.tgfoid
        WHERE n.nspname = 'public'
          AND c.relname = 'users'
          AND NOT t.tgisinternal
          AND t.tgenabled <> 'D'
          AND (
            (t.tgname = 'gem_increment_session_version_on_password_change'
              AND p.proname = 'gem_increment_session_version_on_password_change')
            OR
            (t.tgname = 'gem_audit_session_revocation_on_password_change'
              AND p.proname = 'gem_audit_session_revocation_on_password_change')
          )
      ) AS "triggerCount",
      NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) privilege
        LEFT JOIN pg_roles role ON role.oid = privilege.grantee
        WHERE n.nspname = 'public'
          AND p.proname IN (
            'gem_increment_session_version_on_password_change',
            'gem_audit_session_revocation_on_password_change'
          )
          AND privilege.privilege_type = 'EXECUTE'
          AND (privilege.grantee = 0 OR role.rolname IN ('anon', 'authenticated'))
      ) AS "privilegesRevoked"
  `;

  const row = rows[0];
  if (!row?.sessionVersionPresent || Number(row.triggerCount) !== 2 || !row.privilegesRevoked) {
    throw new VerificationError(
      "DATABASE_RECOVERY_INTEGRITY_FAILED",
      "Password-change session revocation integrity checks did not pass.",
      {
        sessionVersionPresent: row?.sessionVersionPresent ?? false,
        triggerCount: Number(row?.triggerCount ?? 0),
        privilegesRevoked: row?.privilegesRevoked ?? false,
      },
    );
  }

  return {
    sessionVersionPresent: true,
    triggerCount: 2,
    privilegesRevoked: true,
  };
}

async function verifyRetiredGateway(env: Record<string, string>) {
  const { body: functions } = await fetchJson<Array<{ slug?: string; version?: number | string }>>(
    `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/functions`,
    { headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}` } },
  );

  const recoveryFunction = functions.find((candidate) => candidate.slug === "gem-password-recovery");
  const version = Number(recoveryFunction?.version ?? 0);
  if (!Number.isFinite(version) || version < 10) {
    throw new VerificationError(
      "RECOVERY_GATEWAY_VERSION_INVALID",
      `gem-password-recovery version ${version} is below 10.`,
    );
  }

  const { status, body } = await fetchJson<JsonObject>(
    `https://${env.SUPABASE_PROJECT_REF}.supabase.co/functions/v1/gem-password-recovery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        apikey: env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: "{}",
    },
    [410],
  );

  const allowedKeys = new Set(["code", "error", "message", "recoveryUrl"]);
  const unexpectedKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));
  if (
    status !== 410 ||
    body.code !== "RECOVERY_GATEWAY_DISABLED" ||
    body.recoveryUrl !== CANONICAL_RECOVERY_URL ||
    unexpectedKeys.length > 0
  ) {
    throw new VerificationError(
      "RECOVERY_GATEWAY_RETIREMENT_FAILED",
      "The retired Supabase recovery gateway returned an unexpected response.",
      { status, unexpectedKeys },
    );
  }

  return {
    version,
    status,
    code: body.code,
    recoveryUrl: body.recoveryUrl,
  };
}

function parseRuntimeLogEntries(text: string): JsonObject[] {
  if (!text.trim()) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is JsonObject => Boolean(item) && typeof item === "object");
    if (parsed && typeof parsed === "object") return [parsed as JsonObject];
  } catch {
    // Vercel's log endpoint can return newline-delimited JSON.
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        return parsed && typeof parsed === "object" ? [parsed as JsonObject] : [];
      } catch {
        return [];
      }
    });
}

async function verifyRuntimeLogs(deploymentId: string, env: Record<string, string>) {
  const url = new URL(
    `https://api.vercel.com/v1/projects/${env.VERCEL_PROJECT_ID}/deployments/${deploymentId}/runtime-logs`,
  );
  url.searchParams.set("teamId", env.VERCEL_ORG_ID);
  url.searchParams.set("since", String(Date.now() - RUNTIME_LOG_WINDOW_MS));
  url.searchParams.set("limit", "100");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new VerificationError(
      "RUNTIME_LOG_INSPECTION_FAILED",
      `Vercel runtime-log inspection returned HTTP ${response.status}.`,
    );
  }

  const entries = parseRuntimeLogEntries(text);
  const errors = entries.filter((entry) => {
    const level = String(entry.level ?? entry.type ?? "").toLowerCase();
    const status = Number(entry.responseStatusCode ?? entry.statusCode ?? entry.status ?? 0);
    const message = String(entry.message ?? entry.text ?? "");
    return (
      level === "error" ||
      level === "fatal" ||
      status >= 500 ||
      /(^|[^a-z])(fatal|uncaught|unhandled|runtime error)([^a-z]|$)/i.test(message)
    );
  });

  if (errors.length > 0) {
    throw new VerificationError(
      "PRODUCTION_RUNTIME_ERRORS_FOUND",
      "Production runtime errors were found in the inspected window.",
      { count: errors.length },
    );
  }

  return {
    windowMinutes: RUNTIME_LOG_WINDOW_MS / 60_000,
    entriesInspected: entries.length,
    errorEntries: 0,
  };
}

async function publishEvidenceAndCloseIssue(evidence: JsonObject) {
  const body = [
    "Canonical password-recovery activation verification passed.",
    "",
    `- Deployment SHA: \`${String(evidence.deploymentSha)}\``,
    `- Deployment ID: \`${String(evidence.deploymentId)}\``,
    `- Mail readiness: \`${JSON.stringify(evidence.mailReadiness)}\``,
    "- Canonical production deployment: READY and matched GitHub `main`",
    "- Public pages: `/forgot-password`, `/reset-password`, and `/client-login` passed",
    "- Authentication boundaries: `/api/auth/session` and an unauthenticated protected API passed",
    "- Unknown-email recovery: non-enumerating",
    "- Controlled admin recovery request: accepted",
    "- Production runtime inspection: no error or fatal entry found",
    "- Supabase `users.sessionVersion`: intact",
    "- Password-change revocation triggers: intact",
    "- Direct trigger-function privileges: still revoked",
    `- \`gem-password-recovery\`: version ${String(evidence.gatewayVersion)}`,
    "- Retired gateway: returned only `RECOVERY_GATEWAY_DISABLED` through the canonical recovery URL",
  ].join("\n");

  await githubJson(`/issues/${ISSUE_NUMBER}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  }, [201]);

  await githubJson(`/issues/${ISSUE_NUMBER}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "closed", state_reason: "completed" }),
  });
}

async function handle(request: NextRequest) {
  const expected = configured("RECOVERY_WATCH_SECRET") || configured("CRON_SECRET");
  const supplied = bearer(request);
  if (expected.length < 32 || !supplied || !secureEqual(supplied, expected)) {
    return json({ error: "Unauthorized internal job." }, 401);
  }

  try {
    const readiness = await readPublicReadiness();
    if (readiness.emailDeliveryConfigured !== true) {
      return json({
        ok: true,
        notified: false,
        issueClosed: false,
        reason: "EMAIL_DELIVERY_NOT_READY",
      });
    }

    const env = requireEnvironment([
      "GITHUB_RECOVERY_WATCH_TOKEN",
      "VERCEL_TOKEN",
      "VERCEL_ORG_ID",
      "VERCEL_PROJECT_ID",
      "SUPABASE_ACCESS_TOKEN",
      "SUPABASE_PROJECT_REF",
      "SUPABASE_ANON_KEY",
    ]);

    const issueState = await readIssueState();
    if (issueState !== "open") {
      return json({ ok: true, notified: false, issueClosed: true, reason: "ISSUE_ALREADY_CLOSED" });
    }

    const mainSha = await readMainSha();
    const deployment = await verifyDeployment(mainSha, env);
    const publicSurfaces = await verifyPublicSurfaces();
    const database = await verifyDatabaseIntegrity();
    const gateway = await verifyRetiredGateway(env);
    const recovery = await verifyNonEnumeration();
    const runtimeLogs = await verifyRuntimeLogs(deployment.id, env);

    const evidence = {
      deploymentSha: deployment.sha,
      deploymentId: deployment.id,
      mailReadiness: readiness,
      publicSurfaces,
      database,
      gatewayVersion: gateway.version,
      gateway,
      recovery,
      runtimeLogs,
    };

    await publishEvidenceAndCloseIssue(evidence);

    return json({
      ok: true,
      notified: true,
      issueClosed: true,
      ...evidence,
    });
  } catch (error) {
    const verification = error instanceof VerificationError ? error : null;
    console.error("[recovery-readiness-watch] verification did not pass", {
      code: verification?.code ?? "RECOVERY_WATCH_UNEXPECTED_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      details: verification?.details ?? {},
    });

    return json(
      {
        ok: false,
        notified: false,
        issueClosed: false,
        code: verification?.code ?? "RECOVERY_WATCH_UNEXPECTED_ERROR",
        error: "Recovery readiness verification did not pass.",
      },
      503,
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
