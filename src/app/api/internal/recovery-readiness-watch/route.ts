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
const EXPECTED_GITHUB_COMMENT_AUTHOR = "support371";
const RUNTIME_LOG_WINDOW_MS = 60 * 60 * 1000;
const ACTIVATION_RESOURCE = "password_recovery_activation";
const ACTIVATION_LOCK_KEY = 371_200;
const UNKNOWN_TIMING_SAMPLE_COUNT = 2;
const TIMING_DELTA_LIMIT_MS = 400;
const TIMING_RATIO_LIMIT = 1.25;
const EXPECTED_RESPONSE_TIMING_FLOOR_MS = 2_000;

type JsonObject = Record<string, unknown>;
type RecoveryReadiness = JsonObject & { emailDeliveryConfigured?: boolean };
type VercelDeployment = {
  id?: string;
  uid?: string;
  url?: string;
  state?: string;
  readyState?: string;
  target?: string;
  alias?: string[];
  project?: { id?: string };
  meta?: { githubCommitSha?: string; githubCommitRef?: string };
};
type DatabaseIntegrityRow = {
  sessionVersionPresent: boolean;
  triggerCount: number;
  privilegesRevoked: boolean;
};
type LockRow = { locked: boolean };

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
  const acceptedSecrets = [configured("RECOVERY_WATCH_SECRET"), configured("CRON_SECRET")]
    .filter((secret) => secret.length >= 32);
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
    values[name] = configured(name);
    if (!values[name]) missing.push(name);
  }
  if (missing.length) {
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
      { url: new URL(url).origin + new URL(url).pathname, status: response.status },
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
  const { body } = await fetchJson<RecoveryReadiness>(`${APP_URL}/api/auth/recovery-readiness`);
  if (!isJsonObject(body)) {
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

async function verifyActiveCanonicalDeployment(mainSha: string, env: Record<string, string>) {
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
  return { id: deploymentId, url: `https://${body.url}`, sha: mainSha, canonicalAlias: APP_HOSTNAME };
}

async function verifyPublicSurfaces() {
  const pages = ["/forgot-password", "/reset-password", "/client-login"];
  const results: Record<string, number> = {};
  for (const path of pages) {
    const expected = new URL(path, APP_URL);
    const response = await fetch(expected, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });
    const actual = new URL(response.url);
    results[path] = response.status;
    if (
      response.status !== 200 ||
      response.redirected ||
      actual.origin !== expected.origin ||
      actual.pathname !== expected.pathname
    ) {
      throw new VerificationError(
        "PUBLIC_SURFACE_SMOKE_FAILED",
        `${path} did not serve directly from its canonical path.`,
        {
          path,
          status: response.status,
          redirected: response.redirected,
          canonicalPathMatched: actual.origin === expected.origin && actual.pathname === expected.pathname,
        },
      );
    }
  }

  const session = await fetch(`${APP_URL}/api/auth/session`, {
    cache: "no-store",
    redirect: "manual",
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
    redirect: "manual",
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
  if (!identity.includes(supabaseProjectRef.toLowerCase())) {
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
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'sessionVersion'
          AND data_type = 'integer'
      ) AS "sessionVersionPresent",
      (
        SELECT count(*)::integer
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace table_ns ON table_ns.oid = c.relnamespace
        JOIN pg_proc p ON p.oid = t.tgfoid
        JOIN pg_namespace function_ns ON function_ns.oid = p.pronamespace
        WHERE table_ns.nspname = 'public'
          AND c.relname = 'users'
          AND function_ns.nspname = 'public'
          AND p.prosecdef
          AND NOT t.tgisinternal
          AND t.tgenabled IN ('O', 'A')
          AND (
            (
              t.tgname = 'gem_increment_session_version_on_password_change'
              AND p.proname = 'gem_increment_session_version_on_password_change'
              AND pg_get_triggerdef(t.oid) ~* 'BEFORE UPDATE OF "passwordHash"'
              AND pg_get_functiondef(p.oid) ~* 'IF NEW\."passwordHash" IS DISTINCT FROM OLD\."passwordHash"'
              AND pg_get_functiondef(p.oid) ~* 'NEW\."sessionVersion" := COALESCE\(OLD\."sessionVersion", 1\) \+ 1'
            ) OR (
              t.tgname = 'gem_audit_session_revocation_on_password_change'
              AND p.proname = 'gem_audit_session_revocation_on_password_change'
              AND pg_get_triggerdef(t.oid) ~* 'AFTER UPDATE OF "passwordHash"'
              AND pg_get_functiondef(p.oid) ~* 'INSERT INTO public\.audit_logs'
              AND pg_get_functiondef(p.oid) ~* 'password_change'
              AND pg_get_functiondef(p.oid) ~* 'sessionRevoked'
            )
          )
      ) AS "triggerCount",
      NOT (
        has_function_privilege(
          'anon',
          'public.gem_increment_session_version_on_password_change()',
          'EXECUTE'
        ) OR has_function_privilege(
          'authenticated',
          'public.gem_increment_session_version_on_password_change()',
          'EXECUTE'
        ) OR has_function_privilege(
          'anon',
          'public.gem_audit_session_revocation_on_password_change()',
          'EXECUTE'
        ) OR has_function_privilege(
          'authenticated',
          'public.gem_audit_session_revocation_on_password_change()',
          'EXECUTE'
        )
      ) AS "privilegesRevoked"
  `;
  const row = rows[0];
  if (!row?.sessionVersionPresent || Number(row.triggerCount) !== 2 || !row.privilegesRevoked) {
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
    triggerFunctions: "public_security_definer_expected_semantics",
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
    unexpectedKeys.length
  ) {
    throw new VerificationError(
      "RECOVERY_GATEWAY_RETIREMENT_FAILED",
      "The retired Supabase recovery gateway returned an unexpected response.",
      { status, unexpectedKeys },
    );
  }
  return { version, status, code: body.code, recoveryUrl: body.recoveryUrl };
}

function validateRuntimeLogEntry(value: unknown, index: number): JsonObject {
  if (!isJsonObject(value)) {
    throw new VerificationError(
      "RUNTIME_LOG_RESPONSE_UNPARSEABLE",
      "Vercel returned a non-object runtime-log record.",
      { recordIndex: index },
    );
  }
  const timestamp = Number(value.timestampInMs);
  if (
    !Number.isFinite(timestamp) ||
    typeof value.level !== "string" ||
    typeof value.source !== "string" ||
    typeof value.message !== "string"
  ) {
    throw new VerificationError(
      "RUNTIME_LOG_RESPONSE_INVALID",
      "Vercel returned a runtime-log record with an unexpected schema.",
      { recordIndex: index },
    );
  }
  return value;
}

function parseRuntimeLogEntries(text: string): JsonObject[] {
  if (!text.trim()) return [];
  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) return parsed.map(validateRuntimeLogEntry);
    return [validateRuntimeLogEntry(parsed, 0)];
  } catch (error) {
    if (error instanceof VerificationError) throw error;
  }
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.map((line, index) => {
    const candidate = line.startsWith("data:") ? line.slice("data:".length).trim() : line;
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate) as unknown;
    } catch {
      throw new VerificationError(
        "RUNTIME_LOG_RESPONSE_UNPARSEABLE",
        "Vercel returned a malformed runtime-log record.",
        { recordIndex: index },
      );
    }
    return validateRuntimeLogEntry(parsed, index);
  });
}

async function verifyRuntimeLogs(deploymentId: string, env: Record<string, string>) {
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
  const entries = parseRuntimeLogEntries(text).filter(
    (entry) => Number(entry.timestampInMs) >= windowStart,
  );
  const errors = entries.filter((entry) => {
    const level = String(entry.level).toLowerCase();
    const status = Number(entry.responseStatusCode ?? 0);
    const message = String(entry.message);
    return (
      level === "error" ||
      level === "fatal" ||
      status >= 500 ||
      /(^|[^a-z])(fatal|uncaught|unhandled|runtime error)([^a-z]|$)/i.test(message)
    );
  });
  if (errors.length) {
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
  return { status, body, elapsedMs: Math.round(performance.now() - startedAt) };
}

function auditMetadata(value: Prisma.JsonValue | null): JsonObject {
  return isJsonObject(value) ? value : {};
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function timingIsComparable(unknownSamplesMs: number[], knownMs: number) {
  const unknownBaselineMs = median(unknownSamplesMs);
  const slower = Math.max(unknownBaselineMs, knownMs);
  const faster = Math.max(1, Math.min(unknownBaselineMs, knownMs));
  const delta = Math.abs(unknownBaselineMs - knownMs);
  const ratio = slower / faster;
  return {
    passed: delta <= TIMING_DELTA_LIMIT_MS && ratio <= TIMING_RATIO_LIMIT,
    unknownBaselineMs: Math.round(unknownBaselineMs),
    deltaMs: Math.round(delta),
    ratio: Number(ratio.toFixed(2)),
  };
}

async function verifyControlledRecovery(tx: Prisma.TransactionClient): Promise<JsonObject> {
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

  const unknownSamples = [];
  for (let index = 0; index < UNKNOWN_TIMING_SAMPLE_COUNT; index += 1) {
    unknownSamples.push(
      await requestRecovery(`recovery-watch-${Date.now()}-${index}@example.invalid`),
    );
  }
  const deliveryStartedAt = new Date();
  const known = await requestRecovery(ADMIN_RECOVERY_EMAIL);
  const responses = [...unknownSamples, known];
  for (const response of responses) {
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
  const knownNormalized = JSON.stringify(normalizeRecoveryResponse(known.body));
  if (
    unknownSamples.some(
      (sample) => JSON.stringify(normalizeRecoveryResponse(sample.body)) !== knownNormalized,
    )
  ) {
    throw new VerificationError(
      "RECOVERY_ENUMERATION_DETECTED",
      "Known and unknown recovery responses were distinguishable.",
    );
  }
  const unknownElapsedMs = unknownSamples.map((sample) => sample.elapsedMs);
  const timing = timingIsComparable(unknownElapsedMs, known.elapsedMs);
  if (!timing.passed) {
    throw new VerificationError(
      "RECOVERY_TIMING_ENUMERATION_RISK",
      "Known and unknown recovery timing exceeded the fail-closed comparison thresholds.",
      {
        unknownElapsedMs,
        knownElapsedMs: known.elapsedMs,
        unknownBaselineMs: timing.unknownBaselineMs,
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
    deliveryMetadata.canonicalOrigin !== APP_URL ||
    Number(deliveryMetadata.responseTimingFloorMs) < EXPECTED_RESPONSE_TIMING_FLOOR_MS
  ) {
    throw new VerificationError(
      "CONTROLLED_RECOVERY_DELIVERY_NOT_ACCEPTED",
      "The controlled administrator recovery request lacks provider-acceptance and timing-floor audit evidence.",
      {
        auditFound: Boolean(deliveryAudit),
        delivery: deliveryMetadata.delivery ?? null,
        responseTimingFloorMs: deliveryMetadata.responseTimingFloorMs ?? null,
      },
    );
  }
  return {
    responseBodiesMatched: true,
    responseStatusesMatched: true,
    timingThresholdPassed: true,
    unknownSamplesMs: unknownElapsedMs,
    unknownBaselineMs: timing.unknownBaselineMs,
    knownElapsedMs: known.elapsedMs,
    timingDeltaMs: timing.deltaMs,
    timingRatio: timing.ratio,
    responseTimingFloorMs: deliveryMetadata.responseTimingFloorMs,
    smtpTransport: transport.code,
    providerAccepted: true,
    controlledAdminRequestAccepted: true,
  };
}

async function prepareAuditedEvidence(mainSha: string, baseEvidence: JsonObject) {
  return db.$transaction(
    async (tx) => {
      const lockRows = await tx.$queryRaw<LockRow[]>`
        SELECT pg_try_advisory_xact_lock(${ACTIVATION_LOCK_KEY}) AS locked
      `;
      if (!lockRows[0]?.locked) {
        return { busy: true as const, issueClosed: false as const, evidence: null };
      }
      if ((await readIssueState()) !== "open") {
        return { busy: false as const, issueClosed: true as const, evidence: null };
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
        existingMetadata.decision === "ready_to_close" && existingRecovery?.providerAccepted === true
          ? existingRecovery
          : await verifyControlledRecovery(tx);
      const evidence: JsonObject = { ...baseEvidence, recovery };

      if (!existingDecision || existingMetadata.decision !== "ready_to_close") {
        await tx.auditLog.create({
          data: {
            action: AuditAction.admin_action,
            resource: ACTIVATION_RESOURCE,
            resourceId: mainSha,
            metadata: {
              flow: "canonical_password_recovery_activation",
              decision: "ready_to_close",
              recovery,
              evidence,
            } as Prisma.InputJsonValue,
            userAgent: "gem-enterprise-recovery-watch",
          },
        });
      }
      return { evidence, busy: false as const, issueClosed: false as const };
    },
    { maxWait: 5_000, timeout: 90_000 },
  );
}

function issueEvidenceMarker(deploymentSha: string) {
  return `<!-- gem-recovery-watch:${deploymentSha} -->`;
}

async function publishEvidenceAndCloseIssue(evidence: JsonObject) {
  const deploymentSha = String(evidence.deploymentSha);
  const deploymentId = String(evidence.deploymentId);
  const marker = issueEvidenceMarker(deploymentSha);
  const { body: comments } = await githubJson<
    Array<{ body?: string; user?: { login?: string } }>
  >(`/issues/${ISSUE_NUMBER}/comments?per_page=100&sort=created&direction=desc`);
  const alreadyPublished = comments.some((comment) => {
    const body = comment.body ?? "";
    return (
      comment.user?.login === EXPECTED_GITHUB_COMMENT_AUTHOR &&
      body.includes(marker) &&
      body.includes(`Deployment SHA: \`${deploymentSha}\``) &&
      body.includes(`Deployment ID: \`${deploymentId}\``)
    );
  });
  if (!alreadyPublished) {
    const recovery = isJsonObject(evidence.recovery) ? evidence.recovery : {};
    const database = isJsonObject(evidence.database) ? evidence.database : {};
    const gateway = isJsonObject(evidence.gateway) ? evidence.gateway : {};
    const runtimeLogs = isJsonObject(evidence.runtimeLogs) ? evidence.runtimeLogs : {};
    const body = [
      marker,
      "Canonical password-recovery activation verification passed.",
      "",
      `- Deployment SHA: \`${deploymentSha}\``,
      `- Deployment ID: \`${deploymentId}\``,
      `- Mail readiness: \`${JSON.stringify(evidence.mailReadiness)}\``,
      "- Canonical production alias: READY, serving GitHub `main`, and bound to the configured Vercel project",
      "- Public pages: `/forgot-password`, `/reset-password`, and `/client-login` served directly from their canonical paths",
      "- Authentication boundaries: `/api/auth/session` and `/api/admin/users` rejected unauthenticated access",
      `- Unknown-email recovery: two unknown samples matched the known response and timing passed both bounds (delta ${String(recovery.timingDeltaMs)} ms; ratio ${String(recovery.timingRatio)})`,
      `- Canonical response timing floor: ${String(recovery.responseTimingFloorMs)} ms`,
      `- SMTP transport: \`${String(recovery.smtpTransport)}\``,
      "- Controlled admin recovery request: provider accepted, with database audit evidence",
      `- Production runtime inspection: ${String(runtimeLogs.entriesInspected)} valid records inspected; no error or fatal entry found`,
      `- Supabase \`users.sessionVersion\`: ${String(database.sessionVersionPresent)}`,
      `- Password-change revocation triggers: ${String(database.operationalTriggerCount)} operational public SECURITY DEFINER functions with expected passwordHash semantics`,
      `- Effective trigger-function privileges revoked: ${String(database.privilegesRevoked)}`,
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
  if (!isAuthorized(request)) return json({ error: "Unauthorized internal job." }, 401);
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
    if ((await readIssueState()) !== "open") {
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
    if (prepared.issueClosed || !prepared.evidence) {
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

export const recoveryWatchTestables = {
  isAuthorized,
  parseRuntimeLogEntries,
  timingIsComparable,
  verifyControlledRecovery,
  publishEvidenceAndCloseIssue,
};
