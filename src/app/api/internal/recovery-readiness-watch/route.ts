import { timingSafeEqual } from "node:crypto";
import { AuditAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMailTransport } from "@/lib/mail/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const APP_URL = "https://www.gemcybersecurityassist.com";
const APP_HOSTNAME = new URL(APP_URL).hostname;
const REPOSITORY = "support371/gem-enterprise";
const ISSUE_NUMBER = 200;
const CANONICAL_RECOVERY_URL = `${APP_URL}/forgot-password`;
const ADMIN_RECOVERY_EMAIL = "admin@gemcybersecurityassist.com";
const RUNTIME_LOG_WINDOW_MS = 60 * 60 * 1000;
const ACTIVATION_RESOURCE = "password_recovery_activation";
const ACTIVATION_LOCK_KEY = 371_200;
const TIMING_DELTA_LIMIT_MS = 1_000;
const TIMING_RATIO_LIMIT = 4;

type JsonObject = Record<string, unknown>;

type RecoveryReadiness = JsonObject & {
  emailDeliveryConfigured?: boolean;
};

type VercelDeployment = {
  id?: string;
  uid?: string;
  url?: string;
  state?: string;
  readyState?: string;
  target?: string;
  alias?: string[];
  project?: {
    id?: string;
  };
  meta?: {
    githubCommitSha?: string;
    githubCommitRef?: string;
  };
};

type DatabaseIntegrityRow = {
  sessionVersionPresent: boolean;
  triggerCount: number;
  privilegesRevoked: boolean;
};

