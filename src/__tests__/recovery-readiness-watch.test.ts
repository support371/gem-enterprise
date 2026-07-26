import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const dbMocks = vi.hoisted(() => ({
  db: {
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
    auditLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mailMocks = vi.hoisted(() => ({
  verify: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: dbMocks.db }));
vi.mock("@/lib/mail/send", () => ({
  verifyMailTransport: mailMocks.verify,
}));

import {
  GET,
  POST,
  recoveryWatchTestables,
} from "@/app/api/internal/recovery-readiness-watch/route";

const CRON_SECRET = "c".repeat(40);
const RECOVERY_SECRET = "r".repeat(40);

function request(method: "GET" | "POST", token?: string) {
  return new NextRequest(
    "http://localhost/api/internal/recovery-readiness-watch",
    {
      method,
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    },
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("canonical recovery readiness watch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    process.env.CRON_SECRET = CRON_SECRET;
    process.env.RECOVERY_WATCH_SECRET = "";
    process.env.GITHUB_RECOVERY_WATCH_TOKEN = "github-test-token";
  });

  it("rejects unauthenticated requests before any network or database work", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request("GET"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized internal job." });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(dbMocks.db.$transaction).not.toHaveBeenCalled();
  });

  it("accepts CRON_SECRET even when a dedicated recovery secret is configured", () => {
    process.env.RECOVERY_WATCH_SECRET = RECOVERY_SECRET;

    expect(recoveryWatchTestables.isAuthorized(request("GET", CRON_SECRET))).toBe(true);
    expect(recoveryWatchTestables.isAuthorized(request("GET", RECOVERY_SECRET))).toBe(true);
  });

  it("returns a silent no-op while mail delivery is not ready", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ok: true,
        emailDeliveryConfigured: false,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request("POST", CRON_SECRET));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      notified: false,
      issueClosed: false,
      reason: "EMAIL_DELIVERY_NOT_READY",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dbMocks.db.$transaction).not.toHaveBeenCalled();
    expect(mailMocks.verify).not.toHaveBeenCalled();
  });

  it("fails closed before sending when SMTP transport verification fails", async () => {
    mailMocks.verify.mockResolvedValue({
      ok: false,
      code: "SMTP_AUTH_FAILED",
      readiness: {
        configured: true,
        missing: [],
        portValid: true,
        secureSettingValid: true,
        senderConfigured: true,
        replyToConfigured: true,
        transportSecurity: "starttls",
      },
    });

    await expect(
      recoveryWatchTestables.verifyControlledRecovery({} as never),
    ).rejects.toMatchObject({ code: "SMTP_TRANSPORT_NOT_VERIFIED" });
  });

  it("rejects malformed runtime-log records instead of certifying an empty result", () => {
    expect(() =>
      recoveryWatchTestables.parseRuntimeLogEntries(
        '{"level":"error","message":"missing required fields"}',
      ),
    ).toThrowError(/unexpected schema/i);

    expect(() =>
      recoveryWatchTestables.parseRuntimeLogEntries(
        '{"timestampInMs":123,"level":"info","source":"serverless","message":"ok"}\nnot-json',
      ),
    ).toThrowError(/malformed runtime-log record/i);
  });

  it("publishes exact evidence and closes the issue only after the success path", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ id: 1 }, 201))
      .mockResolvedValueOnce(jsonResponse({ state: "closed" }));
    vi.stubGlobal("fetch", fetchMock);

    await recoveryWatchTestables.publishEvidenceAndCloseIssue({
      deploymentSha: "abc123",
      deploymentId: "dpl_test",
      mailReadiness: { emailDeliveryConfigured: true },
      database: {
        sessionVersionPresent: true,
        operationalTriggerCount: 2,
        privilegesRevoked: true,
      },
      gateway: { version: 10 },
      runtimeLogs: { entriesInspected: 4 },
      recovery: {
        timingDeltaMs: 12,
        timingRatio: 1.1,
        smtpTransport: "SMTP_VERIFIED",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const commentRequest = fetchMock.mock.calls[1];
    const closeRequest = fetchMock.mock.calls[2];
    expect(commentRequest[1]).toMatchObject({ method: "POST" });
    expect(String(commentRequest[1]?.body)).toContain(
      "gem-recovery-watch:abc123",
    );
    expect(closeRequest[1]).toMatchObject({ method: "PATCH" });
    expect(String(closeRequest[1]?.body)).toContain('"state":"closed"');
  });
});