type LockRow = {
  locked: boolean;
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

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

function isAuthorized(request: NextRequest): boolean {
  const supplied = bearer(request);
  if (!supplied) return false;

  const acceptedSecrets = [
    configured("RECOVERY_WATCH_SECRET"),
    configured("CRON_SECRET"),
  ].filter((secret) => secret.length >= 32);

  return acceptedSecrets.some((secret) => secureEqual(supplied, secret));
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
    throw new VerificationError(
      "UPSTREAM_REQUEST_FAILED",
      `Upstream request returned HTTP ${response.status}.`,
      {
        url: new URL(url).origin + new URL(url).pathname,
        status: response.status,
      },
    );
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

  return fetchJson<T>(
    `https://api.github.com/repos/${REPOSITORY}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "gem-enterprise-recovery-watch",
        ...(init.headers as Record<string, string> | undefined),
      },
    },
    allowedStatuses,
  );
}

async function readPublicReadiness(): Promise<RecoveryReadiness> {
  const { body } = await fetchJson<RecoveryReadiness>(
    `${APP_URL}/api/auth/recovery-readiness`,
  );
  if (!isJsonObject(body)) {
    throw new VerificationError(
      "INVALID_READINESS_RESPONSE",
      "Recovery readiness did not return JSON.",
    );
  }
  return body;
}

async function readIssueState(): Promise<string> {
  const { body } = await githubJson<{ state?: string }>(
    `/issues/${ISSUE_NUMBER}`,
  );
  return body.state ?? "unknown";
}

async function readMainSha(): Promise<string> {
  const { body } = await githubJson<{ sha?: string }>("/commits/main");
  if (!body.sha) {
    throw new VerificationError(
      "MAIN_SHA_UNAVAILABLE",
      "GitHub main did not return a commit SHA.",
    );
  }
  return body.sha;
}

async function verifyActiveCanonicalDeployment(
  mainSha: string,
  env: Record<string, string>,
) {
  const url = new URL(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(APP_HOSTNAME)}`,
  );
  url.searchParams.set("teamId", env.VERCEL_ORG_ID);

  const { body } = await fetchJson<VercelDeployment>(url.toString(), {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
  });

  const deploymentId = body.id ?? body.uid;
  const state = body.state ?? body.readyState;
  const aliases = body.alias ?? [];

  if (
    !deploymentId ||
    !body.url ||
    state !== "READY" ||
    body.target !== "production" ||
    body.project?.id !== env.VERCEL_PROJECT_ID ||
    body.meta?.githubCommitSha !== mainSha ||
    body.meta?.githubCommitRef !== "main" ||
    !aliases.includes(APP_HOSTNAME)
  ) {
    throw new VerificationError(
      "CANONICAL_DEPLOYMENT_NOT_READY",
      "The deployment currently serving the canonical production alias does not match GitHub main.",
      {
        mainSha,
        deploymentId: deploymentId ?? null,
        state: state ?? null,
        target: body.target ?? null,
        projectMatched: body.project?.id === env.VERCEL_PROJECT_ID,
        shaMatched: body.meta?.githubCommitSha === mainSha,
        mainBranchMatched: body.meta?.githubCommitRef === "main",
        canonicalAliasMatched: aliases.includes(APP_HOSTNAME),
      },
    );
  }

  return {
    id: deploymentId,
    url: `https://${body.url}`,
    sha: mainSha,
    canonicalAlias: APP_HOSTNAME,
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
      throw new VerificationError(
        "PUBLIC_SURFACE_SMOKE_FAILED",
        `${path} returned HTTP ${response.status}.`,
        { path, status: response.status },
      );
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
  if (![401, 403].includes(protectedApi.status)) {
    throw new VerificationError(
      "PROTECTED_API_BOUNDARY_FAILED",
      `Protected API returned HTTP ${protectedApi.status} without authentication.`,
    );
  }

  return results;
}

function verifyDatabaseBinding(supabaseProjectRef: string) {
  const databaseUrl =
    configured("POSTGRES_PRISMA_URL") ||
    configured("DATABASE_URL") ||
    configured("POSTGRES_URL") ||
    configured("NEON_DATABASE_URL");

  if (!databaseUrl) {
    throw new VerificationError(
      "PRODUCTION_DATABASE_URL_MISSING",
      "The production database URL is not configured.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new VerificationError(
      "PRODUCTION_DATABASE_URL_INVALID",
      "The production database URL is invalid.",
    );
  }

  const identity = `${parsed.hostname} ${decodeURIComponent(parsed.username)}`.toLowerCase();
  const matched = identity.includes(supabaseProjectRef.toLowerCase());
  if (!matched) {
    throw new VerificationError(
      "PRODUCTION_DATABASE_PROJECT_MISMATCH",
      "The database used by the production runtime is not bound to the configured Supabase project.",
      { projectRefMatched: false },
    );
  }

  return { projectRefMatched: true };
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
          AND t.tgenabled IN ('O', 'A')
          AND (
            (
              t.tgname = 'gem_increment_session_version_on_password_change'
              AND p.proname = 'gem_increment_session_version_on_password_change'
              AND pg_get_triggerdef(t.oid) ~* 'BEFORE UPDATE OF "passwordHash"'
            )
            OR
            (
              t.tgname = 'gem_audit_session_revocation_on_password_change'
              AND p.proname = 'gem_audit_session_revocation_on_password_change'
              AND pg_get_triggerdef(t.oid) ~* 'AFTER UPDATE OF "passwordHash"'
            )
          )
      ) AS "triggerCount",
      NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        CROSS JOIN LATERAL aclexplode(
          COALESCE(p.proacl, acldefault('f', p.proowner))
        ) privilege
        LEFT JOIN pg_roles role ON role.oid = privilege.grantee
        WHERE n.nspname = 'public'
          AND p.proname IN (
            'gem_increment_session_version_on_password_change',
            'gem_audit_session_revocation_on_password_change'
          )
          AND privilege.privilege_type = 'EXECUTE'
          AND (
            privilege.grantee = 0
            OR role.rolname IN ('anon', 'authenticated')
          )
      ) AS "privilegesRevoked"
  `;

  const row = rows[0];
  if (
    !row?.sessionVersionPresent ||
    Number(row.triggerCount) !== 2 ||
    !row.privilegesRevoked
  ) {
    throw new VerificationError(
      "DATABASE_RECOVERY_INTEGRITY_FAILED",
      "Password-change session revocation integrity checks did not pass.",
      {
        sessionVersionPresent: row?.sessionVersionPresent ?? false,
        operationalTriggerCount: Number(row?.triggerCount ?? 0),
        privilegesRevoked: row?.privilegesRevoked ?? false,
      },
    );
  }

  return {
    sessionVersionPresent: true,
    operationalTriggerCount: 2,
    triggerModes: "origin_or_always",
    triggerEvents: "passwordHash_update",
    privilegesRevoked: true,
  };
}

async function verifyRetiredGateway(env: Record<string, string>) {
  const { body: functions } = await fetchJson<
    Array<{ slug?: string; version?: number | string }>
  >(
    `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/functions`,
    { headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}` } },
  );

  const recoveryFunction = functions.find(
    (candidate) => candidate.slug === "gem-password-recovery",
  );
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
  const unexpectedKeys = Object.keys(body).filter(
    (key) => !allowedKeys.has(key),
  );
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
    if (Array.isArray(parsed)) {
      return parsed.filter(isJsonObject);
    }
    if (isJsonObject(parsed)) return [parsed];
  } catch {
    // The runtime-log endpoint normally returns newline-delimited JSON.
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const candidate = line.startsWith("data:")
        ? line.slice("data:".length).trim()
        : line;
      try {
        const parsed = JSON.parse(candidate) as unknown;
        return isJsonObject(parsed) ? [parsed] : [];
      } catch {
        return [];
      }
    });
}

async function verifyRuntimeLogs(
  deploymentId: string,
  env: Record<string, string>,
) {
  const url = new URL(
    `https://api.vercel.com/v1/projects/${env.VERCEL_PROJECT_ID}/deployments/${deploymentId}/runtime-logs`,
  );
  url.searchParams.set("teamId", env.VERCEL_ORG_ID);

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

  const windowStart = Date.now() - RUNTIME_LOG_WINDOW_MS;
  const entries = parseRuntimeLogEntries(text).filter((entry) => {
    const timestamp = Number(entry.timestampInMs ?? entry.timestamp ?? 0);
    return !Number.isFinite(timestamp) || timestamp === 0 || timestamp >= windowStart;
  });
  const errors = entries.filter((entry) => {
    const level = String(entry.level ?? entry.type ?? "").toLowerCase();
    const status = Number(
      entry.responseStatusCode ?? entry.statusCode ?? entry.status ?? 0,
    );
    const message = String(entry.message ?? entry.text ?? "");
    return (
      level === "error" ||
      level === "fatal" ||
      status >= 500 ||
      /(^|[^a-z])(fatal|uncaught|unhandled|runtime error)([^a-z]|$)/i.test(
        message,
      )
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
    source: "vercel_runtime_log_stream",
  };
}

function normalizeRecoveryResponse(value: JsonObject): JsonObject {
  const { requestId: _requestId, timestamp: _timestamp, ...rest } = value;
  return Object.fromEntries(
    Object.entries(rest).sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function requestRecovery(email: string) {
  const startedAt = performance.now();
  const { status, body } = await fetchJson<unknown>(
    `${APP_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );

  if (!isJsonObject(body)) {
    throw new VerificationError(
      "INVALID_RECOVERY_RESPONSE",
      "Canonical recovery did not return a JSON object.",
    );
  }

  return {
    status,
    body,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
}

function auditMetadata(value: Prisma.JsonValue | null): JsonObject {
  return isJsonObject(value) ? value : {};
}

function timingIsComparable(unknownMs: number, knownMs: number) {
  const slower = Math.max(unknownMs, knownMs);
  const faster = Math.max(1, Math.min(unknownMs, knownMs));
  const delta = Math.abs(unknownMs - knownMs);
  const ratio = slower / faster;
  return {
    passed: delta <= TIMING_DELTA_LIMIT_MS || ratio <= TIMING_RATIO_LIMIT,
    deltaMs: delta,
    ratio: Number(ratio.toFixed(2)),
  };
}

async function verifyControlledRecovery(
  tx: Prisma.TransactionClient,
): Promise<JsonObject> {
  const transport = await verifyMailTransport();
  if (!transport.ok) {
    throw new VerificationError(
      "SMTP_TRANSPORT_NOT_VERIFIED",
      "SMTP transport verification did not pass.",
      { code: transport.code },
    );
  }

  const admin = await tx.user.findUnique({
    where: { email: ADMIN_RECOVERY_EMAIL },
    select: { id: true, isActive: true, status: true },
  });
  if (!admin?.isActive || admin.status !== "active") {
    throw new VerificationError(
      "CONTROLLED_RECOVERY_ACCOUNT_NOT_ACTIVE",
      "The controlled administrator recovery account is not active.",
    );
  }

  const unknown = await requestRecovery(
    `recovery-watch-${Date.now()}@example.invalid`,
  );
  const deliveryStartedAt = new Date();
  const known = await requestRecovery(ADMIN_RECOVERY_EMAIL);

  for (const response of [unknown, known]) {
    if (
      response.status !== 200 ||
      response.body.success !== true ||
      response.body.delivery !== "requested"
    ) {
      throw new VerificationError(
        "RECOVERY_REQUEST_NOT_ACCEPTED",
        "Canonical recovery did not return the expected accepted response.",
      );
    }
  }

  const unknownNormalized = normalizeRecoveryResponse(unknown.body);
  const knownNormalized = normalizeRecoveryResponse(known.body);
  if (JSON.stringify(unknownNormalized) !== JSON.stringify(knownNormalized)) {
    throw new VerificationError(
      "RECOVERY_ENUMERATION_DETECTED",
      "Known and unknown recovery responses were distinguishable.",
    );
  }

  const timing = timingIsComparable(unknown.elapsedMs, known.elapsedMs);
  if (!timing.passed) {
    throw new VerificationError(
      "RECOVERY_TIMING_ENUMERATION_RISK",
      "Known and unknown recovery timing exceeded the fail-closed comparison threshold.",
      {
        unknownElapsedMs: unknown.elapsedMs,
        knownElapsedMs: known.elapsedMs,
        deltaMs: timing.deltaMs,
        ratio: timing.ratio,
      },
    );
  }

  const deliveryAudit = await tx.auditLog.findFirst({
    where: {
      userId: admin.id,
      action: AuditAction.password_change,
      resource: "auth",
      resourceId: admin.id,
      createdAt: { gte: deliveryStartedAt },
    },
    orderBy: { createdAt: "desc" },
  });
  const deliveryMetadata = auditMetadata(deliveryAudit?.metadata ?? null);
  if (
    deliveryMetadata.flow !== "forgot_password_request" ||
    deliveryMetadata.accountEligible !== true ||
    deliveryMetadata.delivery !== "sent" ||
    deliveryMetadata.canonicalOrigin !== APP_URL
  ) {
    throw new VerificationError(
      "CONTROLLED_RECOVERY_DELIVERY_NOT_ACCEPTED",
      "The controlled administrator recovery request lacks provider-acceptance audit evidence.",
      {
        auditFound: Boolean(deliveryAudit),
        delivery: deliveryMetadata.delivery ?? null,
      },
    );
  }

  return {
    responseBodiesMatched: true,
    responseStatusesMatched: true,
    timingThresholdPassed: true,
    unknownElapsedMs: unknown.elapsedMs,
    knownElapsedMs: known.elapsedMs,
    timingDeltaMs: timing.deltaMs,
    timingRatio: timing.ratio,
    smtpTransport: transport.code,
    providerAccepted: true,
    controlledAdminRequestAccepted: true,
  };
}

async function prepareAuditedEvidence(
  mainSha: string,
  baseEvidence: JsonObject,
) {
  return db.$transaction(
    async (tx) => {
      const lockRows = await tx.$queryRaw<LockRow[]>`
        SELECT pg_try_advisory_xact_lock(${ACTIVATION_LOCK_KEY}) AS locked
      `;
      if (!lockRows[0]?.locked) {
        return { busy: true as const };
      }

      const currentIssueState = await readIssueState();
      if (currentIssueState !== "open") {
        return { issueClosed: true as const };
      }

      const currentMainSha = await readMainSha();
      if (currentMainSha !== mainSha) {
        throw new VerificationError(
          "MAIN_CHANGED_DURING_VERIFICATION",
          "GitHub main changed while recovery activation was being verified.",
          { initialMainSha: mainSha, currentMainSha },
        );
      }

      const existingDecision = await tx.auditLog.findFirst({
        where: {
          action: AuditAction.admin_action,
          resource: ACTIVATION_RESOURCE,
          resourceId: mainSha,
        },
        orderBy: { createdAt: "desc" },
      });
      const existingMetadata = auditMetadata(existingDecision?.metadata ?? null);
      const existingRecovery = isJsonObject(existingMetadata.recovery)
        ? existingMetadata.recovery
        : null;

      const recovery =
        existingMetadata.decision === "ready_to_close" &&
        existingRecovery?.providerAccepted === true
          ? existingRecovery
          : await verifyControlledRecovery(tx);

      const evidence: JsonObject = {
        ...baseEvidence,
        recovery,
      };

      if (!existingDecision || existingMetadata.decision !== "ready_to_close") {
        await tx.auditLog.create({
          data: {
            action: AuditAction.admin_action,
            resource: ACTIVATION_RESOURCE,
            resourceId: mainSha,
            metadata: {
              flow: "canonical_password_recovery_activation",
              decision: "ready_to_close",
              evidence,
            } as Prisma.InputJsonValue,
            userAgent: "gem-enterprise-recovery-watch",
          },
        });
      }

      return { evidence, busy: false as const, issueClosed: false as const };
    },
    {
      maxWait: 5_000,
      timeout: 90_000,
    },
  );
}

function issueEvidenceMarker(deploymentSha: string) {
  return `<!-- gem-recovery-watch:${deploymentSha} -->`;
}

async function publishEvidenceAndCloseIssue(evidence: JsonObject) {
  const deploymentSha = String(evidence.deploymentSha);
  const marker = issueEvidenceMarker(deploymentSha);
  const { body: comments } = await githubJson<Array<{ body?: string }>>(
    `/issues/${ISSUE_NUMBER}/comments?per_page=100&sort=created&direction=desc`,
  );

  const alreadyPublished = comments.some((comment) =>
    comment.body?.includes(marker),
  );

  if (!alreadyPublished) {
    const recovery = isJsonObject(evidence.recovery) ? evidence.recovery : {};
    const database = isJsonObject(evidence.database) ? evidence.database : {};
    const gateway = isJsonObject(evidence.gateway) ? evidence.gateway : {};
    const runtimeLogs = isJsonObject(evidence.runtimeLogs)
      ? evidence.runtimeLogs
      : {};

    const body = [
      marker,
      "Canonical password-recovery activation verification passed.",
      "",
      `- Deployment SHA: \`${deploymentSha}\``,
      `- Deployment ID: \`${String(evidence.deploymentId)}\``,
      `- Mail readiness: \`${JSON.stringify(evidence.mailReadiness)}\``,
      "- Canonical production alias: READY, serving GitHub `main`, and bound to the configured Vercel project",
      "- Public pages: `/forgot-password`, `/reset-password`, and `/client-login` passed",
      "- Authentication boundaries: `/api/auth/session` and `/api/admin/users` rejected unauthenticated access",
      `- Unknown-email recovery: body/status matched and timing threshold passed (delta ${String(recovery.timingDeltaMs)} ms; ratio ${String(recovery.timingRatio)})`,
      `- SMTP transport: \`${String(recovery.smtpTransport)}\``,
      "- Controlled admin recovery request: provider accepted, with database audit evidence",
      `- Production runtime inspection: ${String(runtimeLogs.entriesInspected)} entries inspected; no error or fatal entry found`,
      `- Supabase \`users.sessionVersion\`: ${String(database.sessionVersionPresent)}`,
      `- Password-change revocation triggers: ${String(database.operationalTriggerCount)} operational origin/always triggers bound to passwordHash updates`,
      `- Direct trigger-function privileges revoked: ${String(database.privilegesRevoked)}`,
      `- \`gem-password-recovery\`: version ${String(gateway.version)}`,
      "- Retired gateway: returned only `RECOVERY_GATEWAY_DISABLED` through the canonical recovery URL",
      "- Activation decision: written to the production audit log before issue closure",
    ].join("\n");

    await githubJson(
      `/issues/${ISSUE_NUMBER}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      },
      [201],
    );
  }

  await githubJson(`/issues/${ISSUE_NUMBER}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "closed", state_reason: "completed" }),
  });
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
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
      return json({
        ok: true,
        notified: false,
        issueClosed: true,
        reason: "ISSUE_ALREADY_CLOSED",
      });
    }

    const mainSha = await readMainSha();
    const deployment = await verifyActiveCanonicalDeployment(mainSha, env);
    const publicSurfaces = await verifyPublicSurfaces();
    const databaseBinding = verifyDatabaseBinding(env.SUPABASE_PROJECT_REF);
    const database = await verifyDatabaseIntegrity();
    const gateway = await verifyRetiredGateway(env);
    const runtimeLogs = await verifyRuntimeLogs(deployment.id, env);

    const baseEvidence: JsonObject = {
      deploymentSha: deployment.sha,
      deploymentId: deployment.id,
      canonicalAlias: deployment.canonicalAlias,
      mailReadiness: readiness,
      publicSurfaces,
      databaseBinding,
      database,
      gateway,
      runtimeLogs,
    };

    const prepared = await prepareAuditedEvidence(mainSha, baseEvidence);
    if (prepared.busy) {
      return json(
        {
          ok: true,
          notified: false,
          issueClosed: false,
          reason: "VERIFICATION_ALREADY_RUNNING",
        },
        202,
      );
    }
    if (prepared.issueClosed) {
      return json({
        ok: true,
        notified: false,
        issueClosed: true,
        reason: "ISSUE_ALREADY_CLOSED",
      });
    }

    await publishEvidenceAndCloseIssue(prepared.evidence);

    return json({
      ok: true,
      notified: true,
      issueClosed: true,
      ...prepared.evidence,
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
